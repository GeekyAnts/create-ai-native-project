import { readTemplateFile, type TemplateRef } from "./templates.js";

/**
 * Project identity collected up-front and injected into the composed instructions
 * file so the agent has immediate context on what the project is. Substituted
 * into the base template's placeholders (see {@link applyProjectMeta}).
 */
export interface ProjectMeta {
  /** Human-readable project name → replaces the `<Project>` title placeholder. */
  name?: string;
  /** One-line brief → fills the description + Overview placeholders. */
  brief?: string;
  /** Today as `YYYY-MM-DD` → fills the `<YYYY-MM-DD>` date placeholders. */
  date?: string;
}

/**
 * Substitute a project's name/brief/date into a composed instructions file by
 * replacing the base template's placeholder tokens. Only non-empty values are
 * applied, so an unanswered prompt leaves the template's placeholder intact for
 * the user to fill later. Replacement values are inserted literally (a function
 * replacer avoids `$`-pattern surprises from user input).
 */
export function applyProjectMeta(md: string, meta?: ProjectMeta): string {
  if (!meta) return md;
  let out = md;
  const name = meta.name?.trim();
  const brief = meta.brief?.trim();
  if (name) out = out.replace(/<Project>/g, () => name);
  if (brief) {
    out = out.replace(/<one-line description>/g, () => brief);
    // The Overview section ships an italic prompt; replace it with the brief.
    out = out.replace(/_What this project is and the problem it solves\._/g, () => brief);
  }
  if (meta.date) out = out.replace(/<YYYY-MM-DD>/g, () => meta.date!);
  return out;
}

/**
 * Compose the project's CLAUDE.md:
 *   base = the selected project-type's CLAUDE.md (fallback: claude/default)
 *   + one appended section per ref (its CLAUDE.section.md), in order
 *   + project name/brief/date substituted into the base's placeholders
 *
 * `refs` are the chosen stacks, databases, and storage (anything that can
 * contribute a section). Returns null if no base template is available.
 */
export async function composeClaudeMd(
  projectTypeId: string | null,
  refs: TemplateRef[],
  meta?: ProjectMeta,
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
  return applyProjectMeta(out + "\n", meta);
}
