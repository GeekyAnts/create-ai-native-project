import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  listAgents,
  listAuth,
  listCi,
  listDatabases,
  listDocs,
  listProjectTypes,
  listSkills,
  listStacks,
  listStorage,
  listTemplates,
  readCore,
  fetchTemplate,
  type CoreSet,
  type TemplateMeta,
  type TemplateRef,
} from "../lib/templates.js";
import { composeClaudeMd } from "../lib/claudemd.js";
import { composePackageJson } from "../lib/pkgjson.js";
import { composeDockerCompose } from "../lib/compose.js";
import { composeCi } from "../lib/ci.js";
import { writeTemplateFiles, type WriteResult } from "../lib/files.js";
import { isExistingProject } from "../lib/project.js";
import { detectPackageManager, runInstall } from "../lib/install.js";
import {
  MANIFEST_FILE,
  readManifest,
  writeManifest,
  type AppEntry,
} from "../lib/manifest.js";
import { scaffoldMonorepo } from "../lib/monorepo.js";

const VERSION = "0.1.0";

export interface CreateOptions {
  /** --boot <name>: create this folder and scaffold into it. */
  boot?: string;
}

interface Option {
  value: string;
  label: string;
  hint?: string;
}

type CopyKind =
  | "project-type"
  | "stack"
  | "database"
  | "storage"
  | "auth"
  | "docker"
  | "ci"
  | "docs"
  | "skill"
  | "agent";

const toOptions = (metas: TemplateMeta[]): Option[] =>
  metas.map((m) => ({ value: m.id, label: m.name, hint: m.description }));

export async function createCommand(opts: CreateOptions): Promise<void> {
  p.intro(pc.cyan("create-ai-native-project"));

  // 1. Determine target directory + mode (new folder vs. existing project).
  let targetDir: string;
  let mode: "new" | "existing";

  if (opts.boot) {
    targetDir = resolve(opts.boot);
    mode = "new";
    await mkdir(targetDir, { recursive: true });
  } else if (await isExistingProject(resolve("."))) {
    targetDir = resolve(".");
    mode = "existing";
    const proceed = await p.confirm({
      message: `Existing project detected in ${pc.dim(targetDir)}. Add AI-native setup here?`,
      initialValue: true,
    });
    if (p.isCancel(proceed) || !proceed) return p.cancel("Cancelled.");
  } else {
    const name = await p.text({
      message: "New project folder name?",
      placeholder: "my-ai-app",
      validate: (v) => (v.trim().length === 0 ? "Name is required" : undefined),
    });
    if (p.isCancel(name)) return p.cancel("Cancelled.");
    targetDir = resolve(name);
    mode = "new";
    await mkdir(targetDir, { recursive: true });
  }

  // Awareness: if this is already an ai-native project, load its manifest so we
  // don't redo fixed choices (e.g. the project type) or re-ask what's installed.
  const existingManifest = await readManifest(targetDir);
  if (existingManifest) {
    p.log.info(
      `Detected ai-native project — type: ${pc.bold(existingManifest.projectType ?? "n/a")}` +
        (existingManifest.stacks.length
          ? `, stacks: ${existingManifest.stacks.join(", ")}`
          : ""),
    );
  }

  // 2. Load everything the registry offers.
  const spin = p.spinner();
  spin.start("Loading templates from registry…");
  let projectTypes: Option[] = [];
  let stacks: Option[] = [];
  let databases: Option[] = [];
  let storage: Option[] = [];
  let authOptions: Option[] = [];
  let ciOptions: Option[] = [];
  let docsOptions: Option[] = [];
  let skillOptions: Option[] = [];
  let agentOptions: Option[] = [];
  let dockerBaseId: string | null = null;
  let core: CoreSet = { skills: [], agents: [] };
  try {
    const [pts, sts, dbs, sto, auth, ci, dockers, docs, sk, ag, coreSet] =
      await Promise.all([
        listProjectTypes(),
        listStacks(),
        listDatabases(),
        listStorage(),
        listAuth(),
        listCi(),
        listTemplates("docker"),
        listDocs(),
        listSkills(),
        listAgents(),
        readCore(),
      ]);
    core = coreSet;
    projectTypes = toOptions(pts);
    stacks = toOptions(sts);
    databases = toOptions(dbs);
    storage = toOptions(sto);
    authOptions = toOptions(auth);
    ciOptions = toOptions(ci);
    docsOptions = toOptions(docs);
    // Core skills/agents are always installed — don't offer them in the pickers.
    skillOptions = toOptions(sk).filter((o) => !core.skills.includes(o.value));
    agentOptions = toOptions(ag).filter((o) => !core.agents.includes(o.value));
    dockerBaseId =
      dockers.find((d) => d.id === "compose")?.id ?? dockers[0]?.id ?? null;
    spin.stop("Loaded template registry.");
    if (core.skills.length || core.agents.length) {
      p.log.info(
        `Core (always installed) — skills: [${core.skills.join(", ") || "—"}], ` +
          `agents: [${core.agents.join(", ") || "—"}]`,
      );
    }
  } catch (err) {
    spin.stop(pc.yellow("Could not reach the template registry."));
    p.log.warn(String(err instanceof Error ? err.message : err));
  }

  // 3. Project type (single choice) — drives the base CLAUDE.md + package.json.
  //    Fixed once set: reuse it from the manifest instead of asking again.
  let projectType: string | null = existingManifest?.projectType ?? null;
  if (projectType) {
    p.log.info(`Project type: ${pc.bold(projectType)} (from existing project)`);
  } else if (projectTypes.length > 0) {
    const res = await p.select({
      message: "What kind of project is this?",
      options: projectTypes,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    projectType = res as string;
  }

  // Monorepo has a different shape: apps under apps/<group>/<name>/ + shared packages.
  if (projectType === "monorepo") {
    return runMonorepoFlow({
      targetDir,
      mode,
      stacks,
      databases,
      storage,
      authOptions,
      ciOptions,
      dockerBaseId,
      docsOptions,
      skillOptions,
      agentOptions,
      core,
    });
  }

  // 4. Tech stack(s), database(s), storage — each may add a CLAUDE.md section,
  //    a docker service, and setup files.
  const selectedStacks = await pickMany("tech stack(s)", stacks, false);
  if (selectedStacks === null) return p.cancel("Cancelled.");
  const selectedDatabases = await pickMany("database(s)", databases, false);
  if (selectedDatabases === null) return p.cancel("Cancelled.");
  const selectedStorage = await pickMany("storage option(s)", storage, false);
  if (selectedStorage === null) return p.cancel("Cancelled.");
  const selectedAuth = await pickMany("auth option(s)", authOptions, false);
  if (selectedAuth === null) return p.cancel("Cancelled.");

  // 5. Skills & agents.
  const selectedSkills = await pickMany("skills", skillOptions, false);
  if (selectedSkills === null) return p.cancel("Cancelled.");
  const selectedAgents = await pickMany("agents", agentOptions, false);
  if (selectedAgents === null) return p.cancel("Cancelled.");

  // 5b. Optional docs folder (e.g. Docusaurus).
  let selectedDocs: string[] = [];
  if (docsOptions.length > 0) {
    const label = docsOptions.length === 1 ? ` with ${docsOptions[0].label}` : "";
    const wantDocs = await p.confirm({
      message: `Set up a docs folder${label}?`,
      initialValue: false,
    });
    if (p.isCancel(wantDocs)) return p.cancel("Cancelled.");
    if (wantDocs) {
      if (docsOptions.length === 1) {
        selectedDocs = [docsOptions[0].value];
      } else {
        const picked = await pickMany("docs setup", docsOptions, true);
        if (picked === null) return p.cancel("Cancelled.");
        selectedDocs = picked;
      }
    }
  }

  // 5c. Optional CI configuration (single provider).
  let selectedCi: string[] = [];
  if (ciOptions.length > 0) {
    const wantCi = await p.confirm({
      message: "Add CI configuration?",
      initialValue: false,
    });
    if (p.isCancel(wantCi)) return p.cancel("Cancelled.");
    if (wantCi) {
      if (ciOptions.length === 1) {
        selectedCi = [ciOptions[0].value];
      } else {
        const res = await p.select({
          message: "Select a CI provider:",
          options: ciOptions,
        });
        if (p.isCancel(res)) return p.cancel("Cancelled.");
        selectedCi = [res as string];
      }
    }
  }

  // 5d. Optional Docker (docker-compose composed from the selections above).
  let wantDocker = false;
  if (dockerBaseId) {
    const res = await p.confirm({
      message: "Use Docker (generate a docker-compose.yml)?",
      initialValue: false,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    wantDocker = res;
  }

  const includeClaudeMd = await p.confirm({
    message: "Generate CLAUDE.md (composed from project type + selections)?",
    initialValue: true,
  });
  if (p.isCancel(includeClaudeMd)) return p.cancel("Cancelled.");

  // Refs that can contribute a CLAUDE.md section and a docker service.
  const refs: TemplateRef[] = [
    ...selectedStacks.map((id) => ({ kind: "stack" as const, id })),
    ...selectedDatabases.map((id) => ({ kind: "database" as const, id })),
    ...selectedStorage.map((id) => ({ kind: "storage" as const, id })),
    ...selectedAuth.map((id) => ({ kind: "auth" as const, id })),
  ];

  // 6. Write. In an existing project we never overwrite user files.
  const overwrite = mode === "new";
  const build = p.spinner();
  build.start("Scaffolding…");
  const result: WriteResult = { written: [], skipped: [] };
  const pkgPath = resolve(targetDir, "package.json");
  try {
    if (includeClaudeMd) {
      const claudeMd = await composeClaudeMd(projectType, refs);
      if (claudeMd) merge(result, await writeFile(targetDir, "CLAUDE.md", claudeMd, overwrite));
    }
    // Runnable scaffolding: composed package.json (deps + scripts).
    const pkgJson = await composePackageJson(basename(targetDir), projectType, selectedStacks);
    if (pkgJson) merge(result, await writeFile(targetDir, "package.json", pkgJson, overwrite));

    // Docker: compose docker-compose.yml from the selections + copy base extras.
    if (wantDocker && dockerBaseId) {
      const compose = await composeDockerCompose(dockerBaseId, refs);
      if (compose) merge(result, await writeFile(targetDir, "docker-compose.yml", compose, overwrite));
      merge(result, await copy("docker", dockerBaseId, targetDir, overwrite));
    }

    if (projectType) merge(result, await copy("project-type", projectType, targetDir, overwrite));
    for (const id of selectedStacks) merge(result, await copy("stack", id, targetDir, overwrite));
    for (const id of selectedDatabases) merge(result, await copy("database", id, targetDir, overwrite));
    for (const id of selectedStorage) merge(result, await copy("storage", id, targetDir, overwrite));
    for (const id of selectedAuth) merge(result, await copy("auth", id, targetDir, overwrite));
    // CI: compose a per-stack pipeline from the provider base + each stack's job fragment.
    const stackRefs: TemplateRef[] = selectedStacks.map((id) => ({ kind: "stack" as const, id }));
    for (const id of selectedCi) {
      const composed = await composeCi(id, stackRefs);
      if (composed) {
        merge(result, await writeFile(targetDir, composed.path, composed.contents, overwrite));
      } else {
        merge(result, await copy("ci", id, targetDir, overwrite));
      }
    }
    for (const id of selectedDocs) merge(result, await copy("docs", id, targetDir, overwrite));
    const skillsToInstall = unionStr(core.skills, selectedSkills);
    const agentsToInstall = unionStr(core.agents, selectedAgents);
    for (const id of skillsToInstall) merge(result, await copy("skill", id, targetDir, overwrite));
    for (const id of agentsToInstall) merge(result, await copy("agent", id, targetDir, overwrite));
    build.stop(`Wrote ${result.written.length} file(s).`);
  } catch (err) {
    build.stop(pc.red("Scaffolding failed."));
    p.log.error(String(err instanceof Error ? err.message : err));
    return;
  }

  if (result.skipped.length > 0) {
    p.log.warn(
      `Skipped ${result.skipped.length} existing file(s):\n` +
        result.skipped.map((f) => `  ${pc.dim(f)}`).join("\n"),
    );
  }

  // 7. Optional dependency install (only if we actually wrote package.json).
  if (result.written.includes(pkgPath)) {
    const doInstall = await p.confirm({
      message: "Install dependencies now?",
      initialValue: false,
    });
    if (!p.isCancel(doInstall) && doInstall) {
      const pm = await detectPackageManager();
      const s = p.spinner();
      s.start(`Installing dependencies with ${pm}…`);
      try {
        await runInstall(targetDir, pm);
        s.stop(`Dependencies installed with ${pm}.`);
      } catch (err) {
        s.stop(pc.yellow(`Install failed — run \`${pm} install\` manually.`));
        p.log.warn(String(err instanceof Error ? err.message : err));
      }
    }
  }

  // 8. Record project state so future runs (and Claude) know what's set up.
  const installedAgents = unionStr(selectedAgents, namesUnder(result.written, "agents", ".md"));
  const installedSkills = unionStr(selectedSkills, namesUnder(result.written, "skills"));
  await writeManifest(
    targetDir,
    {
      projectType,
      stacks: selectedStacks,
      apps: [],
      databases: selectedDatabases,
      storage: selectedStorage,
      auth: selectedAuth,
      ci: selectedCi,
      docker: wantDocker,
      docs: selectedDocs,
      skills: installedSkills,
      agents: installedAgents,
    },
    VERSION,
    new Date().toISOString(),
  );
  p.log.info(`Recorded project state in ${MANIFEST_FILE}`);

  const label = mode === "new" ? basename(targetDir) : "project";
  p.outro(pc.green(`Done! ${label} is now AI-native → ${targetDir}`));
}

const unionStr = (a: string[], b: string[]): string[] => [...new Set([...a, ...b])];

/** Extract the names installed under `.claude/<sub>/` from written paths. */
function namesUnder(paths: string[], sub: string, stripExt = ""): string[] {
  const out = new Set<string>();
  const re = new RegExp(`\\.claude/${sub}/([^/]+)`);
  for (const path of paths) {
    const m = path.replace(/\\/g, "/").match(re);
    if (m) out.add(stripExt ? m[1].replace(new RegExp(`\\${stripExt}$`), "") : m[1]);
  }
  return [...out];
}

interface MonorepoContext {
  targetDir: string;
  mode: "new" | "existing";
  stacks: Option[];
  databases: Option[];
  storage: Option[];
  authOptions: Option[];
  ciOptions: Option[];
  dockerBaseId: string | null;
  docsOptions: Option[];
  skillOptions: Option[];
  agentOptions: Option[];
  core: CoreSet;
}

const DEFAULT_GROUPS = ["frontend", "backend", "mobile"];

async function runMonorepoFlow(ctx: MonorepoContext): Promise<void> {
  const { targetDir, mode } = ctx;

  if (ctx.stacks.length === 0) {
    p.cancel("Registry has no stacks — cannot define apps.");
    return;
  }

  // Define apps: each is a stack under apps/<group>/<name>/.
  const apps: AppEntry[] = [];
  let addAnother = true;
  while (addAnother) {
    const groupChoice = await p.select({
      message: apps.length === 0 ? "Add an app — which group?" : "Next app — which group?",
      options: [
        ...DEFAULT_GROUPS.map((g) => ({ value: g, label: g })),
        { value: "__custom__", label: "Custom…" },
      ],
    });
    if (p.isCancel(groupChoice)) return p.cancel("Cancelled.");
    let group = groupChoice as string;
    if (group === "__custom__") {
      const custom = await p.text({ message: "Custom group name?", placeholder: "services" });
      if (p.isCancel(custom)) return p.cancel("Cancelled.");
      group = slugSegment(custom);
    }

    const nameInput = await p.text({
      message: `App name (under apps/${group}/)?`,
      placeholder: "website",
      validate: (v) => (v.trim().length === 0 ? "Name is required" : undefined),
    });
    if (p.isCancel(nameInput)) return p.cancel("Cancelled.");
    const name = slugSegment(nameInput);

    const stack = await p.select({
      message: `Stack for apps/${group}/${name}?`,
      options: ctx.stacks,
    });
    if (p.isCancel(stack)) return p.cancel("Cancelled.");

    apps.push({ group, name, stack: stack as string });

    const again = await p.confirm({ message: "Add another app?", initialValue: false });
    if (p.isCancel(again)) return p.cancel("Cancelled.");
    addAnother = again;
  }

  // Workspace-level selections.
  const selectedDatabases = await pickMany("database(s)", ctx.databases, false);
  if (selectedDatabases === null) return p.cancel("Cancelled.");
  const selectedStorage = await pickMany("storage option(s)", ctx.storage, false);
  if (selectedStorage === null) return p.cancel("Cancelled.");
  const selectedAuth = await pickMany("auth option(s)", ctx.authOptions, false);
  if (selectedAuth === null) return p.cancel("Cancelled.");
  const selectedSkills = await pickMany("skills", ctx.skillOptions, false);
  if (selectedSkills === null) return p.cancel("Cancelled.");
  const selectedAgents = await pickMany("agents", ctx.agentOptions, false);
  if (selectedAgents === null) return p.cancel("Cancelled.");

  let selectedDocs: string[] = [];
  if (ctx.docsOptions.length > 0) {
    const label = ctx.docsOptions.length === 1 ? ` with ${ctx.docsOptions[0].label}` : "";
    const wantDocs = await p.confirm({ message: `Set up a docs folder${label}?`, initialValue: false });
    if (p.isCancel(wantDocs)) return p.cancel("Cancelled.");
    if (wantDocs) {
      if (ctx.docsOptions.length === 1) selectedDocs = [ctx.docsOptions[0].value];
      else {
        const picked = await pickMany("docs setup", ctx.docsOptions, true);
        if (picked === null) return p.cancel("Cancelled.");
        selectedDocs = picked;
      }
    }
  }

  // CI (per-app jobs) — single provider.
  let selectedCi: string[] = [];
  if (ctx.ciOptions.length > 0) {
    const wantCi = await p.confirm({ message: "Add CI configuration (a job per app)?", initialValue: false });
    if (p.isCancel(wantCi)) return p.cancel("Cancelled.");
    if (wantCi) {
      if (ctx.ciOptions.length === 1) selectedCi = [ctx.ciOptions[0].value];
      else {
        const res = await p.select({ message: "Select a CI provider:", options: ctx.ciOptions });
        if (p.isCancel(res)) return p.cancel("Cancelled.");
        selectedCi = [res as string];
      }
    }
  }

  // Docker (per-app services + shared db/storage).
  let wantDocker = false;
  if (ctx.dockerBaseId) {
    const res = await p.confirm({ message: "Use Docker (a service per app + databases/storage)?", initialValue: false });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    wantDocker = res;
  }

  const includeClaudeMd = await p.confirm({
    message: "Generate CLAUDE.md (composed from the workspace + apps)?",
    initialValue: true,
  });
  if (p.isCancel(includeClaudeMd)) return p.cancel("Cancelled.");

  const sectionRefs: TemplateRef[] = [
    ...selectedDatabases.map((id) => ({ kind: "database" as const, id })),
    ...selectedStorage.map((id) => ({ kind: "storage" as const, id })),
    ...selectedAuth.map((id) => ({ kind: "auth" as const, id })),
  ];
  const skills = unionStr(ctx.core.skills, selectedSkills);
  const agents = unionStr(ctx.core.agents, selectedAgents);
  const overwrite = mode === "new";

  const build = p.spinner();
  build.start("Scaffolding monorepo…");
  let result;
  try {
    result = await scaffoldMonorepo(
      targetDir,
      {
        projectName: basename(targetDir),
        apps,
        sectionRefs,
        auth: selectedAuth,
        docs: selectedDocs,
        skills,
        agents,
        includeClaudeMd,
        ci: selectedCi,
        docker: wantDocker,
        dockerBaseId: ctx.dockerBaseId,
      },
      overwrite,
    );
    build.stop(`Wrote ${result.written.length} file(s) across ${apps.length} app(s).`);
  } catch (err) {
    build.stop(pc.red("Scaffolding failed."));
    p.log.error(String(err instanceof Error ? err.message : err));
    return;
  }

  if (result.skipped.length > 0) {
    p.log.warn(
      `Skipped ${result.skipped.length} existing file(s):\n` +
        result.skipped.map((f) => `  ${pc.dim(f)}`).join("\n"),
    );
  }

  await writeManifest(
    targetDir,
    {
      projectType: "monorepo",
      stacks: [...new Set(apps.map((a) => a.stack))],
      apps,
      databases: selectedDatabases,
      storage: selectedStorage,
      auth: selectedAuth,
      ci: selectedCi,
      docker: wantDocker,
      docs: selectedDocs,
      skills: unionStr(selectedSkills, namesUnder(result.written, "skills")),
      agents: unionStr(selectedAgents, namesUnder(result.written, "agents", ".md")),
    },
    VERSION,
    new Date().toISOString(),
  );
  p.log.info(`Recorded project state in ${MANIFEST_FILE}`);

  p.outro(pc.green(`Done! monorepo ready at ${targetDir} (${apps.length} app(s))`));
}

/** A safe single path segment (lowercase, dashes). */
function slugSegment(v: string): string {
  return (
    v
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "") || "app"
  );
}

async function pickMany(
  kind: string,
  options: Option[],
  required: boolean,
): Promise<string[] | null> {
  if (options.length === 0) return [];
  const res = await p.multiselect({
    message: `Select ${kind} to include:`,
    options,
    required,
  });
  if (p.isCancel(res)) return null;
  return res as string[];
}

function writeFile(
  targetDir: string,
  path: string,
  contents: string,
  overwrite: boolean,
): Promise<WriteResult> {
  return writeTemplateFiles(targetDir, [{ path, contents }], { overwrite });
}

async function copy(
  kind: CopyKind,
  id: string,
  targetDir: string,
  overwrite: boolean,
): Promise<WriteResult> {
  const files = await fetchTemplate(kind, id);
  return writeTemplateFiles(targetDir, files, { overwrite });
}

function merge(into: WriteResult, from: WriteResult): void {
  into.written.push(...from.written);
  into.skipped.push(...from.skipped);
}
