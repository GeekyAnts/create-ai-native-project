import { readdir } from "node:fs/promises";

// Entries that don't count as "project content" when deciding new vs existing.
const IGNORED = new Set([".git", ".DS_Store", ".env", ".env.example", "node_modules"]);

/**
 * Heuristic: is `dir` an existing project (has meaningful content) rather than
 * an empty/new folder? True if it contains a .git dir or any non-ignored entry.
 */
export async function isExistingProject(dir: string): Promise<boolean> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return false; // dir doesn't exist yet → treat as new
  }
  return entries.some((e) => !IGNORED.has(e.name));
}
