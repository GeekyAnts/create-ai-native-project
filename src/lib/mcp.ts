/**
 * MCP (Model Context Protocol) server configuration.
 *
 * The registry stores each server as a tool-neutral spec (`mcp/<id>/mcp.json`).
 * This module translates a set of selected specs into each agentic tool's own
 * MCP config file, MERGING into whatever the project already has so existing
 * servers are never overwritten:
 *
 *   | Tool        | File               | Shape                                     |
 *   | ----------- | ------------------ | ----------------------------------------- |
 *   | claude-code | .mcp.json          | { mcpServers: { <id>: {...} } }           |
 *   | opencode    | opencode.json      | { mcp: { <id>: {...} }, instructions, … } |
 *   | codex       | .codex/config.toml | [mcp_servers.<id>]                        |
 *   | cline       | —                  | (no project-committed MCP file; skipped)  |
 *
 * `composeMcpConfigs` is pure (no I/O) and unit-tested; `loadMcpSpecs` reads the
 * specs from the registry.
 */
import { readTemplateFile, type TemplateFile } from "./templates.js";
import { opencodeConfig, type ToolId } from "./tools.js";

export interface McpServerSpec {
  transport: "stdio" | "http";
  /** stdio: the executable + its arguments (+ optional process env). */
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  /** http: the server URL (+ optional auth headers). */
  url?: string;
  headers?: Record<string, string>;
  /** Human note (key/runtime requirement) — documentation only, never emitted. */
  note?: string;
}

// ---------------------------------------------------------------------------
// Spec parsing + loading
// ---------------------------------------------------------------------------

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Coerce an object's values to a string→string map (drops non-string values). */
function strMap(v: unknown): Record<string, string> | undefined {
  if (!isObj(v)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) if (typeof val === "string") out[k] = val;
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Parse a registry `mcp.json` spec; returns null if malformed or unusable. */
export function parseMcpSpec(raw: string): McpServerSpec | null {
  let s: unknown;
  try {
    s = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(s)) return null;
  const note = typeof s.note === "string" && s.note ? s.note : undefined;

  if (s.transport === "http") {
    if (typeof s.url !== "string" || !s.url) return null;
    return { transport: "http", url: s.url, headers: strMap(s.headers), note };
  }
  // Default to stdio.
  if (typeof s.command !== "string" || !s.command) return null;
  return {
    transport: "stdio",
    command: s.command,
    args: Array.isArray(s.args) ? s.args.map(String) : [],
    env: strMap(s.env),
    note,
  };
}

/** Read + parse the specs for the given MCP server ids (order preserved). */
export async function loadMcpSpecs(
  ids: readonly string[],
): Promise<Record<string, McpServerSpec>> {
  const specs: Record<string, McpServerSpec> = {};
  for (const id of ids) {
    const raw = await readTemplateFile("mcp", id, "mcp.json");
    if (raw === null) continue; // no longer in the registry — skip
    const spec = parseMcpSpec(raw);
    if (spec) specs[id] = spec;
  }
  return specs;
}

// ---------------------------------------------------------------------------
// Per-tool entry shapes
// ---------------------------------------------------------------------------

/** Claude Code `.mcp.json` entry. */
function claudeEntry(spec: McpServerSpec): Record<string, unknown> {
  if (spec.transport === "http") {
    const e: Record<string, unknown> = { type: "http", url: spec.url };
    if (spec.headers) e.headers = spec.headers;
    return e;
  }
  const e: Record<string, unknown> = {
    type: "stdio",
    command: spec.command ?? "",
    args: spec.args ?? [],
  };
  if (spec.env) e.env = spec.env;
  return e;
}

/** OpenCode `opencode.json` `mcp` entry (local = stdio, remote = http). */
function opencodeEntry(spec: McpServerSpec): Record<string, unknown> {
  if (spec.transport === "http") {
    const e: Record<string, unknown> = { type: "remote", url: spec.url, enabled: true };
    if (spec.headers) e.headers = spec.headers;
    return e;
  }
  const e: Record<string, unknown> = {
    type: "local",
    command: [spec.command ?? "", ...(spec.args ?? [])],
    enabled: true,
  };
  if (spec.env) e.environment = spec.env;
  return e;
}

/** A bare TOML key where possible, else a quoted string. */
function tomlKey(k: string): string {
  return /^[A-Za-z0-9_-]+$/.test(k) ? k : JSON.stringify(k);
}

/** Codex `[mcp_servers.<id>]` TOML block. */
function codexBlock(id: string, spec: McpServerSpec): string {
  const head = `[mcp_servers.${tomlKey(id)}]`;
  if (spec.transport === "http") {
    const lines = [head, `url = ${JSON.stringify(spec.url ?? "")}`];
    if (spec.headers && Object.keys(spec.headers).length > 0) {
      const pairs = Object.entries(spec.headers).map(
        ([k, v]) => `${tomlKey(k)} = ${JSON.stringify(v)}`,
      );
      lines.push(`http_headers = { ${pairs.join(", ")} }`);
    }
    return lines.join("\n");
  }
  const lines = [
    head,
    `command = ${JSON.stringify(spec.command ?? "")}`,
    `args = [${(spec.args ?? []).map((a) => JSON.stringify(a)).join(", ")}]`,
  ];
  if (spec.env && Object.keys(spec.env).length > 0) {
    lines.push("", `[mcp_servers.${tomlKey(id)}.env]`);
    for (const [k, v] of Object.entries(spec.env)) lines.push(`${tomlKey(k)} = ${JSON.stringify(v)}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Mergers (never clobber an existing server id)
// ---------------------------------------------------------------------------

function parseJsonObj(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const p = JSON.parse(raw);
    return isObj(p) ? p : {};
  } catch {
    return {};
  }
}

function mergeClaude(existing: string | undefined, servers: Record<string, McpServerSpec>): string {
  const root = parseJsonObj(existing);
  const mcpServers = isObj(root.mcpServers) ? { ...root.mcpServers } : {};
  for (const [id, spec] of Object.entries(servers)) {
    if (id in mcpServers) continue; // never clobber
    mcpServers[id] = claudeEntry(spec);
  }
  root.mcpServers = mcpServers;
  return JSON.stringify(root, null, 2) + "\n";
}

function mergeOpencode(existing: string | undefined, servers: Record<string, McpServerSpec>): string {
  // Start from the on-disk config, or the standard base if there isn't one yet.
  const root = parseJsonObj(existing ?? opencodeConfig());
  const mcp = isObj(root.mcp) ? { ...root.mcp } : {};
  for (const [id, spec] of Object.entries(servers)) {
    if (id in mcp) continue;
    mcp[id] = opencodeEntry(spec);
  }
  root.mcp = mcp;
  return JSON.stringify(root, null, 2) + "\n";
}

function mergeCodex(existing: string | undefined, servers: Record<string, McpServerSpec>): string {
  const base = (existing ?? "").replace(/\s+$/, "");
  const blocks: string[] = [];
  for (const [id, spec] of Object.entries(servers)) {
    if (base.includes(`[mcp_servers.${tomlKey(id)}]`)) continue; // present → skip
    blocks.push(codexBlock(id, spec));
  }
  if (blocks.length === 0) return base.length > 0 ? base + "\n" : "";
  const parts = base.length > 0 ? [base, ...blocks] : blocks;
  return parts.join("\n\n") + "\n";
}

// ---------------------------------------------------------------------------
// Public composer
// ---------------------------------------------------------------------------

export interface ExistingConfigs {
  mcpJson?: string | null;
  opencodeJson?: string | null;
  codexToml?: string | null;
}

/**
 * Produce the per-tool config files for the selected MCP servers, merged into
 * the given existing file contents. `opencode.json` is emitted whenever OpenCode
 * is targeted (it also marks the project OpenCode-aware); `.mcp.json` and
 * `.codex/config.toml` are emitted only when there are servers to add. Cline has
 * no project-committed MCP file, so nothing is emitted for it.
 *
 * Pure — the caller reads the existing files and writes the results.
 */
export function composeMcpConfigs(
  servers: Record<string, McpServerSpec>,
  tools: readonly ToolId[],
  existing: ExistingConfigs = {},
): TemplateFile[] {
  const out: TemplateFile[] = [];
  const hasServers = Object.keys(servers).length > 0;

  if (tools.includes("claude-code") && hasServers) {
    out.push({ path: ".mcp.json", contents: mergeClaude(existing.mcpJson ?? undefined, servers) });
  }
  if (tools.includes("opencode")) {
    out.push({ path: "opencode.json", contents: mergeOpencode(existing.opencodeJson ?? undefined, servers) });
  }
  if (tools.includes("codex") && hasServers) {
    out.push({ path: ".codex/config.toml", contents: mergeCodex(existing.codexToml ?? undefined, servers) });
  }
  return out;
}
