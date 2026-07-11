# Agentic Coding Tools

The first thing the wizard asks is **which agentic coding tool(s)** you use. Pick
any combination of:

- **Claude Code**
- **OpenAI Codex**
- **OpenCode**

The registry stores everything once, in Claude Code's native shape. At
generation time each artifact is **retargeted / translated** into the layout the
selected tool actually reads — so you get valid, tool-native files without
maintaining three copies of anything.

## What each tool gets

| Artifact | Claude Code | OpenCode | OpenAI Codex |
| --- | --- | --- | --- |
| **Instructions** | `CLAUDE.md` | `AGENTS.md` | `AGENTS.md` |
| **Skills** (same `SKILL.md`) | `.claude/skills/<n>/` | reads `.claude/skills` natively | `.agents/skills/<n>/` |
| **Subagents** | `.claude/agents/<n>.md` | `.opencode/agents/<n>.md` | `.codex/agents/<n>.toml` |
| **Config** | — | `opencode.json` | — |

When you select more than one tool, the instruction files share **identical**
composed content, and skills aren't duplicated needlessly (OpenCode reads
`.claude/skills` directly, so no extra copy is made when Claude Code is also on).

## Instructions

The composed knowledge base is written to:

- **`CLAUDE.md`** when Claude Code is selected.
- **`AGENTS.md`** when Codex or OpenCode is selected (the cross-tool standard;
  OpenCode also falls back to `CLAUDE.md`).

Both hold the same content and are appended to on re-runs.

## Skills

`SKILL.md` is byte-identical across all three tools, so skills are pure file
placement — no translation:

- `.claude/skills/<name>/` — Claude Code (and OpenCode reads it natively).
- `.opencode/skills/<name>/` — only when OpenCode is selected **without** Claude Code.
- `.agents/skills/<name>/` — Codex.

## Subagents (translated)

Subagents are genuinely translated from the Claude Code markdown source:

### → OpenCode (`.opencode/agents/<name>.md`)

- `name` is dropped (the filename is the name).
- `mode: subagent` is added.
- Read-only agents get `permission:\n  edit: deny`.
- `model` is intentionally omitted so the agent inherits the workspace default
  (avoids pinning a possibly-stale model id).

```md
---
description: "Reviews the current diff for correctness and security…"
mode: subagent
permission:
  edit: deny
---

You are a focused code reviewer. …
```

### → OpenAI Codex (`.codex/agents/<name>.toml`)

Codex uses TOML with `name`, `description`, and `developer_instructions`:

```toml
name = "code-reviewer"
description = "Reviews the current diff for correctness and security…"
developer_instructions = """
You are a focused code reviewer. …
"""
```

::: tip Stack agents convert too
Each stack ships a specialist agent (e.g. a `react` agent). Because retargeting
runs on **every** copied template, those stack-bundled agents are translated to
your selected tools automatically.
:::

## Adding a tool later

Re-run the CLI in an existing project and select a new tool. It backfills that
tool's layout for everything already installed — instructions file,
`opencode.json`, standalone **and** stack-bundled agents, and skills — without
touching any existing files. Choosing all your tools up front gives the same
result in one pass.
