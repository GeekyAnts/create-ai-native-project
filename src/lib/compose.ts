import { readTemplateFile, type TemplateRef } from "./templates.js";

/**
 * Compose docker-compose.yml (text composition, mirroring the CLAUDE.md approach
 * so we avoid a YAML dependency):
 *   base = docker/<baseId>/docker-compose.yml (contains the `services:` header)
 *   + each ref's `compose.service.yml` fragment appended under services
 *
 * Each fragment is expected to be one or more service entries already indented
 * to sit under `services:`. Returns null if the base template is missing.
 */
export async function composeDockerCompose(
  baseId: string,
  refs: TemplateRef[],
): Promise<string | null> {
  const base = await readTemplateFile("docker", baseId, "docker-compose.yml");
  if (base === null) return null;

  const fragments: string[] = [];
  for (const ref of refs) {
    const frag = await readTemplateFile(ref.kind, ref.id, "compose.service.yml");
    if (frag && frag.trim().length > 0) {
      // Normalize trailing whitespace; keep the fragment's own indentation.
      fragments.push(frag.replace(/\s+$/, ""));
    }
  }

  let out = base.replace(/\s+$/, "");
  for (const frag of fragments) {
    out += "\n" + frag;
  }
  return out + "\n";
}
