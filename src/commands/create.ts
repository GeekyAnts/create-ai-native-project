import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  listAgents,
  listProjectTypes,
  listSkills,
  listStacks,
  fetchTemplate,
  type TemplateMeta,
} from "../lib/templates.js";
import { composeClaudeMd } from "../lib/claudemd.js";
import { writeTemplateFiles, type WriteResult } from "../lib/files.js";
import { isExistingProject } from "../lib/project.js";

export interface CreateOptions {
  /** --boot <name>: create this folder and scaffold into it. */
  boot?: string;
}

interface Option {
  value: string;
  label: string;
  hint?: string;
}

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
  let skillOptions: Option[] = [];
  let agentOptions: Option[] = [];
  try {
    const [pts, sts, sk, ag] = await Promise.all([
      listProjectTypes(),
      listStacks(),
      listSkills(),
      listAgents(),
    ]);
    projectTypes = toOptions(pts);
    stacks = toOptions(sts);
    skillOptions = toOptions(sk);
    agentOptions = toOptions(ag);
    spin.stop("Loaded template registry.");
  } catch (err) {
    spin.stop(pc.yellow("Could not reach the template registry."));
    p.log.warn(String(err instanceof Error ? err.message : err));
  }

  // 3. Project type (single choice) — drives the base CLAUDE.md.
  let projectType: string | null = null;
  if (projectTypes.length > 0) {
    const res = await p.select({
      message: "What kind of project is this?",
      options: projectTypes,
    });
    if (p.isCancel(res)) return p.cancel("Cancelled.");
    projectType = res as string;
  }

  // 4. Tech stack(s) — each may add setup files + a CLAUDE.md section.
  const selectedStacks = await pickMany("tech stack(s)", stacks, false);
  if (selectedStacks === null) return p.cancel("Cancelled.");

  // 5. Skills & agents.
  const selectedSkills = await pickMany("skills", skillOptions, false);
  if (selectedSkills === null) return p.cancel("Cancelled.");
  const selectedAgents = await pickMany("agents", agentOptions, false);
  if (selectedAgents === null) return p.cancel("Cancelled.");

  const includeClaudeMd = await p.confirm({
    message: "Generate CLAUDE.md (composed from project type + stacks)?",
    initialValue: true,
  });
  if (p.isCancel(includeClaudeMd)) return p.cancel("Cancelled.");

  // 6. Write. In an existing project we never overwrite user files.
  const overwrite = mode === "new";
  const build = p.spinner();
  build.start("Scaffolding…");
  const result: WriteResult = { written: [], skipped: [] };
  try {
    if (includeClaudeMd) {
      const claudeMd = await composeClaudeMd(projectType, selectedStacks);
      if (claudeMd) {
        merge(
          result,
          await writeTemplateFiles(
            targetDir,
            [{ path: "CLAUDE.md", contents: claudeMd }],
            { overwrite },
          ),
        );
      }
    }
    if (projectType) merge(result, await copy("project-type", projectType, targetDir, overwrite));
    for (const id of selectedStacks) merge(result, await copy("stack", id, targetDir, overwrite));
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

async function copy(
  kind: "project-type" | "stack" | "skill" | "agent",
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
