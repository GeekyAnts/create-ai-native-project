import { readTemplateFile } from "./templates.js";

/**
 * Compose the project's CLAUDE.md:
 *   base = the selected project-type's CLAUDE.md (fallback: claude/default)
 *   + one appended section per selected stack (its CLAUDE.section.md)
 *
 * Returns null if no base template is available (nothing to write).
 */
export async function composeClaudeMd(
  projectTypeId: string | null,
  stackIds: string[],
): Promise<string | null> {
  let base: string | null = null;
  if (projectTypeId) {
    base = await readTemplateFile("project-type", projectTypeId, "CLAUDE.md");
  }
  if (base === null) {
    base = await readTemplateFile("claude", "default", "CLAUDE.md");
  }
  if (base === null) return null;

  let out = base.trimEnd();
  for (const id of stackIds) {
    const section = await readTemplateFile("stack", id, "CLAUDE.section.md");
    if (section && section.trim().length > 0) {
      out += "\n\n" + section.trim();
    }
  }
  return out + "\n";
}
