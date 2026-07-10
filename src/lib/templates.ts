/**
 * Git-backed template registry.
 *
 * Skills, agents, and the CLAUDE.md template all live in a single git repo
 * (configured via CLAUDE_SETUP_REGISTRY in .env, defaulting to the GeekyAnts
 * registry). The repo is shallow-cloned/updated into a local cache, then read
 * from disk. Switch the source by editing .env — no code change required.
 *
 * Expected registry layout:
 *   skills/<id>/     one directory per skill  (+ optional template.json)
 *   agents/<id>/     one directory per agent  (+ optional template.json)
 *   claude/<id>/     CLAUDE.md template(s), e.g. claude/default/CLAUDE.md
 *
 * template.json (optional, per template): { "name": string, "description": string }
 * Files within a template directory are copied into the target project at the
 * default location for that kind (see TARGET_ROOT), preserving sub-paths.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access, mkdir, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";

const exec = promisify(execFile);

export type TemplateKind = "skill" | "agent" | "claude";

export interface TemplateMeta {
  id: string;
  kind: TemplateKind;
  name: string;
  description: string;
}

export interface TemplateFile {
  /** Path relative to the target project root. */
  path: string;
  contents: string;
}

export const REGISTRY_URL =
  process.env.CLAUDE_SETUP_REGISTRY ??
  "git@git.geekyants.com:geekyants/claude-registry.git";
export const REGISTRY_REF = process.env.CLAUDE_SETUP_REGISTRY_REF ?? "main";

const CACHE_DIR = join(homedir(), ".cache", "create-ai-native-project", "registry");

/** Directory in the registry repo that holds each kind of template. */
const KIND_DIR: Record<TemplateKind, string> = {
  skill: "skills",
  agent: "agents",
  claude: "claude",
};

/** Where a template's files land in the target project, by kind. */
const TARGET_ROOT: Record<TemplateKind, (id: string) => string> = {
  skill: (id) => join(".claude", "skills", id),
  agent: () => join(".claude", "agents"),
  claude: () => "",
};

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Local path where the registry repo is cached. */
export const REGISTRY_CACHE = CACHE_DIR;

// Resolve the registry path once per process run.
let registryPromise: Promise<string> | null = null;

async function isCloned(): Promise<boolean> {
  return exists(join(CACHE_DIR, ".git"));
}

async function clone(): Promise<string> {
  await mkdir(dirname(CACHE_DIR), { recursive: true });
  await exec("git", [
    "clone",
    "--depth",
    "1",
    "--branch",
    REGISTRY_REF,
    REGISTRY_URL,
    CACHE_DIR,
  ]);
  return CACHE_DIR;
}

async function pull(): Promise<void> {
  await exec("git", ["-C", CACHE_DIR, "fetch", "--depth", "1", "origin", REGISTRY_REF]);
  await exec("git", ["-C", CACHE_DIR, "reset", "--hard", `origin/${REGISTRY_REF}`]);
}

/**
 * Ensure the registry is available locally (clones on first use; does NOT pull
 * if already cached — fast and offline-friendly). Use updateRegistry() to refresh.
 */
export function ensureRegistry(): Promise<string> {
  if (!registryPromise) {
    registryPromise = (async () => ((await isCloned()) ? CACHE_DIR : clone()))();
  }
  return registryPromise;
}

/** Force-refresh the registry cache (clones if missing, else fetch + reset). */
export async function updateRegistry(): Promise<string> {
  if (await isCloned()) await pull();
  else await clone();
  registryPromise = Promise.resolve(CACHE_DIR);
  return CACHE_DIR;
}

async function walk(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(relative(base, full));
  }
  return out;
}

/** List templates of a given kind available in the registry. */
export async function listTemplates(kind: TemplateKind): Promise<TemplateMeta[]> {
  const repo = await ensureRegistry();
  const dir = join(repo, KIND_DIR[kind]);
  if (!(await exists(dir))) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const metas: TemplateMeta[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    let name = entry.name;
    let description = "";
    const manifest = join(dir, entry.name, "template.json");
    if (await exists(manifest)) {
      try {
        const m = JSON.parse(await readFile(manifest, "utf8"));
        name = m.name ?? name;
        description = m.description ?? "";
      } catch {
        // ignore malformed manifest; fall back to defaults
      }
    }
    metas.push({ id: entry.name, kind, name, description });
  }
  return metas;
}

export const listSkills = () => listTemplates("skill");
export const listAgents = () => listTemplates("agent");

/** Read a template's files, mapped to their target-project-relative paths. */
export async function fetchTemplate(
  kind: TemplateKind,
  id: string,
): Promise<TemplateFile[]> {
  const repo = await ensureRegistry();
  const tplDir = join(repo, KIND_DIR[kind], id);
  if (!(await exists(tplDir))) {
    throw new Error(`Template not found in registry: ${kind}/${id}`);
  }

  const targetRoot = TARGET_ROOT[kind](id);
  const relPaths = await walk(tplDir);
  const files: TemplateFile[] = [];
  for (const rel of relPaths) {
    if (rel === "template.json") continue;
    const contents = await readFile(join(tplDir, rel), "utf8");
    files.push({ path: targetRoot ? join(targetRoot, rel) : rel, contents });
  }
  return files;
}
