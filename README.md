# create-ai-native-project

Interactive CLI that makes a project **AI-native**: it scaffolds an instructions
file (`CLAUDE.md` / `AGENTS.md`), reusable **skills** and **agents**, runnable
**stack boilerplate**, **docker-compose**, and **CI** for **Claude Code, OpenAI
Codex, and OpenCode** — all composed from a central template registry.

[![create-ai-native-project scaffolding a NestJS + Postgres project](https://raw.githubusercontent.com/GeekyAnts/create-ai-native-project/main/demo/wizard.gif)](https://geekyants.github.io/create-ai-native-project/guide/demos)

📖 **[Documentation →](https://geekyants.github.io/create-ai-native-project/)** · ▶ **[More demos →](https://geekyants.github.io/create-ai-native-project/guide/demos)**

## Usage

```bash
# new or existing project — interactive wizard
npm create ai-native-project

# create a folder and scaffold into it
npx create-ai-native-project --boot my-app

# refresh the local template registry cache
npx create-ai-native-project update
```

> Also published as the alias **[`create-ai-native-starter`](./create-ai-native-starter)**
> — `npm create ai-native-starter` runs the exact same wizard.

- **Bare run** — detects whether you're in an existing project. New folder →
  asks for a name and scaffolds; existing project → *adds* to it, never
  overwriting your files (new selections are **appended/merged** into
  CLAUDE.md, package.json, docker-compose.yml, and CI).
- **`--boot <name>`** — creates that folder and scaffolds into it.

## What it asks

1. **Agentic coding tool(s)** — Claude Code, OpenAI Codex, OpenCode, and/or Cline.
   One source is retargeted per tool: `CLAUDE.md`/`AGENTS.md`, `.claude`/`.opencode`/
   `.codex` agents, and shared skills. See
   [Agentic Coding Tools](https://geekyants.github.io/create-ai-native-project/guide/coding-tools).
2. **Project type** — `single` or `monorepo` (fixed once set).
3. **Tech stack(s)** — React, Next.js, React Native, Flutter, NestJS, Laravel,
   Python FastAPI, Python Streamlit — each ships runnable boilerplate, a
   Dockerfile, CI job fragments, and a specialist agent.
4. **Databases** (Postgres/MySQL/MongoDB), **storage** (MinIO/AWS S3),
   **auth** (JWT/Clerk) — each contributes instructions sections and compose services.
5. **MCP servers** — a curated developer set (Chrome DevTools, Playwright,
   Context7, GitHub, Filesystem, Git, Fetch, Sequential Thinking, Memory) written
   to each tool's own config (`.mcp.json`, `opencode.json`, `.codex/config.toml`),
   merged so servers you already have are never overwritten.
6. **Skills / agents**, an optional **docs site** (Docusaurus), **CI**
   (GitHub Actions / GitLab CI — one job per stack/app), and **Docker**
   (docker-compose composed from your selections).

Every project also gets the **core set** automatically: the
`engineering-standards`, `knowledge-base`, and `using-create-ai-native-project`
skills plus the `code-reviewer` and `security-reviewer` agents.

## Monorepo layout

Apps are grouped under `apps/` (Turborepo + pnpm workspaces):

```
apps/
  frontend/website/      # one stack per app
  backend/admin-api/
  mobile/app/
packages/                # shared code (tsconfig, ui, …)
turbo.json
pnpm-workspace.yaml
```

Docker services (`build: ./apps/<group>/<name>`, collision-free ports) and CI
jobs (scoped to each app dir) are generated per app. **Add more apps later by
re-running the CLI** — it reads the project state and appends the new app's
service, CI job, and CLAUDE.md section.

## Project state

Every scaffolded project carries `.ai-native-project.json` recording its type,
stacks, apps, databases, storage, auth, CI, docker, docs, skills, and agents.
Re-runs read it to skip what's installed, keep the project type fixed, and
merge new selections. Claude reads it too (via the injected skill) before
extending the project.

## Configuration

Templates come from a git registry, cloned to
`~/.cache/create-ai-native-project/registry` on first use (`update` refreshes it).

| Env var | Default | Purpose |
| --- | --- | --- |
| `CLAUDE_SETUP_REGISTRY` | `https://github.com/GeekyAnts/agentic-coding-registry.git` | Registry repo URL |
| `CLAUDE_SETUP_REGISTRY_REF` | `main` | Branch/ref to use |

Set them in a `.env` in your working directory (see `.env.example`).

## Development

```bash
npm install
npm run dev        # run the CLI from source (tsx)
npm run typecheck
npm test           # vitest
npm run build      # tsup → dist/
```

Requires Node **≥ 20.12**. See `CLAUDE.md` for the full project knowledge base
and the template registry's README for how to contribute templates.

## Changelog

Notable releases — newest first. Full history and release notes on
[GitHub Releases](https://github.com/GeekyAnts/create-ai-native-project/releases).

- **1.4.0** — OKF (Open Knowledge Format) `knowledge/` bundle scaffolded into every project.
- **1.3.0** — MCP-servers kind: preconfigure Model Context Protocol servers per tool.
- **1.2.1** — Terminal demos (VHS) + published docs site.
- **1.2.0** — Project name + brief prompts, injected into the generated instructions file.
- **1.1.0** — Security-standards kind (7 priority groups) + security skill/agents.
- **1.0.0** — v1 registry expansion: AI-native stacks, vector-db, ORM, IaC, the Cline target, and more frameworks.

## Built by GeekyAnts

`create-ai-native-project` is built and maintained by **[GeekyAnts](https://geekyants.com)**,
a product engineering studio trusted by leading enterprises.

Shipping an AI-native product and need a team that moves fast? We do
**[AI-powered product engineering](https://geekyants.com/ai-powered-product-engineering)** —
[hire dedicated engineers or talk to us about consulting →](https://geekyants.com/ai-powered-product-engineering)

## License

[MIT](./LICENSE) © GeekyAnts Inc
