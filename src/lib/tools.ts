/**
 * Agentic coding tool targets.
 *
 * The registry stores everything in Claude Code's native shape: CLAUDE.md
 * sections, `.claude/agents/<name>.md` (markdown + YAML frontmatter), and
 * `.claude/skills/<name>/SKILL.md`. This module retargets/translates that single
 * source into the shape each selected tool actually reads:
 *
 *   | Artifact     | claude-code            | opencode                     | codex                          |
 *   | ------------ | ---------------------- | ---------------------------- | ------------------------------ |
 *   | Instructions | CLAUDE.md              | AGENTS.md (CLAUDE.md fallbk) | AGENTS.md                      |
 *   | Skills       | .claude/skills/<n>/    | reads .claude/skills natively| .agents/skills/<n>/            |
 *   | Subagents    | .claude/agents/<n>.md  | .opencode/agents/<n>.md      | .codex/agents/<n>.toml (TOML)  |
 *   | Config       | —                      | opencode.json                | (skipped: global/footgun)      |
 *
 * SKILL.md is byte-identical across all three tools, so skills are pure file
 * placement. Subagents need real translation (frontmatter differs per tool).
 */
import type { TemplateFile } from "./templates.js";

export type ToolId = "claude-code" | "codex" | "opencode";

export interface ToolMeta {
  id: ToolId;
  label: string;
  hint: string;
}

/** Selectable agentic coding tools (order = display order). */
export const AGENTIC_TOOLS: ToolMeta[] = [
  { id: "claude-code", label: "Claude Code", hint: "CLAUDE.md + .claude/{skills,agents}" },
  { id: "codex", label: "OpenAI Codex", hint: "AGENTS.md + .agents/skills + .codex/agents (TOML)" },
  { id: "opencode", label: "OpenCode", hint: "AGENTS.md + .opencode/agents + opencode.json" },
];

const TOOL_IDS = new Set<string>(AGENTIC_TOOLS.map((t) => t.id));

/** Default when a project predates tool selection: everything was Claude Code. */
export const DEFAULT_TOOLS: ToolId[] = ["claude-code"];

/** Coerce arbitrary input to a valid, de-duped tool list (falls back to default). */
export function normalizeTools(input: readonly string[] | undefined | null): ToolId[] {
  const out = [...new Set((input ?? []).filter((t): t is ToolId => TOOL_IDS.has(t)))];
  return out.length > 0 ? out : [...DEFAULT_TOOLS];
}

/**
 * Instruction files the composed CLAUDE.md content should be written to.
 * Claude Code reads CLAUDE.md; Codex and OpenCode read AGENTS.md (OpenCode also
 * falls back to CLAUDE.md, but AGENTS.md is its canonical file).
 */
export function instructionFiles(tools: readonly ToolId[]): string[] {
  const files: string[] = [];
  if (tools.includes("claude-code")) files.push("CLAUDE.md");
  if (tools.includes("codex") || tools.includes("opencode")) files.push("AGENTS.md");
  return files.length > 0 ? files : ["CLAUDE.md"];
}

// ---------------------------------------------------------------------------
// Agent frontmatter parsing (Claude Code markdown agents)
// ---------------------------------------------------------------------------

export interface ParsedAgent {
  name?: string;
  description?: string;
  /** The Claude `tools:` allowlist, split into individual tool names. */
  tools?: string[];
  model?: string;
  /** Everything after the frontmatter block — the system prompt. */
  body: string;
}

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Parse a Claude Code agent markdown file. Handles the small YAML subset the
 * registry uses: plain scalars, quoted scalars, folded blocks (`>-`/`>`) and
 * literal blocks (`|`). Unknown keys are ignored; a file without frontmatter
 * yields `{ body }` only.
 */
export function parseAgentMarkdown(content: string): ParsedAgent {
  const m = FM_RE.exec(content);
  if (!m) return { body: content.trim() };
  const [, fm, body] = m;

  const fields: Record<string, string> = {};
  const lines = fm.split(/\r?\n/);
  let currentKey: string | null = null;
  let blockMode: "fold" | "literal" | null = null;
  let blockLines: string[] = [];

  const flush = () => {
    if (currentKey && blockMode) {
      fields[currentKey] = (
        blockMode === "fold" ? blockLines.join(" ") : blockLines.join("\n")
      ).trim();
    }
    blockMode = null;
    blockLines = [];
  };

  for (const line of lines) {
    const top = /^([A-Za-z_][\w-]*):\s?(.*)$/.exec(line);
    // A continuation line (indented) belongs to the current block scalar.
    if (blockMode && (/^\s+/.test(line) || line.trim() === "")) {
      blockLines.push(line.trim());
      continue;
    }
    if (top) {
      flush();
      currentKey = top[1];
      const raw = top[2];
      if (raw === ">" || raw === ">-" || raw === ">+") {
        blockMode = "fold";
      } else if (raw === "|" || raw === "|-" || raw === "|+") {
        blockMode = "literal";
      } else if (raw === "") {
        // Empty value: could be an implicit folded block on following lines.
        blockMode = "fold";
      } else {
        fields[currentKey] = unquote(raw);
        currentKey = null;
      }
    }
  }
  flush();

  const parsed: ParsedAgent = { body: body.trim() };
  if (fields.name) parsed.name = fields.name;
  if (fields.description) parsed.description = fields.description;
  if (fields.model) parsed.model = fields.model;
  if (fields.tools) {
    parsed.tools = fields.tools
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return parsed;
}

function unquote(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
    (t.startsWith("'") && t.endsWith("'") && t.length >= 2)
  ) {
    return t.slice(1, -1);
  }
  return t;
}

/** Tools that let an agent mutate files — used to preserve read-only intent. */
const WRITE_TOOLS = new Set([
  "write",
  "edit",
  "multiedit",
  "notebookedit",
  "applypatch",
  "apply_patch",
]);

function isReadOnly(tools: string[] | undefined): boolean {
  if (!tools || tools.length === 0) return false;
  return !tools.some((t) => WRITE_TOOLS.has(t.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Per-tool agent emitters
// ---------------------------------------------------------------------------

/**
 * OpenCode agent: `.opencode/agents/<name>.md`. No `name` field (it's the
 * filename); Claude subagents map to `mode: subagent`. `model` is intentionally
 * omitted so the agent inherits the workspace default (avoids pinning a possibly
 * stale provider/model id). A read-only Claude agent gets `permission.edit: deny`.
 */
export function toOpenCodeAgent(a: ParsedAgent): string {
  const head = ["---", `description: ${JSON.stringify(a.description ?? a.name ?? "Custom agent")}`, "mode: subagent"];
  if (isReadOnly(a.tools)) {
    head.push("permission:", "  edit: deny");
  }
  head.push("---");
  return `${head.join("\n")}\n\n${a.body.trim()}\n`;
}

/**
 * Codex agent: `.codex/agents/<name>.toml`. Codex uses TOML with `name`,
 * `description`, and `developer_instructions` (the system prompt).
 */
export function toCodexAgentToml(a: ParsedAgent, fallbackName: string): string {
  const name = a.name ?? fallbackName;
  const lines = [
    `name = ${tomlBasicString(name)}`,
    `description = ${tomlBasicString(a.description ?? name)}`,
    `developer_instructions = ${tomlMultiline(a.body.trim())}`,
  ];
  return lines.join("\n") + "\n";
}

/** TOML basic (single-line) string. JSON escaping is a compatible subset. */
function tomlBasicString(s: string): string {
  return JSON.stringify(s);
}

/** TOML multi-line basic string; escape backslashes and any `"""` delimiter. */
function tomlMultiline(s: string): string {
  const esc = s.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
  return `"""\n${esc}\n"""`;
}

// ---------------------------------------------------------------------------
// Retargeting a fetched template's files for the selected tools
// ---------------------------------------------------------------------------

const AGENT_RE = /^\.claude\/agents\/(.+)\.md$/;
const SKILL_RE = /^\.claude\/skills\/([^/]+)\/(.+)$/;

/** Skill destination base dirs for the selected tools (idiomatic per tool). */
export function skillBaseDirs(tools: readonly ToolId[]): string[] {
  const dirs: string[] = [];
  if (tools.includes("claude-code")) dirs.push(".claude/skills");
  // OpenCode reads .claude/skills natively; only add its own dir when Claude
  // Code isn't also selected (avoids a redundant copy).
  if (tools.includes("opencode") && !tools.includes("claude-code")) {
    dirs.push(".opencode/skills");
  }
  if (tools.includes("codex")) dirs.push(".agents/skills");
  return dirs;
}

const norm = (p: string): string => p.replace(/\\/g, "/");

/**
 * Rewrite a fetched template's files for the selected tools. Files under
 * `.claude/agents/*.md` and `.claude/skills/**` are translated/placed per tool;
 * every other file passes through unchanged. Returns a new file list.
 */
export function retargetForTools(
  files: TemplateFile[],
  tools: readonly ToolId[],
): TemplateFile[] {
  const skillDirs = skillBaseDirs(tools);
  const out: TemplateFile[] = [];

  for (const file of files) {
    const path = norm(file.path);

    const agentMatch = AGENT_RE.exec(path);
    if (agentMatch) {
      const name = agentMatch[1];
      const parsed = parseAgentMarkdown(file.contents);
      if (tools.includes("claude-code")) {
        out.push({ path: file.path, contents: file.contents });
      }
      if (tools.includes("opencode")) {
        out.push({ path: `.opencode/agents/${name}.md`, contents: toOpenCodeAgent(parsed) });
      }
      if (tools.includes("codex")) {
        out.push({ path: `.codex/agents/${name}.toml`, contents: toCodexAgentToml(parsed, name) });
      }
      continue;
    }

    const skillMatch = SKILL_RE.exec(path);
    if (skillMatch) {
      const [, skillName, rest] = skillMatch;
      for (const base of skillDirs) {
        out.push({ path: `${base}/${skillName}/${rest}`, contents: file.contents });
      }
      continue;
    }

    out.push(file);
  }

  return out;
}

/** Minimal opencode.json marking the project as OpenCode-aware. */
export function opencodeConfig(): string {
  return (
    JSON.stringify(
      {
        $schema: "https://opencode.ai/config.json",
        instructions: ["AGENTS.md"],
      },
      null,
      2,
    ) + "\n"
  );
}

/**
 * Names of installed agents/skills across every tool's directory layout, for
 * recording in the manifest (independent of which tools were chosen).
 */
export function installedNames(paths: string[], kind: "agents" | "skills"): string[] {
  const out = new Set<string>();
  const patterns =
    kind === "agents"
      ? [/(?:\.claude|\.opencode)\/agents\/([^/]+)\.md$/, /\.codex\/agents\/([^/]+)\.toml$/]
      : [/(?:\.claude|\.opencode|\.agents)\/skills\/([^/]+)\//];
  for (const raw of paths) {
    const p = norm(raw);
    for (const re of patterns) {
      const m = re.exec(p);
      if (m) out.add(m[1]);
    }
  }
  return [...out];
}
