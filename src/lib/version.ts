import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * The package version, read from package.json at runtime so it's defined in
 * exactly one place. Works both bundled (dist/index.js → ../package.json) and
 * in dev via tsx (src/lib/version.ts → ../../package.json) by walking up from
 * this module until our package.json is found.
 */
function resolveVersion(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      if (pkg.name === "create-ai-native-project") return pkg.version ?? "0.0.0";
    } catch {
      // keep walking up
    }
    dir = dirname(dir);
  }
  return "0.0.0";
}

export const VERSION: string = resolveVersion();
