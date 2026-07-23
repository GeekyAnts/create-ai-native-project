# CLAUDE.md — GeekyAnts Knowledge Base

> **OKF (Open Knowledge Format) v0.1.** This is the lean, always-loaded summary;
> full detail lives in the [`knowledge/`](knowledge/) bundle (markdown concept
> files with YAML frontmatter). Keep the two — and README.md's Changelog — in sync.

## ⭐ Important Tasks

> **[LIVING DOCUMENT]** Keep this file concise and current as the project evolves —
> push detail into [`knowledge/`](knowledge/) rather than growing this file.

| Task                                              | Priority | Status  |
| ------------------------------------------------- | -------- | ------- |
| Keep CLAUDE.md + the `knowledge/` bundle current  | High ⭐  | Ongoing |
| Update README.md Changelog on each release        | High ⭐  | Ongoing |

---

## 1. GeekyAnts

IT consulting & software engineering, founded 2006 · US · India · UK ·
[geekyants.com](https://geekyants.com). Full company facts — leadership, offices,
services, tech stack, products — in
[`knowledge/organization/`](knowledge/organization/index.md) and
[`knowledge/services/`](knowledge/services/index.md).

- **Maintainer:** pratik@geekyants.work
- **License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · compiled from official GeekyAnts sources

---

## 2. Project — create-ai-native-project

Interactive CLI that makes a project **AI-native**: it scaffolds an instructions
file (`CLAUDE.md`/`AGENTS.md`), skills, agents, runnable stack boilerplate,
docker-compose, CI, and a `knowledge/` OKF bundle — for **Claude Code, Codex,
OpenCode, and Cline** — all composed from a central template registry. Published
to npm; run via `npm create ai-native-project`.

| Field          | Value                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------- |
| CLI repo       | [`GeekyAnts/create-ai-native-project`](https://github.com/GeekyAnts/create-ai-native-project)  |
| Registry repo  | [`GeekyAnts/agentic-coding-registry`](https://github.com/GeekyAnts/agentic-coding-registry)    |
| npm package    | `create-ai-native-project` (alias `create-ai-native-starter`)                                  |
| Default branch | `main`                                                                                         |

**Dev:** `npm run dev` · `npm run typecheck` · `npm test` · `npm run build`

**Details** — in the [`knowledge/project/`](knowledge/project/index.md) bundle:
[Overview](knowledge/project/overview.md) ·
[Decisions](knowledge/project/decisions.md) ·
[Registry](knowledge/project/registry.md) ·
[Layout](knowledge/project/layout.md) ·
[Change log](knowledge/project/log.md)

### Conventions
- **Branch first** for any change — never commit to `main`; merge via PR.
- On each release: **bump the version** (semver) and **add a README Changelog entry**.
- Keep changes atomic; keep this file and the `knowledge/` bundle in sync.

---

## 3. Recent

- **2026-07-23 · v1.4.2** — Base `CLAUDE.md`/`AGENTS.md` templates gained a
  **Knowledge Base (OKF)** section across all three shapes (default/single/monorepo):
  how to maintain the `knowledge/` bundle + read it before searching
  ([registry PR #34](https://github.com/GeekyAnts/agentic-coding-registry/pull/34)).
- **2026-07-16 · v1.4.1** — Windows install fix (`execFile` + `.cmd` shims);
  dep refresh (clack 1.x, commander 15, TS 7); Cline in package description.
  Registry: all pinned versions bumped to latest stable
  ([registry PR #33](https://github.com/GeekyAnts/agentic-coding-registry/pull/33)).
- **2026-07-16 · v1.4.0** — OKF `knowledge/` bundle now scaffolded into every
  project (`lib/knowledge.ts`); OKF label corrected (Foundation → Format).
- **2026-07-15** — npm alias `create-ai-native-starter`.
- **2026-07-14** — MCP servers, security standards, project name/brief, terminal
  demos, and the v1 registry expansion (AI-native stacks, vector-db, ORM, IaC, Cline).

Full dated history: [`knowledge/project/log.md`](knowledge/project/log.md) and `git log`.
