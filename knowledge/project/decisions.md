---
type: Decision Log
title: Architectural Decisions
description: Dated architectural decisions for create-ai-native-project and their rationale.
tags: [project, decisions, architecture]
timestamp: 2026-07-11
---

# Architectural Decisions

| Date       | Decision                                             | Rationale                                          |
| ---------- | ---------------------------------------------------- | -------------------------------------------------- |
| 2026-07-10 | **Language:** Node.js + TypeScript (ESM)             | Fits the Claude Code ecosystem; npm/npx distribution |
| 2026-07-10 | **UX:** Interactive prompts (guided wizard)          | Friendliest setup experience                       |
| 2026-07-10 | **Templates:** Fetched remotely from a **git repo**  | Always up to date from a central source            |
| 2026-07-10 | **Registry:** `git@git.geekyants.com:geekyants/claude-registry.git` (ref `main`), configured in `.env` (switchable) | Central, versioned source; no code change to switch |
| 2026-07-10 | **CLI libs:** `commander` (routing) + `@clack/prompts` (UX) + `picocolors` | Lightweight, modern, ergonomic |
| 2026-07-10 | **Build:** `tsup` (ESM bin), `tsx` for dev           | Simple, fast bundling with shebang banner          |
| 2026-07-10 | **Package:** `create-ai-native-project` (unscoped), bin same | Supports `npm create ai-native-project`   |
| 2026-07-10 | **Commands:** default interactive flow + `--boot <name>`; `update` subcommand | Matches new/existing/boot UX + cache refresh |
| 2026-07-10 | **Existing project:** never overwrite user files (skip on conflict) | Safe to run in a populated repo           |
| 2026-07-10 | **Registry cache:** clone-on-first-use, no auto-pull; `update` forces refresh | Fast & offline-friendly                   |
| 2026-07-10 | **Project types & stacks** come from the registry (`project-types/`, `stacks/`) | Extensible without shipping a new CLI      |
| 2026-07-10 | **CLAUDE.md is composed:** project-type `CLAUDE.md` (base) + each stack's `CLAUDE.section.md` (appended) | One coherent file tailored to the choices  |
| 2026-07-10 | **Compose files** are kind-aware: `template.json` always withheld; for project-type/stack also `CLAUDE.md`, `CLAUDE.section.md`, `package.json` | Clean separation of "compose" vs "setup" files; docs sub-projects keep their own package.json |
| 2026-07-10 | **Runnable scaffolding:** compose `package.json` = project-type base + each stack's fragment, merged **first-wins** (per key/dep/script) | Deps + scripts tailored to the choices; safe multi-stack merge |
| 2026-07-10 | **Optional install:** after writing, offer `pnpm`/`npm install` (default No, only if package.json was written) | Makes the project runnable in one step, without forcing network |
| 2026-07-10 | **Docs option:** confirm → registry `docs/` kind (e.g. Docusaurus) copied into project `docs/` as a self-contained sub-project | Docs live in their own folder; their package.json is copied, not merged |
| 2026-07-10 | **New kinds:** `database`, `storage`, `docker` (registry-driven, like stacks) | Extensible categories without a CLI release |
| 2026-07-10 | **Docker option:** confirm → compose `docker-compose.yml` (text-based, like CLAUDE.md) from a `docker/compose` base + each selection's `compose.service.yml` | Avoids a YAML dependency; services follow the choices |
| 2026-07-10 | **Sections generalized:** CLAUDE.md sections come from any ref (stack/database/storage/auth), not just stacks | One composer for all section sources |
| 2026-07-10 | **New kinds:** `auth` (section ref) + `ci` (copy kind) | Auth setup + CI pipelines, registry-driven |
| 2026-07-10 | **Per-stack Dockerfiles:** each app stack ships a `Dockerfile`; compose services use `build: .` | Real images instead of inline install; single-app assumption at root |
| 2026-07-10 | **Runnable boilerplate:** NestJS/FastAPI/Streamlit complete; Laravel/Flutter are starters (full skeleton via their official CLIs) | Honest about hand-written vs generated scaffolding |
| 2026-07-10 | **`.ai-native-project.json` manifest** written into every project (state: type/stacks/…/agents); `project type` immutable; existing runs merge (union) | Tool + Claude stay aware of state; avoid inapplicable/duplicate actions |
| 2026-07-10 | **Per-stack agents auto-install:** each stack bundles `.claude/agents/<stack>.md`, copied with the stack | Selecting a stack installs its specialist agent, no extra prompt |
| 2026-07-10 | **Core set (`core.json`):** `engineering-standards` skill + `code-reviewer` + `security-reviewer` agents install on every project (hidden from pickers); registry-editable | Foundational quality/security guardrails always present, no CLI release to change |
| 2026-07-10 | **Per-stack CI:** CI providers declare `compose: {base, fragment}`; the pipeline is base skeleton + each selected stack's `ci.<provider>.yml` job (new `lib/ci.ts`) | CI reflects the actual stacks, not a generic pipeline |
| 2026-07-10 | **Monorepo layout:** grouped under `apps/<group>/<app>` + `packages/*`, Turborepo + pnpm (industry standard) | Keeps frontend/backend/mobile grouping while matching tooling conventions |
| 2026-07-10 | **Monorepo apps:** prompt for apps (group/name/stack) at create; re-running the generator adds more (no separate command). Stack code → app dir; agents/skills → root `.claude/`; per-app `package.json` | One stack per deployable app; shared code in `packages/*` |
| 2026-07-10 | **Injected core skill** `using-create-ai-native-project` documents how to extend the project (re-run to add apps/stacks) | Claude knows how to add things without breaking structure |
| 2026-07-10 | **Add-later runs append/merge composed files** (new `lib/augment.ts`): CLAUDE.md sections, compose services (port-aware), CI jobs appended idempotently (skip if header line present); package.json deep-merged existing-wins | Re-runs actually extend the project without clobbering user edits |
| 2026-07-10 | **Pickers filter installed options** from the manifest (stacks kept for monorepos); duplicate app names blocked | No redundant choices; no accidental app collisions |
| 2026-07-10 | **Quality baseline:** vitest unit tests (28), `.gitlab-ci.yml` (typecheck+build+test), README, MIT LICENSE, publish metadata + `prepublishOnly`; version single-sourced from package.json (`lib/version.ts`), bumped to 0.2.0; engines `>=20.12` (`process.loadEnvFile`) | Dogfood our own engineering standards |
| 2026-07-11 | **Multi-tool support:** new multiselect "which agentic coding tool(s)" (Claude Code / Codex / OpenCode); one Claude-shaped registry source is **retargeted/translated** at generation time (`lib/tools.ts`) rather than duplicated in the registry | Single source of truth; add a tool = one CLI module, no registry fork |
| 2026-07-11 | **Instructions file per tool:** `CLAUDE.md` (Claude Code) + `AGENTS.md` (Codex/OpenCode), identical content, both appended-to on re-runs | AGENTS.md is the cross-tool standard; adding a tool later creates its file from the merged state |
| 2026-07-11 | **Agent translation is lossy-but-safe:** OpenCode/Codex agents drop `model` (inherit workspace default, avoids stale ids) and don't carry fine-grained tool allowlists — only read-only intent is preserved (`permission.edit: deny` when the Claude agent lists no write tool) | Faithful, valid, future-proof output over brittle 1:1 mapping |
| 2026-07-11 | **Skills need no translation:** `SKILL.md` is identical across tools — pure file placement (`.claude/skills` shared by Claude Code + OpenCode; `.agents/skills` for Codex) | OpenCode reads `.claude/skills` natively; avoid redundant copies |
| 2026-07-11 | **Docs site:** VitePress under `docs/` (dev-dep only, not published), deployed to **GitHub Pages** via `.github/workflows/deploy-docs.yml` at `geekyants.github.io/create-ai-native-project/` | Lightweight, TS-native, markdown docs; Actions-based Pages deploy on push to `main` |

## Related

- [Overview](./overview.md)
- [Registry](./registry.md)
- [Change Log](./log.md) — narrative history behind these decisions
