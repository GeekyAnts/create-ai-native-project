/**
 * OKF (Open Knowledge Format) knowledge bundle composer.
 *
 * Alongside the composed CLAUDE.md / AGENTS.md, every project gets a `knowledge/`
 * OKF v0.1 bundle — a tree of markdown concept files, each with YAML frontmatter,
 * mirroring the project's knowledge base for AI-agent + human consumption.
 *
 * The bundle is composed from the SAME registry fragments that feed CLAUDE.md
 * (each ref's `CLAUDE.section.md` + `template.json`), so there's a single source
 * of truth — no per-stack duplication in the registry. One selected stack /
 * database / auth / etc. becomes one concept file under its area:
 *
 *   knowledge/
 *   ├── index.md            (okf_version: "0.1"; links to overview + areas)
 *   ├── log.md              (change history)
 *   ├── overview.md         (type: Project Overview; project name + brief)
 *   ├── stacks/{index.md, <id>.md}
 *   ├── databases/{index.md, <id>.md}
 *   └── … (one area per section-contributing kind that was selected)
 *
 * Files split into two groups so re-runs behave well (see composeKnowledgeBundle):
 *   - `nav`     — index.md listings; regenerated every run (pure navigation).
 *   - `content` — overview/log/concepts; written create-once (never clobbered).
 */
import {
  readTemplateFile,
  type TemplateFile,
  type TemplateKind,
  type TemplateRef,
} from "./templates.js";
import type { ProjectMeta } from "./claudemd.js";

/** A bundle "area": the concept-bearing directory for one section kind. */
interface AreaDef {
  /** Directory under `knowledge/`. */
  dir: string;
  /** OKF frontmatter `type` for concepts in this area. */
  type: string;
  /** Human heading for the area's index.md. */
  heading: string;
  /** A stable tag applied to every concept in the area. */
  tag: string;
}

/** Section-contributing kinds → their bundle area, in display order. */
const AREAS: Array<[TemplateKind, AreaDef]> = [
  ["stack", { dir: "stacks", type: "Tech Stack", heading: "Stacks", tag: "stack" }],
  ["database", { dir: "databases", type: "Database", heading: "Databases", tag: "database" }],
  ["vector-db", { dir: "vector-db", type: "Vector Store", heading: "Vector Stores", tag: "vector-db" }],
  ["orm", { dir: "orm", type: "ORM", heading: "ORMs", tag: "orm" }],
  ["iac", { dir: "iac", type: "Infrastructure as Code", heading: "Infrastructure as Code", tag: "iac" }],
  ["storage", { dir: "storage", type: "Storage", heading: "Storage", tag: "storage" }],
  ["auth", { dir: "auth", type: "Auth", heading: "Auth", tag: "auth" }],
  ["security", { dir: "security", type: "Security Standard", heading: "Security Standards", tag: "security" }],
  ["mcp", { dir: "mcp", type: "MCP Server", heading: "MCP Servers", tag: "mcp" }],
];
const AREA_BY_KIND = new Map<TemplateKind, AreaDef>(AREAS);

/** A file list split by re-run behavior. */
export interface KnowledgeBundle {
  /** Navigation listings — safe to regenerate every run. */
  nav: TemplateFile[];
  /** Concept + overview + log — written once, never clobbered on add-runs. */
  content: TemplateFile[];
}

/** An area's presence, for linking from the root index + overview. */
interface AreaPresence {
  dir: string;
  heading: string;
}

/** An entry in an area index. */
export interface AreaEntry {
  id: string;
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Pure builders (no IO) — unit-testable in isolation.
// ---------------------------------------------------------------------------

/** Quote a YAML scalar only when it contains characters that need it. */
function yamlScalar(s: string): string {
  return /[:#[\]{}&*!|>'"%@`,]/.test(s) || /^\s|\s$/.test(s) ? JSON.stringify(s) : s;
}

/** Escape a value for a markdown table cell. */
function cell(s: string): string {
  return s.replace(/\|/g, "\\|");
}

/**
 * The concept body from a `CLAUDE.section.md` fragment: drop the fragment's own
 * leading `## …` heading (the concept supplies its own H1) and fall back to the
 * description when there's no usable section.
 */
function sectionBody(section: string | null, fallback: string): string {
  if (!section || section.trim() === "") return fallback;
  const lines = section.trim().split("\n");
  if (/^##\s+/.test(lines[0])) lines.shift();
  const body = lines.join("\n").trim();
  return body.length > 0 ? body : fallback;
}

/** Build one OKF concept file for a selected ref. */
export function buildConcept(opts: {
  type: string;
  title: string;
  description: string;
  tags: string[];
  date?: string;
  section: string | null;
}): string {
  const fm = ["---", `type: ${opts.type}`, `title: ${yamlScalar(opts.title)}`];
  if (opts.description) fm.push(`description: ${yamlScalar(opts.description)}`);
  fm.push(`tags: [${opts.tags.join(", ")}]`);
  if (opts.date) fm.push(`timestamp: ${opts.date}`);
  fm.push("---");

  const body = sectionBody(opts.section, opts.description || opts.title);
  return (
    `${fm.join("\n")}\n\n# ${opts.title}\n\n${body}\n\n` +
    `## Related\n\n- [Overview](../overview.md)\n- [Knowledge Base](../index.md)\n`
  );
}

/** Build an area's index.md (progressive-disclosure listing, no frontmatter). */
export function buildAreaIndex(heading: string, entries: AreaEntry[]): string {
  const lines = [`# ${heading}`, ""];
  for (const e of entries) {
    lines.push(`- [${e.title}](./${e.id}.md)${e.description ? ` — ${e.description}` : ""}`);
  }
  return lines.join("\n") + "\n";
}

/** Build the bundle-root index.md (the only index allowed frontmatter). */
export function buildRootIndex(meta: ProjectMeta | undefined, areas: AreaPresence[]): string {
  const name = meta?.name?.trim() || "Project";
  const brief = meta?.brief?.trim();
  const date = meta?.date;
  const lines = [
    "---",
    'okf_version: "0.1"',
    "---",
    "",
    `# ${name} Knowledge Base`,
    "",
    "Open Knowledge Format (OKF) v0.1 bundle for this project — a tree of markdown",
    "concept files with YAML frontmatter, mirroring the project's knowledge base",
    "(`CLAUDE.md` / `AGENTS.md`) for AI-agent and human consumption.",
    "",
    "- [Overview](./overview.md) — What this project is",
  ];
  for (const a of areas) lines.push(`- [${a.heading}](./${a.dir}/index.md)`);
  lines.push(
    "",
    "## About This Bundle",
    "",
    "| Field | Value |",
    "| ----- | ----- |",
    `| Title | ${cell(name)} Knowledge Base |`,
  );
  if (brief) lines.push(`| Description | ${cell(brief)} |`);
  lines.push('| OKF Version | 0.1 |');
  if (date) lines.push(`| Last Updated | ${date} |`);
  lines.push("", "See [log.md](./log.md) for this bundle's change history.");
  return lines.join("\n") + "\n";
}

/** Build overview.md — the project concept. */
export function buildOverview(meta: ProjectMeta | undefined, areas: AreaPresence[]): string {
  const title = meta?.name?.trim() || "Project";
  const brief = meta?.brief?.trim();
  const date = meta?.date;
  const fm = ["---", "type: Project Overview", `title: ${yamlScalar(title)}`];
  if (brief) fm.push(`description: ${yamlScalar(brief)}`);
  fm.push("tags: [project, overview]");
  if (date) fm.push(`timestamp: ${date}`);
  fm.push("---");

  const body = [
    `# ${title}`,
    "",
    brief || "_What this project is and the problem it solves._",
    "",
    "The project's full, living knowledge base is in `CLAUDE.md` (and `AGENTS.md`",
    "where present). This bundle mirrors it as OKF concept files.",
  ];
  if (areas.length > 0) {
    body.push("", "## Areas", "");
    for (const a of areas) body.push(`- [${a.heading}](./${a.dir}/index.md)`);
  }
  return `${fm.join("\n")}\n\n${body.join("\n")}\n`;
}

/** Build log.md — the reserved change-history file (no frontmatter). */
export function buildLog(meta: ProjectMeta | undefined): string {
  const date = meta?.date;
  const lines = ["# Update Log", ""];
  if (date) lines.push(`## ${date}`);
  lines.push("- **Creation**: Initialized the OKF knowledge bundle.");
  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// IO composer
// ---------------------------------------------------------------------------

async function readTemplateMeta(
  kind: TemplateKind,
  id: string,
): Promise<{ name: string; description: string }> {
  const raw = await readTemplateFile(kind, id, "template.json");
  if (raw) {
    try {
      const m = JSON.parse(raw);
      return { name: m.name ?? id, description: m.description ?? "" };
    } catch {
      // fall through to defaults on malformed manifest
    }
  }
  return { name: id, description: "" };
}

/**
 * Compose the full `knowledge/` OKF bundle from the given refs (the same
 * section-contributing selections that feed CLAUDE.md). Refs whose kind isn't a
 * bundle area (e.g. project-type) are ignored; unknown ids are read best-effort.
 */
export async function composeKnowledgeBundle(
  refs: TemplateRef[],
  meta?: ProjectMeta,
): Promise<KnowledgeBundle> {
  const date = meta?.date;

  // Group refs by kind, preserving order and de-duping ids within a kind.
  const grouped = new Map<TemplateKind, AreaEntry[]>();
  for (const ref of refs) {
    if (!AREA_BY_KIND.has(ref.kind)) continue;
    const list = grouped.get(ref.kind) ?? [];
    if (list.some((e) => e.id === ref.id)) continue;
    const m = await readTemplateMeta(ref.kind, ref.id);
    list.push({ id: ref.id, title: m.name, description: m.description });
    grouped.set(ref.kind, list);
  }

  const nav: TemplateFile[] = [];
  const content: TemplateFile[] = [];
  const present: AreaPresence[] = [];

  for (const [kind, area] of AREAS) {
    const list = grouped.get(kind);
    if (!list || list.length === 0) continue;
    present.push({ dir: area.dir, heading: area.heading });
    nav.push({ path: `knowledge/${area.dir}/index.md`, contents: buildAreaIndex(area.heading, list) });
    for (const e of list) {
      const section = await readTemplateFile(kind, e.id, "CLAUDE.section.md");
      content.push({
        path: `knowledge/${area.dir}/${e.id}.md`,
        contents: buildConcept({
          type: area.type,
          title: e.title,
          description: e.description,
          tags: [area.tag, e.id],
          date,
          section,
        }),
      });
    }
  }

  // Root index + overview + log always present (a bundle with no areas is still
  // a valid OKF bundle).
  nav.unshift({ path: "knowledge/index.md", contents: buildRootIndex(meta, present) });
  content.unshift({ path: "knowledge/overview.md", contents: buildOverview(meta, present) });
  content.unshift({ path: "knowledge/log.md", contents: buildLog(meta) });

  return { nav, content };
}
