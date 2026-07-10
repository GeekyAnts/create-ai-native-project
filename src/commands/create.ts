import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  listAgents,
  listDatabases,
  listDocs,
  listProjectTypes,
  listSkills,
  listStacks,
  listStorage,
  listTemplates,
  fetchTemplate,
  type TemplateMeta,
  type TemplateRef,
} from "../lib/templates.js";
import { composeClaudeMd } from "../lib/claudemd.js";
import { composePackageJson } from "../lib/pkgjson.js";
import { composeDockerCompose } from "../lib/compose.js";
import { writeTemplateFiles, type WriteResult } from "../lib/files.js";
import { isExistingProject } from "../lib/project.js";
import { detectPackageManager, runInstall } from "../lib/install.js";

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
  | "docker"
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

  // 2. Load everything the registry offers.
  const spin = p.spinner();
  spin.start("Loading templates from registry…");
  let projectTypes: Option[] = [];
  let stacks: Option[] = [];
  let databases: Option[] = [];
  let storage: Option[] = [];
  let docsOptions: Option[] = [];
  let skillOptions: Option[] = [];
  let agentOptions: Option[] = [];
  let dockerBaseId: string | null = null;
  try {
    const [pts, sts, dbs, sto, dockers, docs, sk, ag] = await Promise.all([
      listProjectTypes(),
      listStacks(),
      listDatabases(),
      listStorage(),
      listTemplates("docker"),
      listDocs(),
      listSkills(),
      listAgents(),
    ]);
    projectTypes = toOptions(pts);
    stacks = toOptions(sts);
    databases = toOptions(dbs);
    storage = toOptions(sto);
    docsOptions = toOptions(docs);
    skillOptions = toOptions(sk);
    agentOptions = toOptions(ag);
    dockerBaseId =
      dockers.find((d) => d.id === "compose")?.id ?? dockers[0]?.id ?? null;
    spin.stop("Loaded template registry.");
  } catch (err) {
    spin.stop(pc.yellow("Could not reach the template registry."));
    p.log.warn(String(err instanceof Error ? err.message : err));
  }

  // 3. Project type (single choice) — drives the base CLAUDE.md + package.json.
  let projectType: string | null = null;
  if (projectTypes.length > 0) {
    const res = await p.select({
      message: "What kind of project is this?",
      options: projectTypes,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    projectType = res as string;
  }

  // 4. Tech stack(s), database(s), storage — each may add a CLAUDE.md section,
  //    a docker service, and setup files.
  const selectedStacks = await pickMany("tech stack(s)", stacks, false);
  if (selectedStacks === null) return p.cancel("Cancelled.");
  const selectedDatabases = await pickMany("database(s)", databases, false);
  if (selectedDatabases === null) return p.cancel("Cancelled.");
  const selectedStorage = await pickMany("storage option(s)", storage, false);
  if (selectedStorage === null) return p.cancel("Cancelled.");

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

  // 5c. Optional Docker (docker-compose composed from the selections above).
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
    for (const id of selectedDocs) merge(result, await copy("docs", id, targetDir, overwrite));
    for (const id of selectedSkills) merge(result, await copy("skill", id, targetDir, overwrite));
    for (const id of selectedAgents) merge(result, await copy("agent", id, targetDir, overwrite));
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

  const label = mode === "new" ? basename(targetDir) : "project";
  p.outro(pc.green(`Done! ${label} is now AI-native → ${targetDir}`));
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
