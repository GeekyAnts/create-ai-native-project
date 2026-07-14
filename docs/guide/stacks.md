# Stacks & Add-ons

Everything below comes from the [template registry](/reference/configuration),
so the exact catalog can grow without a CLI release. This is the current set.

## Tech stacks

Each stack contributes an instructions section, a `package.json` fragment (where
applicable), CI job fragments, a Dockerfile, and a **specialist agent** —
retargeted to your selected [tools](/guide/coding-tools). Stacks marked
_Starter_ scaffold a documented skeleton via the framework's official CLI;
the rest ship runnable boilerplate.

### Web

| Stack | Notes |
| --- | --- |
| **React** (Vite) | Runnable boilerplate |
| **Next.js** (App Router) | Runnable boilerplate |
| **Vue** (Vue 3 + Vite) | Runnable boilerplate |
| **Svelte** (Vite SPA) | Runnable boilerplate |
| **SvelteKit** | Meta-framework, `adapter-node` |
| **Astro** | Static-first site |
| **Nuxt** | Nuxt SSR |
| **Angular** | Starter |

### Backend

| Stack | Notes |
| --- | --- |
| **NestJS** | Runnable boilerplate |
| **Hono** | Multi-runtime; build + runtime-smoke verified |
| **Laravel** (PHP) | Starter |
| **Python FastAPI** | Runnable boilerplate |
| **Django** (Python) | Minimal runnable (`manage.py check`) |
| **Spring Boot** (Java) | Starter |
| **ASP.NET Core** (.NET) | Starter |

### Mobile & desktop

| Stack | Notes |
| --- | --- |
| **React Native** (Expo SDK 57) | Starter (full skeleton via the official CLI) |
| **Flutter** | Starter (full skeleton via the official CLI) |
| **Tauri** | Frontend-agnostic desktop shell |

### Data apps

| Stack | Notes |
| --- | --- |
| **Python Streamlit** | Runnable boilerplate |

### AI-native stacks

The on-brand core — scaffolds for building AI apps and agents, each defaulting to
the latest Claude models.

| Stack | Notes |
| --- | --- |
| **MCP server** (TypeScript) | Model Context Protocol server; stdio-first, HTTP documented |
| **MCP server** (Python) | Same, Python SDK |
| **Vercel AI SDK** | Next.js chat UI, AI SDK v5 + Claude |
| **LangGraph** | Node agent, LangChain 1.0 `createAgent` + Claude |
| **PydanticAI** | Type-safe Python agents + Claude |

::: tip LLM provider, always
Every project's base instructions include an **LLM-provider** section (Anthropic /
OpenAI SDK starter, default to the latest Claude) and a **Deploying** section
(Vercel / Cloudflare Workers / Netlify / Railway / Fly / Render) — no separate
selection needed.
:::

## Databases

`Postgres` · `MySQL` · `MongoDB` · `Valkey` (BSD-3 Redis-compatible) ·
`Neon` (managed serverless Postgres) · `Supabase` (Postgres + Auth + Storage) —
each adds an instructions section, and self-hostable ones add a `docker-compose`
service.

## Vector databases

For RAG and AI-native apps — pick alongside a stack:

`pgvector` (**default**; drops into a Postgres service) · `Qdrant` (REST + gRPC) ·
`Chroma`. Each contributes an instructions section and, where self-hosted, a
compose service.

## ORMs

`Prisma` (v7 — `prisma.config.ts` + `@prisma/adapter-pg` driver adapter) ·
`Drizzle` (SQL-first). The ORM's dependencies are **merged into your
`package.json`** and it adds an instructions section.

## Storage

`SeaweedFS` (Apache-2.0, S3-compatible — **self-host default**, adds a compose
service) · `Cloudflare R2` (managed, $0 egress) · `AWS S3` — instructions
section per selection.

::: info MinIO removed
MinIO was dropped over license risk (AGPL / likely source-available relicense).
**SeaweedFS** is the self-hosted default; **Cloudflare R2** the managed option.
:::

## Auth

`JWT` · `Clerk` · `Better Auth` · `Auth.js` (NextAuth) — instructions section
plus verbatim setup files where applicable.

## Infrastructure as Code

`OpenTofu` (MPL-2.0) — a `.tf` scaffold plus an instructions section.
(Terraform is intentionally **not** offered — it's under the source-available
BSL.)

## CI

`GitHub Actions` · `GitLab CI` — the pipeline is **composed per stack**: a base
skeleton plus one job per selected stack (or one job per app in a monorepo).

## Docker

Opt in to generate a `docker-compose.yml` composed from a base plus one service
per stack / database / vector-db / storage selection. Stacks use `build: .`
against their per-stack Dockerfile; in a monorepo, each app gets its own
build-based service.

## Docs

Optionally scaffold a self-contained docs site into `docs/` — choose
**Docusaurus**, **Fumadocs** (Next.js), or **Starlight** (Astro). Each is its own
sub-project — its `package.json` is copied, not merged into your root.

## MCP servers

[Model Context Protocol](https://modelcontextprotocol.io) servers are the
external tools your agent can call. Pick from a curated, developer-focused set:

| Server | What it gives the agent | Runs via |
| --- | --- | --- |
| **Chrome DevTools** | Drive a real Chrome — DOM, console, network, performance, screenshots | `npx chrome-devtools-mcp` (no key) |
| **Playwright** | Drive a browser (Chromium/Firefox/WebKit) for e2e checks | `npx @playwright/mcp` (no key) |
| **Context7** | Up-to-date, version-specific library docs pulled into context | remote HTTP (optional key) |
| **GitHub** | Repos, issues, PRs, code search, Actions | remote HTTP (OAuth) |
| **Filesystem** | Structured file read/search/edit scoped to the project | `npx …/server-filesystem` (no key) |
| **Git** | Local Git ops (status, diff, log, blame, commit) | `uvx mcp-server-git` (needs uv) |
| **Fetch** | Fetch a URL → clean Markdown | `uvx mcp-server-fetch` (needs uv) |
| **Sequential Thinking** | Structured, revisable step-by-step reasoning | `npx …/server-sequential-thinking` (no key) |
| **Memory** | Persistent knowledge-graph memory | `npx …/server-memory` (no key) |

Each selection is written to **every selected tool's own MCP config**, merged in
so servers you already have are never overwritten:

- **Claude Code** → `.mcp.json` (`mcpServers`)
- **OpenCode** → the `mcp` block of `opencode.json`
- **Codex** → `.codex/config.toml` (`[mcp_servers.*]`)
- **Cline** → not written (Cline's MCP settings live in IDE storage, not a
  project file) — add these from Cline's MCP panel.

A short section per server is also appended to your instructions file. Servers
that need a key or runtime (Context7, GitHub, Git, Fetch) say so in that section;
the configs are written so the zero-config ones run as-is.

## The core set

Installed on **every** project regardless of selections (and hidden from the
pickers):

- Skills — `engineering-standards`, `knowledge-base`, `using-create-ai-native-project`
- Agents — `code-reviewer`, `security-reviewer`

These are the always-on quality and security guardrails.

## Skills & agents (batch 1)

Beyond the core set, you can opt into a batch of reusable skills and specialist
subagents:

- **Skills** — `test-generation`, `debugging`, `pr-description`, `refactoring`,
  `performance-profiling`, `dependency-upgrade`
- **Agents** — `test-engineer`, `api-designer`, `database-optimizer`,
  `performance-engineer`, `devops-engineer`, `docs-writer`, `accessibility-auditor`

Each stack also **auto-installs its own specialist agent** (e.g. a `react` or
`django` agent) when you select it.
