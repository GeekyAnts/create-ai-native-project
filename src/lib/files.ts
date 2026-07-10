import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { TemplateFile } from "./templates.js";

export interface WriteResult {
  written: string[];
  skipped: string[];
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Write template files under baseDir. By default, existing files are left
 * untouched (skipped) so we never clobber a user's work in an existing project;
 * pass { overwrite: true } to replace them.
 */
export async function writeTemplateFiles(
  baseDir: string,
  files: TemplateFile[],
  opts: { overwrite?: boolean } = {},
): Promise<WriteResult> {
  const written: string[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const target = resolve(join(baseDir, file.path));
    if (!opts.overwrite && (await exists(target))) {
      skipped.push(target);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.contents, "utf8");
    written.push(target);
  }
  return { written, skipped };
}
