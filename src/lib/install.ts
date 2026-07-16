import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

// On Windows, pnpm/npm are .cmd shims that execFile can only run through a shell.
// Safe here because every invocation passes fixed args, never user input.
const shell = process.platform === "win32";

export type PackageManager = "pnpm" | "npm";

async function isAvailable(cmd: string): Promise<boolean> {
  try {
    await exec(cmd, ["--version"], { shell });
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
  await exec(pm, ["install"], { cwd: dir, shell });
}
