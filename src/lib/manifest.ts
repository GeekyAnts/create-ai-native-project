import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * A manifest written into every scaffolded project so the tool (and Claude) can
 * see the project's current state and avoid actions that don't apply — e.g. the
 * project type is fixed once set, and already-installed pieces aren't redone.
 */
export const MANIFEST_FILE = ".ai-native-project.json";

export interface ProjectManifest {
  generator: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  projectType: string | null;
  stacks: string[];
  databases: string[];
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
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

const union = (a: string[] = [], b: string[] = []): string[] => [
  ...new Set([...a, ...b]),
];

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
    stacks: union(prev?.stacks, next.stacks),
    databases: union(prev?.databases, next.databases),
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
