/**
 * Git-backed template registry.
 *
 * Skills, agents, and the CLAUDE.md template all live in a single git repo
 * (configured via CLAUDE_SETUP_REGISTRY in .env, defaulting to the GeekyAnts
 * registry). The repo is shallow-cloned/updated into a local cache, then read
 * from disk. Switch the source by editing .env — no code change required.
 *
 * Expected registry layout:
 *   project-types/<id>/  one per project shape (monorepo, single, …)
 *   stacks/<id>/         one per tech stack (react, node-nest, …)
 *   skills/<id>/         one directory per skill
 *   agents/<id>/         one directory per agent
 *   claude/<id>/         base CLAUDE.md template(s), e.g. claude/default/CLAUDE.md
 *
 * template.json (optional, per template): { "name": string, "description": string }
 *
 * CLAUDE.md composition (see readTemplateFile + the CLI's composer):
 *   - A project-type may provide `CLAUDE.md` — the base knowledge base.
 *   - A stack may provide `CLAUDE.section.md` — appended to the base.
 * These "compose files" (plus template.json) are NOT copied verbatim; every
 * other file in a template directory IS copied into the target project at the
 * default location for that kind (see TARGET_ROOT), preserving sub-paths.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access, mkdir, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";

const exec = promisify(execFile);

export type TemplateKind =
  | "project-type"
  | "stack"
  | "database"
  | "storage"
  | "docker"
  | "docs"
  | "skill"
  | "agent"
  | "claude";

/** A reference to a chosen template, used by the composers. */
export interface TemplateRef {
  kind: TemplateKind;
  id: string;
}

/** Kinds whose CLAUDE.section.md / compose.service.yml are composed, not copied. */
const FRAGMENT_KINDS: TemplateKind[] = [
  "project-type",
  "stack",
  "database",
  "storage",
];

/**
 * Files handled by a composer rather than copied verbatim:
 *   - `template.json` (picker metadata) — always withheld.
 *   - `CLAUDE.section.md` / `compose.service.yml` — fragments for project-type,
 *     stack, database, storage (appended into CLAUDE.md / docker-compose.yml).
 *   - `CLAUDE.md` / `package.json` — base files for project-type & stack.
 *   - `docker-compose.yml` — the docker base template composes this from fragments.
 * Everything else is copied verbatim — e.g. a `docs/` sub-project keeps its own
 * package.json, and `requirements.txt` / config files are dropped as setup.
 */
function isComposeFile(kind: TemplateKind, rel: string): boolean {
  if (rel === "template.json") return true;
  if (FRAGMENT_KINDS.includes(kind)) {
    if (rel === "CLAUDE.section.md" || rel === "compose.service.yml") return true;
  }
  if (kind === "project-type" || kind === "stack") {
    if (rel === "CLAUDE.md" || rel === "package.json") return true;
  }
  if (kind === "docker" && rel === "docker-compose.yml") return true;
  return false;
}

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
  "project-type": "project-types",
  stack: "stacks",
  database: "databases",
  storage: "storage",
  docker: "docker",
  docs: "docs",
  skill: "skills",
  agent: "agents",
  claude: "claude",
};

/** Where a template's (verbatim) files land in the target project, by kind. */
const TARGET_ROOT: Record<TemplateKind, (id: string) => string> = {
  "project-type": () => "",
  stack: () => "",
  database: () => "",
  storage: () => "",
  docker: () => "",
  docs: () => "docs",
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

export const listProjectTypes = () => listTemplates("project-type");
export const listStacks = () => listTemplates("stack");
export const listDatabases = () => listTemplates("database");
export const listStorage = () => listTemplates("storage");
export const listDocs = () => listTemplates("docs");
export const listSkills = () => listTemplates("skill");
export const listAgents = () => listTemplates("agent");

/**
 * Read the verbatim (setup) files of a template, mapped to their
 * target-project-relative paths. Compose files (CLAUDE.md / CLAUDE.section.md /
 * template.json) are excluded — those are handled by the CLAUDE.md composer.
 */
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
    if (isComposeFile(kind, rel)) continue;
    const contents = await readFile(join(tplDir, rel), "utf8");
    files.push({ path: targetRoot ? join(targetRoot, rel) : rel, contents });
  }
  return files;
}

/** Read a single named file from a template, or null if it doesn't exist. */
export async function readTemplateFile(
  kind: TemplateKind,
  id: string,
  file: string,
): Promise<string | null> {
  const repo = await ensureRegistry();
  const target = join(repo, KIND_DIR[kind], id, file);
  if (!(await exists(target))) return null;
  return readFile(target, "utf8");
}
