import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { listAgents, listSkills, fetchTemplate } from "../lib/templates.js";
import { writeTemplateFiles, type WriteResult } from "../lib/files.js";
import { isExistingProject } from "../lib/project.js";

export interface CreateOptions {
  /** --boot <name>: create this folder and scaffold into it. */
  boot?: string;
}

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

  // 2. Pick what to include.
  const includeClaudeMd = await p.confirm({
    message: "Include a CLAUDE.md knowledge base?",
    initialValue: true,
  });
  if (p.isCancel(includeClaudeMd)) return p.cancel("Cancelled.");

  const spin = p.spinner();
  spin.start("Loading templates from registry…");
  let skillOptions: { value: string; label: string; hint?: string }[] = [];
  let agentOptions: { value: string; label: string; hint?: string }[] = [];
  try {
    const [skills, agents] = await Promise.all([listSkills(), listAgents()]);
    skillOptions = skills.map((s) => ({ value: s.id, label: s.name, hint: s.description }));
    agentOptions = agents.map((a) => ({ value: a.id, label: a.name, hint: a.description }));
    spin.stop("Loaded template registry.");
  } catch (err) {
    spin.stop(pc.yellow("Could not reach the template registry."));
    p.log.warn(String(err instanceof Error ? err.message : err));
  }

  const selectedSkills = await pickMany("skills", skillOptions);
  if (selectedSkills === null) return p.cancel("Cancelled.");
  const selectedAgents = await pickMany("agents", agentOptions);
  if (selectedAgents === null) return p.cancel("Cancelled.");

  // 3. Write. In an existing project we never overwrite user files.
  const overwrite = mode === "new";
  const build = p.spinner();
  build.start("Scaffolding…");
  const result: WriteResult = { written: [], skipped: [] };
  try {
    if (includeClaudeMd) merge(result, await write("claude", "default", targetDir, overwrite));
    for (const id of selectedSkills) merge(result, await write("skill", id, targetDir, overwrite));
    for (const id of selectedAgents) merge(result, await write("agent", id, targetDir, overwrite));
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
  options: { value: string; label: string; hint?: string }[],
): Promise<string[] | null> {
  if (options.length === 0) return [];
  const res = await p.multiselect({
    message: `Select ${kind} to include:`,
    options,
    required: false,
  });
  if (p.isCancel(res)) return null;
  return res as string[];
}

async function write(
  kind: "claude" | "skill" | "agent",
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
