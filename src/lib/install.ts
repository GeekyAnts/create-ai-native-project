import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

export type PackageManager = "pnpm" | "npm";

async function isAvailable(cmd: string): Promise<boolean> {
  try {
    await exec(cmd, ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/** Prefer pnpm (our stack default), fall back to npm. */
export async function detectPackageManager(): Promise<PackageManager> {
  return (await isAvailable("pnpm")) ? "pnpm" : "npm";
}

/** Run `<pm> install` in the target directory. Throws on failure. */
export async function runInstall(
  dir: string,
  pm: PackageManager,
): Promise<void> {
  await exec(pm, ["install"], { cwd: dir });
}
