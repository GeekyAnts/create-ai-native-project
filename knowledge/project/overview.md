---
type: Project Overview
title: create-ai-native-project
description: A CLI that scaffolds an "AI-native" project from Claude Code building blocks sourced from a template registry.
resource: https://github.com/GeekyAnts/create-ai-native-project
tags: [project, cli, create-ai-native-project]
timestamp: 2026-07-16
---

# create-ai-native-project

## Schema

| Field          | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Repository     | `GeekyAnts/create-ai-native-project` on **github.com** (moved 2026-07-11 from `git.geekyants.com/geekyants/create-ai-native-project`; older history: `antfabric/internal-tools/base-claude-setup`) |
| npm package    | `create-ai-native-project`                            |
| Registry repo  | `GeekyAnts/agentic-coding-registry` on **github.com** (templates; moved 2026-07-11 from `git.geekyants.com/geekyants/claude-registry`, renamed) |
| Host           | github.com (both CLI repo and registry)               |
| Default Branch | main                                                  |

## Overview

A **CLI tool** (`create-ai-native-project`) that helps users make a project
"AI-native" using Claude Code building blocks, all sourced from the registry:

- **Project type** — the project shape (monorepo, single, …); provides the
  **base CLAUDE.md** and structural setup files.
- **Tech stack(s)** — e.g. React, NestJS, React Native; each appends a
  **CLAUDE.md section** and drops stack setup files.
- **Skills** — reusable Claude Code skills copied into `.claude/skills/`.
- **Agents** — custom subagents copied into `.claude/agents/`.
- **CLAUDE.md** — *composed* from the project type (base) + each stack (sections).

**Interactive flow:** target (new/existing/`--boot`) → **project name + brief**
(injected into the instructions file) → **agentic coding tool(s)
(Claude Code / Codex / OpenCode / Cline)** → project type (single) →
tech stack(s) → database(s) → vector-db → ORM → storage → auth → IaC →
security standard(s) → MCP server(s) → skills → agents → CI? → docs folder? →
Docker? → generate → optional dependency install.

**Multi-tool output:** the same registry source (Claude-Code-shaped) is
retargeted per selected tool (`lib/tools.ts`): instructions → `CLAUDE.md`
(Claude Code) and/or `AGENTS.md` (Codex/OpenCode/Cline, identical content); skills →
`.claude/skills/` (Claude Code; OpenCode reads it natively) and/or
`.agents/skills/` (Codex) and/or `.clinerules/workflows/<n>.md` (Cline, as slash
commands) — same `SKILL.md`; subagents → `.claude/agents/*.md`,
`.opencode/agents/*.md` (translated frontmatter: no `name`, `mode: subagent`,
`permission.edit: deny` for read-only), and `.codex/agents/*.toml` (`name` /
`description` / `developer_instructions`). Cline has no per-file subagent format,
so subagents aren't emitted for it. OpenCode also gets an `opencode.json`.

Beyond CLAUDE.md + `.claude/`, it composes a runnable **package.json** (project
type base + stack deps/scripts + ORM deps), an optional **docker-compose.yml**
(services from the chosen stacks/databases/vector-db/storage, `build: .` against
per-stack Dockerfiles), CI config, auth setup, IaC scaffolds, and a **docs/**
site. Stacks now span web (React, Next.js, Vue, Svelte, SvelteKit, Astro, Nuxt,
Angular), backend (NestJS, Hono, Laravel, Python FastAPI, Django, Spring Boot,
ASP.NET Core), mobile/desktop (React Native/Expo, Flutter, Tauri), data apps
(Python Streamlit), and **AI-native** (MCP servers TS+Py, Vercel AI SDK,
LangGraph, PydanticAI) — each with runnable boilerplate or a documented starter
+ a Dockerfile. Databases (Postgres/MySQL/MongoDB/Valkey/Neon/Supabase),
**vector-db** (pgvector/Qdrant/Chroma), **ORM** (Prisma/Drizzle), storage
(SeaweedFS/Cloudflare R2/AWS S3), auth (JWT/Clerk/Better Auth/Auth.js), and
**IaC** (OpenTofu) contribute CLAUDE.md sections and/or compose services; CI
(GitHub Actions / GitLab CI) is **composed per selected stack** (one job per
stack). Each stack also **auto-installs a specialist agent**
(`.claude/agents/<stack>.md`), and every project records its state in
**`.ai-native-project.json`** so re-runs (and Claude) stay aware of what's set
up and skip inapplicable actions.

**Distribution & usage:**
- Installed via npm; invocable as `npm create ai-native-project` / `create-ai-native-project`.
- **Bare run** → interactive TUI. If the current directory is an existing
  project, it **adds** the setup there (never overwriting existing files);
  otherwise it **asks for a folder name** and scaffolds a new project.
- **`--boot <project-name>`** → creates that folder and scaffolds into it.
- On first use it **clones** the template registry into the system cache; the
  **`update`** command refreshes it.

**Goal:** streamline standing up a Claude-ready project scaffold from a single CLI.

## Related

- [Decisions](./decisions.md) — why the CLI is built the way it is
- [Registry](./registry.md) — the template source it reads from
- [Layout](./layout.md) — the source tree
- [Change Log](./log.md) — how it evolved
