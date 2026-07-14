import { describe, expect, it } from "vitest";
import {
  installedNames,
  instructionFiles,
  normalizeTools,
  opencodeConfig,
  parseAgentMarkdown,
  retargetForTools,
  skillBaseDirs,
  toCodexAgentToml,
  toOpenCodeAgent,
} from "../src/lib/tools.js";
import type { TemplateFile } from "../src/lib/templates.js";

const AGENT_MD = `---
name: code-reviewer
description: >-
  Reviews the current diff for correctness bugs, clarity, and security.
  Use after implementing a change.
tools: Bash, Read, Grep, Glob
---

You are a focused code reviewer.

## Scope
- Review only what changed.
`;

const AGENT_WITH_WRITE = `---
name: builder
description: Builds features.
tools: Read, Write, Edit, Bash
---

Build stuff.
`;

describe("normalizeTools", () => {
  it("filters unknown ids and de-dupes", () => {
    expect(normalizeTools(["claude-code", "bogus", "codex", "codex"])).toEqual([
      "claude-code",
      "codex",
    ]);
  });
  it("falls back to claude-code on empty/invalid input", () => {
    expect(normalizeTools([])).toEqual(["claude-code"]);
    expect(normalizeTools(undefined)).toEqual(["claude-code"]);
    expect(normalizeTools(["nope"])).toEqual(["claude-code"]);
  });
});

describe("instructionFiles", () => {
  it("maps tools to their instruction files", () => {
    expect(instructionFiles(["claude-code"])).toEqual(["CLAUDE.md"]);
    expect(instructionFiles(["codex"])).toEqual(["AGENTS.md"]);
    expect(instructionFiles(["opencode"])).toEqual(["AGENTS.md"]);
    expect(instructionFiles(["cline"])).toEqual(["AGENTS.md"]);
    expect(instructionFiles(["claude-code", "codex"])).toEqual(["CLAUDE.md", "AGENTS.md"]);
    expect(instructionFiles(["codex", "opencode"])).toEqual(["AGENTS.md"]);
  });
});

describe("skillBaseDirs", () => {
  it("routes skills to idiomatic dirs per tool", () => {
    expect(skillBaseDirs(["claude-code"])).toEqual([".claude/skills"]);
    // OpenCode reads .claude/skills natively; no redundant copy when Claude is on.
    expect(skillBaseDirs(["claude-code", "opencode"])).toEqual([".claude/skills"]);
    // OpenCode-only uses its own dir.
    expect(skillBaseDirs(["opencode"])).toEqual([".opencode/skills"]);
    expect(skillBaseDirs(["codex"])).toEqual([".agents/skills"]);
    expect(skillBaseDirs(["claude-code", "codex"])).toEqual([".claude/skills", ".agents/skills"]);
  });
});

describe("parseAgentMarkdown", () => {
  it("parses name, folded description, tools, and body", () => {
    const a = parseAgentMarkdown(AGENT_MD);
    expect(a.name).toBe("code-reviewer");
    expect(a.description).toBe(
      "Reviews the current diff for correctness bugs, clarity, and security. Use after implementing a change.",
    );
    expect(a.tools).toEqual(["Bash", "Read", "Grep", "Glob"]);
    expect(a.body.startsWith("You are a focused code reviewer.")).toBe(true);
  });
  it("handles a plain (unquoted) description and no tools", () => {
    const a = parseAgentMarkdown(`---\nname: react\ndescription: React specialist.\n---\n\nBody.\n`);
    expect(a.name).toBe("react");
    expect(a.description).toBe("React specialist.");
    expect(a.tools).toBeUndefined();
  });
  it("returns body only when there is no frontmatter", () => {
    const a = parseAgentMarkdown("Just a prompt, no frontmatter.");
    expect(a.name).toBeUndefined();
    expect(a.body).toBe("Just a prompt, no frontmatter.");
  });
});

describe("toOpenCodeAgent", () => {
  it("drops name, sets subagent mode, denies edit for read-only agents", () => {
    const md = toOpenCodeAgent(parseAgentMarkdown(AGENT_MD));
    expect(md).not.toMatch(/^name:/m);
    expect(md).toMatch(/^mode: subagent$/m);
    expect(md).toMatch(/description: "Reviews the current diff/);
    expect(md).toMatch(/permission:\n {2}edit: deny/);
    expect(md).toMatch(/You are a focused code reviewer\./);
  });
  it("omits permission when the agent can already write", () => {
    const md = toOpenCodeAgent(parseAgentMarkdown(AGENT_WITH_WRITE));
    expect(md).not.toMatch(/permission:/);
  });
});

describe("toCodexAgentToml", () => {
  it("emits name/description/developer_instructions TOML", () => {
    const toml = toCodexAgentToml(parseAgentMarkdown(AGENT_MD), "fallback");
    expect(toml).toMatch(/^name = "code-reviewer"$/m);
    expect(toml).toMatch(/^description = "Reviews the current diff/m);
    expect(toml).toMatch(/developer_instructions = """/);
    expect(toml).toMatch(/You are a focused code reviewer\./);
  });
  it("uses the fallback name when frontmatter has none", () => {
    const toml = toCodexAgentToml(parseAgentMarkdown("No frontmatter body."), "my-agent");
    expect(toml).toMatch(/^name = "my-agent"$/m);
  });
  it("escapes a triple-quote sequence in the body", () => {
    const toml = toCodexAgentToml({ body: 'a """ b' }, "x");
    expect(toml).toContain('\\"\\"\\"');
  });
});

describe("retargetForTools", () => {
  const files: TemplateFile[] = [
    { path: ".claude/agents/code-reviewer.md", contents: AGENT_MD },
    { path: ".claude/skills/eng/SKILL.md", contents: "# skill" },
    { path: "src/index.ts", contents: "export {};" },
  ];

  it("keeps Claude layout for claude-code", () => {
    const out = retargetForTools(files, ["claude-code"]);
    const paths = out.map((f) => f.path);
    expect(paths).toContain(".claude/agents/code-reviewer.md");
    expect(paths).toContain(".claude/skills/eng/SKILL.md");
    expect(paths).toContain("src/index.ts");
  });

  it("translates agents and places skills for codex + opencode", () => {
    const out = retargetForTools(files, ["codex", "opencode"]);
    const paths = out.map((f) => f.path);
    // Agent → both an OpenCode md and a Codex toml (no .claude agent).
    expect(paths).toContain(".opencode/agents/code-reviewer.md");
    expect(paths).toContain(".codex/agents/code-reviewer.toml");
    expect(paths).not.toContain(".claude/agents/code-reviewer.md");
    // Skill → opencode's own dir + codex's dir.
    expect(paths).toContain(".opencode/skills/eng/SKILL.md");
    expect(paths).toContain(".agents/skills/eng/SKILL.md");
    // Passthrough file untouched.
    expect(paths).toContain("src/index.ts");
  });

  it("maps a skill to a Cline workflow and skips agents for cline", () => {
    const out = retargetForTools(files, ["cline"]);
    const paths = out.map((f) => f.path);
    // Skill's SKILL.md → .clinerules/workflows/<name>.md (a /slash command).
    expect(paths).toContain(".clinerules/workflows/eng.md");
    // Cline has no per-file subagent format → no agent files emitted.
    expect(paths.some((p) => /\/agents\//.test(p))).toBe(false);
    // Passthrough file untouched.
    expect(paths).toContain("src/index.ts");
  });

  it("emits all three agent layouts when all tools are selected", () => {
    const out = retargetForTools(files, ["claude-code", "codex", "opencode"]);
    const paths = out.map((f) => f.path);
    expect(paths).toContain(".claude/agents/code-reviewer.md");
    expect(paths).toContain(".opencode/agents/code-reviewer.md");
    expect(paths).toContain(".codex/agents/code-reviewer.toml");
    // Skill only under .claude (opencode reads it) + .agents (codex).
    expect(paths.filter((p) => p.endsWith("eng/SKILL.md")).sort()).toEqual([
      ".agents/skills/eng/SKILL.md",
      ".claude/skills/eng/SKILL.md",
    ]);
  });
});

describe("installedNames", () => {
  it("extracts agent/skill names across every tool layout", () => {
    const paths = [
      ".claude/agents/code-reviewer.md",
      ".opencode/agents/react.md",
      ".codex/agents/security-reviewer.toml",
      ".claude/skills/eng/SKILL.md",
      ".agents/skills/knowledge-base/SKILL.md",
      "src/index.ts",
    ];
    expect(installedNames(paths, "agents").sort()).toEqual([
      "code-reviewer",
      "react",
      "security-reviewer",
    ]);
    expect(installedNames(paths, "skills").sort()).toEqual(["eng", "knowledge-base"]);
  });
});

describe("opencodeConfig", () => {
  it("is valid JSON pointing at AGENTS.md", () => {
    const cfg = JSON.parse(opencodeConfig());
    expect(cfg.$schema).toBe("https://opencode.ai/config.json");
    expect(cfg.instructions).toEqual(["AGENTS.md"]);
  });
});
