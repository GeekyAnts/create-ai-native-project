import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { normalizeTools, type ToolId } from "./tools.js";

/**
 * A manifest written into every scaffolded project so the tool (and Claude) can
 * see the project's current state and avoid actions that don't apply — e.g. the
 * project type is fixed once set, and already-installed pieces aren't redone.
 */
export const MANIFEST_FILE = ".ai-native-project.json";

/** A monorepo app: a stack scaffolded under apps/<group>/<name>/. */
export interface AppEntry {
  group: string;
  name: string;
  stack: string;
}

export interface ProjectManifest {
  generator: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  projectType: string | null;
  /** Agentic coding tools this project targets (claude-code / codex / opencode). */
  tools: ToolId[];
  stacks: string[];
  apps: AppEntry[];
  databases: string[];
  /** Vector stores for RAG / AI-native apps (pgvector, qdrant, …). */
  vectorDb: string[];
  storage: string[];
  auth: string[];
  ci: string[];
  docker: boolean;
  docs: string[];
  skills: string[];
  agents: string[];
}

export type ManifestState = Omit<
  ProjectManifest,
  "generator" | "version" | "createdAt" | "updatedAt"
>;

export async function readManifest(dir: string): Promise<ProjectManifest | null> {
  try {
    const raw = await readFile(join(dir, MANIFEST_FILE), "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    // Backward compat: projects created before tool selection were Claude Code.
    parsed.tools = normalizeTools(parsed.tools);
    // Backward compat: the vector-db kind was added later — default to empty.
    if (!Array.isArray(parsed.vectorDb)) parsed.vectorDb = [];
    return parsed;
  } catch {
    return null;
  }
}

const union = (a: string[] = [], b: string[] = []): string[] => [
  ...new Set([...a, ...b]),
];

/** Union apps by group/name (later entries win on the same key). */
function unionApps(a: AppEntry[] = [], b: AppEntry[] = []): AppEntry[] {
  const byKey = new Map<string, AppEntry>();
  for (const app of [...a, ...b]) byKey.set(`${app.group}/${app.name}`, app);
  return [...byKey.values()];
}

/**
 * Merge `next` into any existing manifest (arrays unioned, createdAt preserved)
 * and write it back. Always overwrites the manifest file with the merged result.
 */
export async function writeManifest(
  dir: string,
  next: ManifestState,
  version: string,
  now: string,
): Promise<ProjectManifest> {
  const prev = await readManifest(dir);
  const merged: ProjectManifest = {
    generator: "create-ai-native-project",
    version,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    // Project type is fixed once set — an existing value always wins.
    projectType: prev?.projectType ?? next.projectType ?? null,
    tools: normalizeTools(union(prev?.tools, next.tools)),
    stacks: union(prev?.stacks, next.stacks),
    apps: unionApps(prev?.apps, next.apps),
    databases: union(prev?.databases, next.databases),
    vectorDb: union(prev?.vectorDb, next.vectorDb),
    storage: union(prev?.storage, next.storage),
    auth: union(prev?.auth, next.auth),
    ci: union(prev?.ci, next.ci),
    docker: next.docker || Boolean(prev?.docker),
    docs: union(prev?.docs, next.docs),
    skills: union(prev?.skills, next.skills),
    agents: union(prev?.agents, next.agents),
  };
  await writeFile(
    join(dir, MANIFEST_FILE),
    JSON.stringify(merged, null, 2) + "\n",
    "utf8",
  );
  return merged;
}
