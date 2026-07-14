import { describe, expect, it } from "vitest";
import {
  composeMcpConfigs,
  parseMcpSpec,
  type McpServerSpec,
} from "../src/lib/mcp.js";

const STDIO: McpServerSpec = {
  transport: "stdio",
  command: "npx",
  args: ["-y", "chrome-devtools-mcp@latest"],
};
const HTTP: McpServerSpec = {
  transport: "http",
  url: "https://mcp.context7.com/mcp",
};

const byPath = (files: { path: string; contents: string }[]) =>
  Object.fromEntries(files.map((f) => [f.path, f.contents]));

describe("parseMcpSpec", () => {
  it("parses a stdio spec, dropping the doc-only note from emitted config", () => {
    const spec = parseMcpSpec(
      JSON.stringify({ transport: "stdio", command: "uvx", args: ["mcp-server-git"], note: "needs uv" }),
    );
    expect(spec).toEqual({ transport: "stdio", command: "uvx", args: ["mcp-server-git"], env: undefined, note: "needs uv" });
  });

  it("parses an http spec", () => {
    const spec = parseMcpSpec(JSON.stringify({ transport: "http", url: "https://x/mcp" }));
    expect(spec?.transport).toBe("http");
    expect(spec?.url).toBe("https://x/mcp");
  });

  it("returns null for malformed JSON or a missing command/url", () => {
    expect(parseMcpSpec("{not json")).toBeNull();
    expect(parseMcpSpec(JSON.stringify({ transport: "stdio" }))).toBeNull();
    expect(parseMcpSpec(JSON.stringify({ transport: "http" }))).toBeNull();
  });
});

describe("composeMcpConfigs — per-tool shapes", () => {
  it("emits .mcp.json for Claude Code with stdio + http entries", () => {
    const files = byPath(
      composeMcpConfigs({ "chrome-devtools": STDIO, context7: HTTP }, ["claude-code"]),
    );
    expect(Object.keys(files)).toEqual([".mcp.json"]);
    const cfg = JSON.parse(files[".mcp.json"]);
    expect(cfg.mcpServers["chrome-devtools"]).toEqual({
      type: "stdio",
      command: "npx",
      args: ["-y", "chrome-devtools-mcp@latest"],
    });
    expect(cfg.mcpServers.context7).toEqual({ type: "http", url: "https://mcp.context7.com/mcp" });
  });

  it("emits opencode.json with base + mcp block (local/remote)", () => {
    const files = byPath(
      composeMcpConfigs({ "chrome-devtools": STDIO, context7: HTTP }, ["opencode"]),
    );
    expect(Object.keys(files)).toEqual(["opencode.json"]);
    const cfg = JSON.parse(files["opencode.json"]);
    expect(cfg.instructions).toEqual(["AGENTS.md"]); // base preserved
    expect(cfg.mcp["chrome-devtools"]).toEqual({
      type: "local",
      command: ["npx", "-y", "chrome-devtools-mcp@latest"],
      enabled: true,
    });
    expect(cfg.mcp.context7).toEqual({ type: "remote", url: "https://mcp.context7.com/mcp", enabled: true });
  });

  it("emits parseable .codex/config.toml tables for Codex", () => {
    const files = byPath(
      composeMcpConfigs({ "chrome-devtools": STDIO, context7: HTTP }, ["codex"]),
    );
    const toml = files[".codex/config.toml"];
    expect(toml).toContain("[mcp_servers.chrome-devtools]");
    expect(toml).toContain('command = "npx"');
    expect(toml).toContain('args = ["-y", "chrome-devtools-mcp@latest"]');
    expect(toml).toContain("[mcp_servers.context7]");
    expect(toml).toContain('url = "https://mcp.context7.com/mcp"');
  });

  it("emits nothing for Cline (no project-committed MCP file)", () => {
    expect(composeMcpConfigs({ "chrome-devtools": STDIO }, ["cline"])).toEqual([]);
  });

  it("still emits opencode.json (base only) when OpenCode is targeted with no servers", () => {
    const files = byPath(composeMcpConfigs({}, ["opencode", "claude-code"]));
    expect(Object.keys(files)).toEqual(["opencode.json"]); // no empty .mcp.json
    expect(JSON.parse(files["opencode.json"]).mcp).toEqual({});
  });

  it("targets all requested tools at once", () => {
    const files = byPath(
      composeMcpConfigs({ context7: HTTP }, ["claude-code", "opencode", "codex", "cline"]),
    );
    expect(Object.keys(files).sort()).toEqual([".codex/config.toml", ".mcp.json", "opencode.json"]);
  });
});

describe("composeMcpConfigs — merge (never clobber)", () => {
  it("adds a new server to an existing .mcp.json without touching the existing one", () => {
    const existingRaw = JSON.stringify({
      mcpServers: { existing: { type: "stdio", command: "custom", args: ["--flag"] } },
    });
    const files = byPath(
      composeMcpConfigs({ context7: HTTP }, ["claude-code"], { mcpJson: existingRaw }),
    );
    const cfg = JSON.parse(files[".mcp.json"]);
    // Existing server preserved verbatim.
    expect(cfg.mcpServers.existing).toEqual({ type: "stdio", command: "custom", args: ["--flag"] });
    // New server added.
    expect(cfg.mcpServers.context7.url).toBe("https://mcp.context7.com/mcp");
  });

  it("does not overwrite a server id that already exists (user config wins)", () => {
    const existingRaw = JSON.stringify({
      mcpServers: { context7: { type: "http", url: "https://my-mirror/mcp" } },
    });
    const files = byPath(
      composeMcpConfigs({ context7: HTTP }, ["claude-code"], { mcpJson: existingRaw }),
    );
    expect(JSON.parse(files[".mcp.json"]).mcpServers.context7.url).toBe("https://my-mirror/mcp");
  });

  it("appends a Codex table only when its marker is absent (idempotent)", () => {
    const first = byPath(composeMcpConfigs({ context7: HTTP }, ["codex"]))[".codex/config.toml"];
    // Re-composing with the same server against the prior output adds nothing.
    const second = byPath(
      composeMcpConfigs({ context7: HTTP }, ["codex"], { codexToml: first }),
    )[".codex/config.toml"];
    expect(second).toBe(first);
    // Occurs exactly once.
    expect(second.match(/\[mcp_servers\.context7\]/g)).toHaveLength(1);
  });

  it("preserves an existing Codex table and appends a new one", () => {
    const existing = '[mcp_servers.custom]\ncommand = "foo"\nargs = []\n';
    const out = byPath(
      composeMcpConfigs({ context7: HTTP }, ["codex"], { codexToml: existing }),
    )[".codex/config.toml"];
    expect(out).toContain("[mcp_servers.custom]");
    expect(out).toContain("[mcp_servers.context7]");
  });
});
