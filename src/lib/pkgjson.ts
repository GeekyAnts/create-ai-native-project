import { readTemplateFile } from "./templates.js";

export type Json = Record<string, unknown>;

/** package.json fields that are objects and should be key-merged (not replaced). */
const MERGE_FIELDS = [
  "scripts",
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "engines",
];

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Merge `frag` into `base` with **first-wins** semantics: a key already present
 * in `base` is never overwritten (applies to top-level fields and to individual
 * entries of the merge-able object fields like dependencies/scripts).
 */
export function mergeFirstWins(base: Json, frag: Json): Json {
  const out: Json = { ...base };
  for (const [key, value] of Object.entries(frag)) {
    if (MERGE_FIELDS.includes(key) && isObject(value)) {
      const merged: Json = isObject(out[key]) ? { ...(out[key] as Json) } : {};
      for (const [k, v] of Object.entries(value)) {
        if (!(k in merged)) merged[k] = v; // first-wins per entry
      }
      out[key] = merged;
    } else if (!(key in out)) {
      out[key] = value; // first-wins for scalars/arrays
    }
  }
  return out;
}

/** npm-safe package name derived from the project/folder name. */
export function toPackageName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9-~._]+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");
  return slug || "app";
}

export async function readPkgFragment(
  kind: "project-type" | "stack",
  id: string,
): Promise<Json | null> {
  const raw = await readTemplateFile(kind, id, "package.json");
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw);
    return isObject(parsed) ? parsed : null;
  } catch {
    return null; // ignore malformed fragment
  }
}

/**
 * Compose the project's package.json:
 *   base = the selected project-type's package.json
 *   + each stack's package.json fragment merged in (first-wins)
 *
 * Returns null if no template supplies a package.json (nothing to write).
 */
export async function composePackageJson(
  projectName: string,
  projectTypeId: string | null,
  stackIds: string[],
): Promise<string | null> {
  let result: Json = {};
  let found = false;

  if (projectTypeId) {
    const base = await readPkgFragment("project-type", projectTypeId);
    if (base) {
      result = base;
      found = true;
    }
  }
  for (const id of stackIds) {
    const frag = await readPkgFragment("stack", id);
    if (frag) {
      result = mergeFirstWins(result, frag);
      found = true;
    }
  }
  if (!found) return null;

  // Always stamp identity fields, ordered first for readability.
  const { name: _n, version, private: priv, type, ...rest } = result;
  const ordered: Json = {
    name: toPackageName(projectName),
    version: typeof version === "string" ? version : "0.1.0",
    ...(priv !== undefined ? { private: priv } : {}),
    ...(type !== undefined ? { type } : {}),
    ...rest,
  };
  return JSON.stringify(ordered, null, 2) + "\n";
}
