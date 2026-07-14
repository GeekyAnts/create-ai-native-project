import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  listAgents,
  listAuth,
  listCi,
  listDatabases,
  listVectorDb,
  listOrm,
  listDocs,
  listProjectTypes,
  listSkills,
  listStacks,
  listStorage,
  listTemplates,
  readCore,
  readTemplateFile,
  fetchTemplate,
  type CoreSet,
  type TemplateFile,
  type TemplateMeta,
  type TemplateRef,
} from "../lib/templates.js";
import { composeClaudeMd } from "../lib/claudemd.js";
import {
  composePackageJson,
  mergeFirstWins,
  readPkgFragment,
  type Json,
} from "../lib/pkgjson.js";
import { composeDockerCompose } from "../lib/compose.js";
import { composeCi, readCiComposeConfig } from "../lib/ci.js";
import { writeTemplateFiles, type WriteResult } from "../lib/files.js";
import { isExistingProject } from "../lib/project.js";
import { detectPackageManager, runInstall } from "../lib/install.js";
import {
  MANIFEST_FILE,
  readManifest,
  writeManifest,
  type AppEntry,
  type ProjectManifest,
} from "../lib/manifest.js";
import {
  buildAppJobBlock,
  buildAppServiceBlock,
  composeMonorepoCi,
  composeMonorepoClaudeMd,
  composeMonorepoDockerCompose,
  scaffoldMonorepo,
} from "../lib/monorepo.js";
import {
  appendBlocks,
  readIfExists,
  toBlock,
  usedHostPorts,
  type Block,
} from "../lib/augment.js";
import { slugSegment } from "../lib/names.js";
import {
  AGENTIC_TOOLS,
  installedNames,
  instructionFiles,
  normalizeTools,
  opencodeConfig,
  retargetForTools,
  type ToolId,
} from "../lib/tools.js";
import { VERSION } from "../lib/version.js";

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
  | "vector-db"
  | "orm"
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
    // --boot into a folder that already has a project must not clobber it.
    mode = (await isExistingProject(targetDir)) ? "existing" : "new";
    if (mode === "existing") {
      p.log.warn(`${pc.dim(targetDir)} already contains a project — adding to it (no overwrites).`);
    }
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

  // Which agentic coding tool(s) this project targets — drives which
  // instruction file(s) and agent/skill layouts get generated. Tools are
  // additive (the manifest never drops one), so the effective set is the union
  // of what's already recorded and what was just picked.
  const pickedTools = await pickTools(existingManifest?.tools);
  if (pickedTools === null) return p.cancel("Cancelled.");
  const priorTools = existingManifest?.tools ?? [];
  const selectedTools = normalizeTools([...priorTools, ...pickedTools]);
  const newTools = selectedTools.filter((t) => !priorTools.includes(t));

  // 2. Load everything the registry offers.
  const spin = p.spinner();
  spin.start("Loading templates from registry…");
  let projectTypes: Option[] = [];
  let stacks: Option[] = [];
  let databases: Option[] = [];
  let vectorDb: Option[] = [];
  let orm: Option[] = [];
  let storage: Option[] = [];
  let authOptions: Option[] = [];
  let ciOptions: Option[] = [];
  let docsOptions: Option[] = [];
  let skillOptions: Option[] = [];
  let agentOptions: Option[] = [];
  let dockerBaseId: string | null = null;
  let core: CoreSet = { skills: [], agents: [] };
  try {
    const [pts, sts, dbs, vdb, ormList, sto, auth, ci, dockers, docs, sk, ag, coreSet] =
      await Promise.all([
        listProjectTypes(),
        listStacks(),
        listDatabases(),
        listVectorDb(),
        listOrm(),
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
    vectorDb = toOptions(vdb);
    orm = toOptions(ormList);
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

  // On an existing ai-native project, don't re-offer what's already installed.
  // (Stacks stay offered for monorepos — several apps may share one stack.)
  if (existingManifest) {
    const has = (arr?: string[]) => (o: Option) => !(arr ?? []).includes(o.value);
    if (existingManifest.projectType !== "monorepo") {
      stacks = stacks.filter(has(existingManifest.stacks));
    }
    databases = databases.filter(has(existingManifest.databases));
    vectorDb = vectorDb.filter(has(existingManifest.vectorDb));
    orm = orm.filter(has(existingManifest.orm));
    storage = storage.filter(has(existingManifest.storage));
    authOptions = authOptions.filter(has(existingManifest.auth));
    ciOptions = ciOptions.filter(has(existingManifest.ci));
    docsOptions = docsOptions.filter(has(existingManifest.docs));
    skillOptions = skillOptions.filter(has(existingManifest.skills));
    agentOptions = agentOptions.filter(has(existingManifest.agents));
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
      tools: selectedTools,
      stacks,
      databases,
      vectorDb,
      storage,
      authOptions,
      ciOptions,
      dockerBaseId,
      docsOptions,
      skillOptions,
      agentOptions,
      core,
      existingManifest,
    });
  }

  // 4. Tech stack(s), database(s), storage — each may add a CLAUDE.md section,
  //    a docker service, and setup files.
  const selectedStacks = await pickMany("tech stack(s)", stacks, false);
  if (selectedStacks === null) return p.cancel("Cancelled.");
  const selectedDatabases = await pickMany("database(s)", databases, false);
  if (selectedDatabases === null) return p.cancel("Cancelled.");
  const selectedVectorDb = await pickMany("vector store(s)", vectorDb, false);
  if (selectedVectorDb === null) return p.cancel("Cancelled.");
  const selectedOrm = await pickMany("ORM(s)", orm, false);
  if (selectedOrm === null) return p.cancel("Cancelled.");
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

  // 5c. Optional CI configuration. On add runs, offer to extend the CI that's
  //     already installed with jobs for the newly selected stacks.
  const prevCi = existingManifest?.ci ?? [];
  let appendCiProviders: string[] = [];
  if (prevCi.length > 0 && selectedStacks.length > 0) {
    const res = await p.confirm({
      message: `Update existing CI (${prevCi.join(", ")}) with jobs for the new stack(s)?`,
      initialValue: true,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    if (res) appendCiProviders = prevCi;
  }
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

  // 5d. Optional Docker. On add runs where Docker is already set up, offer to
  //     extend docker-compose.yml with services for the new selections.
  let wantDocker = false;
  if (existingManifest?.docker) {
    const hasNew =
      selectedStacks.length +
        selectedDatabases.length +
        selectedVectorDb.length +
        selectedStorage.length >
      0;
    if (hasNew) {
      const res = await p.confirm({
        message: "Update docker-compose.yml with services for the new selections?",
        initialValue: true,
      });
      if (p.isCancel(res)) return p.cancel("Cancelled.");
      wantDocker = res;
    }
  } else if (dockerBaseId) {
    const res = await p.confirm({
      message: "Use Docker (generate a docker-compose.yml)?",
      initialValue: false,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    wantDocker = res;
  }

  const instrFiles = instructionFiles(selectedTools);
  const includeClaudeMd = await p.confirm({
    message: `Generate the instructions file (${instrFiles.join(" + ")}, composed from project type + selections)?`,
    initialValue: true,
  });
  if (p.isCancel(includeClaudeMd)) return p.cancel("Cancelled.");

  // Refs that can contribute a CLAUDE.md section and a docker service.
  const refs: TemplateRef[] = [
    ...selectedStacks.map((id) => ({ kind: "stack" as const, id })),
    ...selectedDatabases.map((id) => ({ kind: "database" as const, id })),
    ...selectedVectorDb.map((id) => ({ kind: "vector-db" as const, id })),
    ...selectedOrm.map((id) => ({ kind: "orm" as const, id })),
    ...selectedStorage.map((id) => ({ kind: "storage" as const, id })),
    ...selectedAuth.map((id) => ({ kind: "auth" as const, id })),
  ];

  // 6. Write. Setup files never overwrite user files; generator-composed files
  //    (CLAUDE.md, package.json, docker-compose.yml, CI) are APPENDED/MERGED on
  //    add runs so new selections actually land in them.
  const overwrite = mode === "new";
  const isAdd = mode === "existing";
  // Merged state = what the project already has + this run's selections; used
  // when composing a file from scratch on an add run.
  const mergedStacks = unionStr(existingManifest?.stacks ?? [], selectedStacks);
  const mergedOrm = unionStr(existingManifest?.orm ?? [], selectedOrm);
  const mergedRefs: TemplateRef[] = [
    ...mergedStacks.map((id) => ({ kind: "stack" as const, id })),
    ...unionStr(existingManifest?.databases ?? [], selectedDatabases).map((id) => ({ kind: "database" as const, id })),
    ...unionStr(existingManifest?.vectorDb ?? [], selectedVectorDb).map((id) => ({ kind: "vector-db" as const, id })),
    ...mergedOrm.map((id) => ({ kind: "orm" as const, id })),
    ...unionStr(existingManifest?.storage ?? [], selectedStorage).map((id) => ({ kind: "storage" as const, id })),
    ...unionStr(existingManifest?.auth ?? [], selectedAuth).map((id) => ({ kind: "auth" as const, id })),
  ];
  const build = p.spinner();
  build.start("Scaffolding…");
  const result: WriteResult = { written: [], skipped: [] };
  const pkgPath = resolve(targetDir, "package.json");
  try {
    // Instructions file(s): CLAUDE.md (Claude Code) and/or AGENTS.md (Codex,
    // OpenCode) — same composed content. Compose fresh, or append new sections
    // to an existing file. A newly selected tool's file is created from scratch.
    if (includeClaudeMd) {
      const composed = await composeClaudeMd(projectType, isAdd ? mergedRefs : refs);
      const blocks = await sectionBlocks(refs);
      for (const fname of instrFiles) {
        const existing = isAdd ? await readIfExists(resolve(targetDir, fname)) : null;
        if (existing === null) {
          if (composed) merge(result, await writeFile(targetDir, fname, composed, overwrite));
        } else {
          const { content, added } = appendBlocks(existing, blocks, "\n\n");
          if (added.length > 0) merge(result, await writeFile(targetDir, fname, content, true));
        }
      }
    }

    // package.json: compose fresh, or merge new stack fragments in (existing wins).
    const existingPkgRaw = isAdd ? await readIfExists(pkgPath) : null;
    if (existingPkgRaw === null) {
      const pkgJson = await composePackageJson(
        basename(targetDir),
        projectType,
        isAdd ? mergedStacks : selectedStacks,
        isAdd ? mergedOrm : selectedOrm,
      );
      if (pkgJson) merge(result, await writeFile(targetDir, "package.json", pkgJson, overwrite));
    } else {
      const updated = await mergePkgFragments(existingPkgRaw, selectedStacks, selectedOrm);
      if (updated !== null) merge(result, await writeFile(targetDir, "package.json", updated, true));
    }

    // Docker: compose fresh, or append services for the new selections.
    if (wantDocker && dockerBaseId) {
      const existing = isAdd ? await readIfExists(resolve(targetDir, "docker-compose.yml")) : null;
      if (existing === null) {
        const compose = await composeDockerCompose(dockerBaseId, isAdd ? mergedRefs : refs);
        if (compose) merge(result, await writeFile(targetDir, "docker-compose.yml", compose, overwrite));
        merge(result, await copy("docker", dockerBaseId, targetDir, overwrite, selectedTools));
      } else {
        const blocks = await fragmentBlocks(refs, "compose.service.yml");
        const { content, added } = appendBlocks(existing, blocks);
        if (added.length > 0) merge(result, await writeFile(targetDir, "docker-compose.yml", content, true));
      }
    }

    if (projectType) merge(result, await copy("project-type", projectType, targetDir, overwrite, selectedTools));
    for (const id of selectedStacks) merge(result, await copy("stack", id, targetDir, overwrite, selectedTools));
    for (const id of selectedDatabases) merge(result, await copy("database", id, targetDir, overwrite, selectedTools));
    for (const id of selectedVectorDb) merge(result, await copy("vector-db", id, targetDir, overwrite, selectedTools));
    for (const id of selectedOrm) merge(result, await copy("orm", id, targetDir, overwrite, selectedTools));
    for (const id of selectedStorage) merge(result, await copy("storage", id, targetDir, overwrite, selectedTools));
    for (const id of selectedAuth) merge(result, await copy("auth", id, targetDir, overwrite, selectedTools));

    // CI: append new-stack jobs to already-installed providers; compose fresh
    // (from the merged stack set) for newly selected providers.
    const newStackRefs: TemplateRef[] = selectedStacks.map((id) => ({ kind: "stack" as const, id }));
    for (const id of appendCiProviders) {
      const cfg = await readCiComposeConfig(id);
      if (!cfg) continue;
      const existing = await readIfExists(resolve(targetDir, cfg.base));
      if (existing === null) continue;
      const blocks = await fragmentBlocks(newStackRefs, cfg.fragment);
      const { content, added } = appendBlocks(existing, blocks);
      if (added.length > 0) merge(result, await writeFile(targetDir, cfg.base, content, true));
    }
    for (const id of selectedCi) {
      const composed = await composeCi(
        id,
        (isAdd ? mergedStacks : selectedStacks).map((s) => ({ kind: "stack" as const, id: s })),
      );
      if (composed) {
        merge(result, await writeFile(targetDir, composed.path, composed.contents, overwrite));
      } else {
        merge(result, await copy("ci", id, targetDir, overwrite, selectedTools));
      }
    }

    for (const id of selectedDocs) merge(result, await copy("docs", id, targetDir, overwrite, selectedTools));
    const skillsToInstall = unionStr(core.skills, selectedSkills);
    const agentsToInstall = unionStr(core.agents, selectedAgents);
    for (const id of skillsToInstall) merge(result, await copy("skill", id, targetDir, overwrite, selectedTools));
    for (const id of agentsToInstall) merge(result, await copy("agent", id, targetDir, overwrite, selectedTools));

    // opencode.json marks the project as OpenCode-aware (points at AGENTS.md).
    if (selectedTools.includes("opencode")) {
      const existing = isAdd ? await readIfExists(resolve(targetDir, "opencode.json")) : null;
      if (existing === null) {
        merge(result, await writeFile(targetDir, "opencode.json", opencodeConfig(), overwrite));
      }
    }

    // Adding a tool to an existing project: backfill that tool's agent/skill
    // layouts for pieces already installed (stack-bundled + standalone agents,
    // skills) that this run wouldn't otherwise re-copy.
    if (isAdd && newTools.length > 0) {
      merge(result, await materializeInstalledForTools(
        targetDir,
        {
          stacks: existingManifest?.stacks ?? [],
          agents: existingManifest?.agents ?? [],
          skills: existingManifest?.skills ?? [],
        },
        selectedTools,
      ));
    }
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
  const installedAgents = unionStr(selectedAgents, installedNames(result.written, "agents"));
  const installedSkills = unionStr(selectedSkills, installedNames(result.written, "skills"));
  await writeManifest(
    targetDir,
    {
      projectType,
      tools: selectedTools,
      stacks: selectedStacks,
      apps: [],
      databases: selectedDatabases,
      vectorDb: selectedVectorDb,
      orm: selectedOrm,
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

/** Blocks from the refs' CLAUDE.section.md fragments (for appending). */
export async function sectionBlocks(refs: TemplateRef[]): Promise<Block[]> {
  return fragmentBlocks(refs, "CLAUDE.section.md");
}

/**
 * Blocks for monorepo app sections in CLAUDE.md. The header matches what
 * composeMonorepoClaudeMd emits so appends stay idempotent.
 */
export async function appSectionBlocks(apps: AppEntry[]): Promise<Block[]> {
  const blocks: Block[] = [];
  for (const app of apps) {
    const header = `### App: apps/${app.group}/${app.name} — ${app.stack}`;
    const sec = await readTemplateFile("stack", app.stack, "CLAUDE.section.md");
    const body =
      sec && sec.trim().length > 0 ? `${header}\n\n${sec.trim()}` : header;
    blocks.push({ header, body });
  }
  return blocks;
}

/** Blocks from a named fragment file across refs (for appending). */
export async function fragmentBlocks(refs: TemplateRef[], file: string): Promise<Block[]> {
  const blocks: Block[] = [];
  for (const ref of refs) {
    const frag = await readTemplateFile(ref.kind, ref.id, file);
    if (frag && frag.trim().length > 0) blocks.push(toBlock(frag));
  }
  return blocks;
}

/**
 * Merge the given stacks' package.json fragments into an existing package.json
 * with EXISTING-WINS semantics. Returns the new serialized content, or null if
 * nothing changed (or the existing file isn't valid JSON — left untouched).
 */
export async function mergePkgFragments(
  existingRaw: string,
  stackIds: string[],
  ormIds: string[] = [],
): Promise<string | null> {
  let pkg: Json;
  try {
    pkg = JSON.parse(existingRaw);
  } catch {
    return null; // don't touch a file we can't safely parse
  }
  let merged = pkg;
  for (const id of stackIds) {
    const frag = await readPkgFragment("stack", id);
    if (frag) merged = mergeFirstWins(merged, frag);
  }
  for (const id of ormIds) {
    const frag = await readPkgFragment("orm", id);
    if (frag) merged = mergeFirstWins(merged, frag);
  }
  const next = JSON.stringify(merged, null, 2) + "\n";
  const prev = JSON.stringify(pkg, null, 2) + "\n";
  return next === prev ? null : next;
}

interface MonorepoContext {
  targetDir: string;
  mode: "new" | "existing";
  tools: ToolId[];
  stacks: Option[];
  databases: Option[];
  vectorDb: Option[];
  storage: Option[];
  authOptions: Option[];
  ciOptions: Option[];
  dockerBaseId: string | null;
  docsOptions: Option[];
  skillOptions: Option[];
  agentOptions: Option[];
  core: CoreSet;
  existingManifest: ProjectManifest | null;
}

const DEFAULT_GROUPS = ["frontend", "backend", "mobile"];

async function runMonorepoFlow(ctx: MonorepoContext): Promise<void> {
  const { targetDir, mode } = ctx;

  if (ctx.stacks.length === 0) {
    p.cancel("Registry has no stacks — cannot define apps.");
    return;
  }

  const existingApps = ctx.existingManifest?.apps ?? [];
  if (existingApps.length > 0) {
    p.log.info(
      `Existing apps: ${existingApps.map((a) => `${a.group}/${a.name} (${a.stack})`).join(", ")}`,
    );
  }
  const taken = new Set(existingApps.map((a) => `${a.group}/${a.name}`));

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

    if (taken.has(`${group}/${name}`)) {
      p.log.warn(`apps/${group}/${name} already exists — pick a different name.`);
      continue;
    }

    const stack = await p.select({
      message: `Stack for apps/${group}/${name}?`,
      options: ctx.stacks,
    });
    if (p.isCancel(stack)) return p.cancel("Cancelled.");

    apps.push({ group, name, stack: stack as string });
    taken.add(`${group}/${name}`);

    const again = await p.confirm({ message: "Add another app?", initialValue: false });
    if (p.isCancel(again)) return p.cancel("Cancelled.");
    addAnother = again;
  }

  // Workspace-level selections.
  const selectedDatabases = await pickMany("database(s)", ctx.databases, false);
  if (selectedDatabases === null) return p.cancel("Cancelled.");
  const selectedVectorDb = await pickMany("vector store(s)", ctx.vectorDb, false);
  if (selectedVectorDb === null) return p.cancel("Cancelled.");
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

  // CI (per-app jobs). On add runs, offer to extend the installed provider(s)
  // with jobs for the new apps.
  const prevCi = ctx.existingManifest?.ci ?? [];
  let appendCiProviders: string[] = [];
  if (prevCi.length > 0 && apps.length > 0) {
    const res = await p.confirm({
      message: `Update existing CI (${prevCi.join(", ")}) with jobs for the new app(s)?`,
      initialValue: true,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    if (res) appendCiProviders = prevCi;
  }
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

  // Docker (per-app services + shared db/storage). On add runs where Docker is
  // already set up, offer to extend docker-compose.yml.
  let wantDocker = false;
  if (ctx.existingManifest?.docker) {
    const hasNew =
      apps.length +
        selectedDatabases.length +
        selectedVectorDb.length +
        selectedStorage.length >
      0;
    if (hasNew) {
      const res = await p.confirm({
        message: "Update docker-compose.yml with services for the new apps/selections?",
        initialValue: true,
      });
      if (p.isCancel(res)) return p.cancel("Cancelled.");
      wantDocker = res;
    }
  } else if (ctx.dockerBaseId) {
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
    ...selectedVectorDb.map((id) => ({ kind: "vector-db" as const, id })),
    ...selectedStorage.map((id) => ({ kind: "storage" as const, id })),
    ...selectedAuth.map((id) => ({ kind: "auth" as const, id })),
  ];
  const skills = unionStr(ctx.core.skills, selectedSkills);
  const agents = unionStr(ctx.core.agents, selectedAgents);
  const overwrite = mode === "new";
  const isAdd = mode === "existing";
  // Merged state, for composing files from scratch on add runs.
  const mergedApps = [...existingApps, ...apps];
  const mergedRefs: TemplateRef[] = [
    ...unionStr(ctx.existingManifest?.databases ?? [], selectedDatabases).map((id) => ({ kind: "database" as const, id })),
    ...unionStr(ctx.existingManifest?.vectorDb ?? [], selectedVectorDb).map((id) => ({ kind: "vector-db" as const, id })),
    ...unionStr(ctx.existingManifest?.storage ?? [], selectedStorage).map((id) => ({ kind: "storage" as const, id })),
    ...unionStr(ctx.existingManifest?.auth ?? [], selectedAuth).map((id) => ({ kind: "auth" as const, id })),
  ];

  const build = p.spinner();
  build.start("Scaffolding monorepo…");
  let result: WriteResult;
  try {
    // Fresh scaffolding handles composed files itself only on new projects; on
    // add runs we scaffold the new apps' code, then append to composed files.
    result = await scaffoldMonorepo(
      targetDir,
      {
        projectName: basename(targetDir),
        tools: ctx.tools,
        apps,
        sectionRefs,
        auth: selectedAuth,
        docs: selectedDocs,
        skills,
        agents,
        includeClaudeMd: isAdd ? false : includeClaudeMd,
        ci: isAdd ? [] : selectedCi,
        docker: isAdd ? false : wantDocker,
        dockerBaseId: ctx.dockerBaseId,
      },
      overwrite,
    );

    if (isAdd) {
      // Instructions file(s): append app sections + new workspace sections, or
      // compose fresh for a newly selected tool's file (CLAUDE.md / AGENTS.md).
      if (includeClaudeMd) {
        const blocks = [...(await appSectionBlocks(apps)), ...(await sectionBlocks(sectionRefs))];
        for (const fname of instructionFiles(ctx.tools)) {
          const existing = await readIfExists(resolve(targetDir, fname));
          if (existing === null) {
            const md = await composeMonorepoClaudeMd(mergedApps, mergedRefs);
            if (md) merge(result, await writeFile(targetDir, fname, md, true));
          } else {
            const { content, added } = appendBlocks(existing, blocks, "\n\n");
            if (added.length > 0) merge(result, await writeFile(targetDir, fname, content, true));
          }
        }
      }

      // docker-compose.yml: append services for the new apps + new db/storage.
      if (wantDocker && ctx.dockerBaseId) {
        const existing = await readIfExists(resolve(targetDir, "docker-compose.yml"));
        if (existing === null) {
          const compose = await composeMonorepoDockerCompose(ctx.dockerBaseId, mergedApps, mergedRefs);
          if (compose) merge(result, await writeFile(targetDir, compose.path, compose.contents, true));
          merge(result, await copy("docker", ctx.dockerBaseId, targetDir, false, ctx.tools));
        } else {
          const ports = usedHostPorts(existing);
          const blocks: Block[] = [];
          for (const app of apps) {
            const block = await buildAppServiceBlock(app, ports);
            if (block) blocks.push(toBlock(block));
          }
          blocks.push(...(await fragmentBlocks(sectionRefs, "compose.service.yml")));
          const { content, added } = appendBlocks(existing, blocks);
          if (added.length > 0) merge(result, await writeFile(targetDir, "docker-compose.yml", content, true));
        }
      }

      // CI: append per-app jobs to installed providers; compose fresh for new ones.
      for (const providerId of appendCiProviders) {
        const cfg = await readCiComposeConfig(providerId);
        if (!cfg) continue;
        const existing = await readIfExists(resolve(targetDir, cfg.base));
        if (existing === null) {
          const composed = await composeMonorepoCi(providerId, mergedApps);
          if (composed) merge(result, await writeFile(targetDir, composed.path, composed.contents, true));
          continue;
        }
        const blocks: Block[] = [];
        for (const app of apps) {
          const block = await buildAppJobBlock(app, cfg.fragment);
          if (block) blocks.push(toBlock(block));
        }
        const { content, added } = appendBlocks(existing, blocks);
        if (added.length > 0) merge(result, await writeFile(targetDir, cfg.base, content, true));
      }
      for (const providerId of selectedCi) {
        const composed = await composeMonorepoCi(providerId, mergedApps);
        if (composed) merge(result, await writeFile(targetDir, composed.path, composed.contents, false));
      }

      // Adding a tool later: backfill its agent/skill layouts for the apps'
      // stacks + workspace agents/skills already installed.
      const priorTools = ctx.existingManifest?.tools ?? [];
      const newTools = ctx.tools.filter((t) => !priorTools.includes(t));
      if (newTools.length > 0) {
        merge(result, await materializeInstalledForTools(
          targetDir,
          {
            stacks: ctx.existingManifest?.stacks ?? [],
            agents: ctx.existingManifest?.agents ?? [],
            skills: ctx.existingManifest?.skills ?? [],
          },
          ctx.tools,
        ));
      }
    }
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
      tools: ctx.tools,
      stacks: [...new Set(apps.map((a) => a.stack))],
      apps,
      databases: selectedDatabases,
      vectorDb: selectedVectorDb,
      orm: [],
      storage: selectedStorage,
      auth: selectedAuth,
      ci: selectedCi,
      docker: wantDocker,
      docs: selectedDocs,
      skills: unionStr(selectedSkills, installedNames(result.written, "skills")),
      agents: unionStr(selectedAgents, installedNames(result.written, "agents")),
    },
    VERSION,
    new Date().toISOString(),
  );
  p.log.info(`Recorded project state in ${MANIFEST_FILE}`);

  p.outro(pc.green(`Done! monorepo ready at ${targetDir} (${apps.length} app(s))`));
}

/** Ask which agentic coding tool(s) to target (pre-selects existing choices). */
async function pickTools(existing?: ToolId[]): Promise<ToolId[] | null> {
  const res = await p.multiselect({
    message: "Which agentic coding tool(s) will you use?",
    options: AGENTIC_TOOLS.map((t) => ({ value: t.id, label: t.label, hint: t.hint })),
    initialValues: existing && existing.length > 0 ? existing : ["claude-code"],
    required: true,
  });
  if (p.isCancel(res)) return null;
  return normalizeTools(res as string[]);
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
  tools: ToolId[],
): Promise<WriteResult> {
  const files = await fetchTemplate(kind, id);
  return writeTemplateFiles(targetDir, retargetForTools(files, tools), { overwrite });
}

/**
 * Backfill agent/skill layouts for the given tools across pieces already
 * installed in a project, without touching existing files. Used when a tool is
 * added to an existing project so its `.opencode/agents`, `.codex/agents`, and
 * `.agents/skills` (etc.) get created for stacks/agents/skills installed earlier.
 *
 * The FULL effective tool set is passed (not just the new ones): `retargetForTools`
 * picks the idiomatic destinations for the whole set, and `overwrite: false`
 * means only the missing (newly-needed) per-tool files are actually written.
 */
export async function materializeInstalledForTools(
  targetDir: string,
  installed: { stacks: string[]; agents: string[]; skills: string[] },
  tools: ToolId[],
): Promise<WriteResult> {
  const result: WriteResult = { written: [], skipped: [] };
  const write = async (files: TemplateFile[]): Promise<void> => {
    if (files.length === 0) return;
    merge(result, await writeTemplateFiles(targetDir, retargetForTools(files, tools), { overwrite: false }));
  };

  // Standalone agents that exist as registry `agents/` templates. (Stack-bundled
  // agent names like `react` aren't here — they come in via their stack below.)
  const registryAgents = new Set((await listAgents()).map((m) => m.id));
  for (const id of installed.agents) {
    if (!registryAgents.has(id)) continue;
    try {
      await write(await fetchTemplate("agent", id));
    } catch {
      /* template no longer in registry — skip */
    }
  }
  // Stack-bundled agents/skills (the `.claude/` portion of each installed stack).
  for (const id of installed.stacks) {
    try {
      const files = (await fetchTemplate("stack", id)).filter((f) => f.path.startsWith(".claude/"));
      await write(files);
    } catch {
      /* skip */
    }
  }
  // Skills (identical SKILL.md placed into each tool's skill dir).
  for (const id of installed.skills) {
    try {
      await write(await fetchTemplate("skill", id));
    } catch {
      /* skip */
    }
  }
  return result;
}

function merge(into: WriteResult, from: WriteResult): void {
  into.written.push(...from.written);
  into.skipped.push(...from.skipped);
}
