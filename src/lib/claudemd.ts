import { readTemplateFile, type TemplateRef } from "./templates.js";

/**
 * Compose the project's CLAUDE.md:
 *   base = the selected project-type's CLAUDE.md (fallback: claude/default)
 *   + one appended section per ref (its CLAUDE.section.md), in order
 *
 * `refs` are the chosen stacks, databases, and storage (anything that can
 * contribute a section). Returns null if no base template is available.
 */
export async function composeClaudeMd(
  projectTypeId: string | null,
  refs: TemplateRef[],
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
  for (const ref of refs) {
    const section = await readTemplateFile(ref.kind, ref.id, "CLAUDE.section.md");
    if (section && section.trim().length > 0) {
      out += "\n\n" + section.trim();
    }
  }
  return out + "\n";
}
