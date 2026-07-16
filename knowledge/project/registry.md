---
type: Reference
title: Template Registry
description: The git-based template registry the CLI reads skills, agents, and CLAUDE.md templates from.
resource: https://github.com/GeekyAnts/agentic-coding-registry
tags: [project, registry, templates]
timestamp: 2026-07-14
---

# Template Registry (template source)

The CLI reads skills, agents, and the CLAUDE.md template from a **git repo**,
shallow-cloned/updated into a local cache (`~/.cache/create-ai-native-project/registry`).

- **Config (`.env`, switchable):**
  - `CLAUDE_SETUP_REGISTRY` — repo URL (default `https://github.com/GeekyAnts/agentic-coding-registry.git`)
  - `CLAUDE_SETUP_REGISTRY_REF` — branch/ref (default `main`)
  - `.env` is gitignored; `.env.example` is committed as the reference.
- **Repo layout** (each `<id>/` may include `template.json` = `{ name, description }`, not copied):
  ```
  project-types/<id>/  → setup files → project root; CLAUDE.md = base; package.json = base
  stacks/<id>/         → setup files → project root; CLAUDE.section.md + compose.service.yml + package.json
  databases/<id>/      → CLAUDE.section.md + compose.service.yml (postgres/mysql/mongodb)
  storage/<id>/        → CLAUDE.section.md + compose.service.yml (minio/aws-s3)
  auth/<id>/           → CLAUDE.section.md + setup files (jwt/clerk)
  security/<id>/       → CLAUDE.section.md (7 priority groups: essential/infrastructure/…)
  mcp/<id>/            → template.json + mcp.json (tool-neutral spec) + CLAUDE.section.md; the CLI composes per-tool MCP config (.mcp.json / opencode.json mcp / .codex/config.toml)
  docker/<id>/         → docker-compose.yml base (composed) + verbatim extras (.dockerignore)
  ci/<id>/             → base skeleton + per-stack job fragments composed (github-actions → .github/workflows/ci.yml; gitlab-ci → .gitlab-ci.yml)
  docs/<id>/           → copied to project docs/ (self-contained sub-project, e.g. Docusaurus)
  skills/<id>/         → copied to .claude/skills/<id>/
  agents/<id>/         → copied to .claude/agents/
  claude/<id>/         → base CLAUDE.md fallback (e.g. claude/default/CLAUDE.md)
  ```
  **Composed (not copied verbatim):** `template.json` (all kinds);
  `CLAUDE.section.md` + `compose.service.yml` (project-type/stack/database/vector-db/storage/auth/iac/security/mcp);
  `mcp.json` (mcp — read by the config composer, never copied);
  `CLAUDE.md` + `package.json` (project-type/stack; `package.json` also for `orm`);
  `docker-compose.yml` (docker).
  Everything else is copied — so a `docs/` template keeps its own `package.json`,
  and `requirements.txt` / Dockerfiles / CI files drop in as setup files.
- **Kinds:** project-type, stack, database, **vector-db**, **orm**, storage,
  auth, **iac**, **security**, **mcp**, docker, ci, docs, skill, agent, claude.
  (`vector-db`/`orm`/`iac` added in the v1 roadmap — see the 2026-07-14 note in
  the [change log](./log.md); `security` + `mcp` added 2026-07-14 — see the notes there.)
- **Status:** ✅ seeded (branch `main`), grown substantially in the v1 roadmap:
  - project-types: `single`, `monorepo` (monorepo has a `package.json` base)
  - stacks — web: `react`, `nextjs`, `vue`, `svelte`, `sveltekit`, `astro`,
    `nuxt`, `angular`; backend: `node-nest`, `hono`, `laravel`, `python-fastapi`,
    `django`, `spring-boot`, `aspnet`; mobile/desktop: `react-native` (Expo SDK 57),
    `flutter`, `tauri`; data: `python-streamlit`; AI-native: `mcp-server`,
    `mcp-server-py`, `vercel-ai-sdk`, `langgraph`, `pydantic-ai`. Each ships a
    Dockerfile (where applicable), a bundled `.claude/agents/<stack>.md`, and
    per-provider CI job fragments; several are documented starters (Angular,
    Laravel, Flutter, Spring Boot, ASP.NET, Tauri) scaffolded via official CLIs.
  - databases: `postgres`, `mysql`, `mongodb`, `valkey`, `neon`, `supabase`
  - vector-db: `pgvector` (default), `qdrant`, `chroma`
  - orm: `prisma`, `drizzle` · storage: `seaweedfs` (self-host default),
    `cloudflare-r2`, `aws-s3` (MinIO removed — AGPL/license risk)
  - auth: `jwt`, `clerk`, `better-auth`, `authjs` · iac: `opentofu`
  - security (7 priority groups): `essential`, `infrastructure`, `governance`,
    `testing-validation`, `identity-access`, `supply-chain`, `industry-compliance`
  - ci: `github-actions`, `gitlab-ci` · docker: `compose` base
  - docs: `docusaurus`, `fumadocs`, `starlight`
  - skills (core + batch 1): `knowledge-base`, `engineering-standards`,
    `using-create-ai-native-project`, `test-generation`, `debugging`,
    `pr-description`, `refactoring`, `performance-profiling`, `dependency-upgrade`,
    `security-standards`
  - agents (core + batch 1): `code-reviewer`, `security-reviewer`,
    `test-engineer`, `api-designer`, `database-optimizer`, `performance-engineer`,
    `devops-engineer`, `docs-writer`, `accessibility-auditor`, `threat-modeler`,
    `security-auditor` · `claude/default` fallback
  - Verified end-to-end (single + node-nest + postgres + jwt + github-actions +
    docker): composed CLAUDE.md (all sections), full NestJS boilerplate, root
    Dockerfile, `.github/workflows/ci.yml`, and a `docker-compose.yml` using
    `build: .` — all YAML/JSON parsed OK.

## Open Questions / Follow-ups

- Distribution: publish flow to npm (unscoped `create-ai-native-project`).
- Full runnable boilerplate for `node-nest` / `react-native` (currently
  package.json + deps; entry files come from their official CLIs — see stack docs).
- Multi-stack conflicts: `type: module` vs CommonJS, or two stacks shipping the
  same setup file (currently first-wins on new, skip-existing when adding).

## Related

- [Overview](./overview.md)
- [Decisions](./decisions.md)
- [Layout](./layout.md)
- [Change Log](./log.md)
