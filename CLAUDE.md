# CLAUDE.md — GeekyAnts Knowledge Base

> Structured following **OKF (Open Knowledge Foundation)** principles: explicit
> metadata & provenance, an open license, a named maintainer, and knowledge
> organized into clearly categorized, referenceable sections.

---

## ⭐ Important Tasks

> **[LIVING DOCUMENT — HIGH PRIORITY]** This file is the canonical knowledge
> base for the project. Keep it continuously updated as the project evolves.
> Whenever new project details, decisions, or context are discussed, capture
> them here (primarily in [§9 Project](#9-project)) and keep all sections current.

| Task                                   | Priority | Status  |
| -------------------------------------- | -------- | ------- |
| Keep CLAUDE.md updated as we go        | High ⭐  | Ongoing |

---

## 1. Metadata

| Field           | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| Title           | GeekyAnts Knowledge Base                                     |
| Description     | Canonical reference for company facts, services, and stack   |
| Version         | 1.0.0                                                        |
| Status          | Active                                                        |
| Last Updated    | 2026-07-14                                                   |
| Maintainer      | pratik@geekyants.work                                        |
| Provenance      | Compiled from official GeekyAnts public sources              |
| License         | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)    |
| Canonical URL   | https://geekyants.com                                        |

---

## 2. Organization

| Field         | Value                                                  |
| ------------- | ------------------------------------------------------ |
| Legal Name    | GeekyAnts Inc                                          |
| Founded       | 2006                                                   |
| Size          | 200–500 employees (US, India, UK)                      |
| Sector        | IT consulting & software engineering services          |
| Website       | https://geekyants.com                                  |
| Email         | info@geekyants.com                                     |
| ISO           | [Certificate](https://geekyants.com/iso-geekyants.pdf) |
| Clutch Rating | 4.9 / 5 (106 reviews)                                  |

**Notable clients:** WeWork · SKF · Darden · Olive Garden · ICICI Securities · PayPoint

---

## 3. Leadership

| Name                | Role                                 |
| ------------------- | ------------------------------------ |
| Kumar Pratik        | Founder & CEO                        |
| Sanket Sahu         | Co-founder                           |
| Atul Ranjan         | Chief Product Officer                |
| Saurabh Sahu        | Chief Technology Officer             |
| Varun Kumar Sahu    | Chief Digital & Privacy Officer      |
| Megha Kumari        | Chief Experience Officer             |
| Sarwar Imam         | Chief People Officer                 |
| Kunal Kumar         | Chief Revenue Officer                |
| Apoorva Sahu        | Director                             |

---

## 4. Offices

| Region        | Address                                                        | Phone            |
| ------------- | ------------------------------------------------------------- | ---------------- |
| USA (HQ)      | 315 Montgomery St, San Francisco, CA 94104                    | +1-845-534-6825  |
| India         | No. 18, 2nd Cross Rd, BTM Layout, Bangalore 560076            | +91-8043058884   |
| UK            | SPACES Finsbury Park, 17 City North Place, London N4 3FU      | +44-1702-655221  |

---

## 5. Services

### 5.1 Consulting
- [AI Consulting](https://geekyants.com/consulting-services/artificial-intelligence-consulting)
- [Digital Customer Experience](https://geekyants.com/consulting-services/customer-experience)
- [Product Innovation Studio](https://geekyants.com/consulting-services/product-innovation-studio)
- [Enterprise System Modernization](https://geekyants.com/consulting-services/enterprise-system-modernization)

### 5.2 Engineering
AI · Full Stack · Mobile · Web · Backend · DevOps · IoT · QA · Business Analysis

### 5.3 Engagement Models
| Model               | Description                          |
| ------------------- | ------------------------------------ |
| Agile               | Sprint-based delivery                |
| Fixed Cost          | Defined scope, fixed price           |
| Staff Augmentation  | Dedicated embedded developers        |

---

## 6. Technology Stack

| Category      | Technologies                                                        |
| ------------- | ------------------------------------------------------------------- |
| Mobile        | React Native, Flutter, Swift, Kotlin                                |
| Frontend      | React, Vue, Next.js, Svelte, Angular                                |
| Backend       | Node.js, Nest.js, .NET, Laravel, Python, Golang, Spring Boot, GraphQL, Hasura |
| Cloud/DevOps  | AWS, Azure, Kubernetes, Jenkins                                     |
| Data          | PostgreSQL, Firebase                                                |
| AI            | GPT, LangChain, LlamaIndex, Firebase Genkit                         |

---

## 7. Products & Open Source

- [gluestack](https://gluestack.io)
- [NativeBase](https://nativebase.io)
- [Vibecode DB](https://vibecode-db.geekyants.com/)
- [Open Source](https://geekyants.com/open-source)

---

## 8. Resources & References

**Content:** [Blog](https://geekyants.com/blog) · [Case Studies](https://geekyants.com/case-studies) · [Guides](https://geekyants.com/guide) · [Magazine](https://geekyants.com/magazine) · [Videos](https://geekyants.com/video-series)

**Company:** [About](https://geekyants.com/about-us) · [Team](https://geekyants.com/team) · [Careers](https://geekyants.com/hire) · [Testimonials](https://geekyants.com/testimonials) · [Contact](https://geekyants.com/contact-us)

**Social:** [LinkedIn](https://www.linkedin.com/company/geekyants-software-pvt-ltd/) · [GitHub](https://github.com/GeekyAnts) · [X](https://x.com/geekyants) · [YouTube](https://www.youtube.com/geekyants)

---

## 9. Project

> Project-specific knowledge captured as we discuss it. Kept current per the
> [⭐ Important Tasks](#-important-tasks) directive above.

| Field          | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Repository     | `GeekyAnts/create-ai-native-project` on **github.com** (moved 2026-07-11 from `git.geekyants.com/geekyants/create-ai-native-project`; older history: `antfabric/internal-tools/base-claude-setup`) |
| npm package    | `create-ai-native-project`                            |
| Registry repo  | `GeekyAnts/agentic-coding-registry` on **github.com** (templates; moved 2026-07-11 from `git.geekyants.com/geekyants/claude-registry`, renamed) |
| Host           | github.com (both CLI repo and registry)               |
| Default Branch | main                                                  |

### 9.1 Overview
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
security standard(s) → skills → agents → CI? → docs folder? → Docker? → generate
→ optional dependency install.

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

### 9.2 Decisions
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

### 9.3 Registry (template source)
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
  docker/<id>/         → docker-compose.yml base (composed) + verbatim extras (.dockerignore)
  ci/<id>/             → base skeleton + per-stack job fragments composed (github-actions → .github/workflows/ci.yml; gitlab-ci → .gitlab-ci.yml)
  docs/<id>/           → copied to project docs/ (self-contained sub-project, e.g. Docusaurus)
  skills/<id>/         → copied to .claude/skills/<id>/
  agents/<id>/         → copied to .claude/agents/
  claude/<id>/         → base CLAUDE.md fallback (e.g. claude/default/CLAUDE.md)
  ```
  **Composed (not copied verbatim):** `template.json` (all kinds);
  `CLAUDE.section.md` + `compose.service.yml` (project-type/stack/database/vector-db/storage/auth/iac/security);
  `CLAUDE.md` + `package.json` (project-type/stack; `package.json` also for `orm`);
  `docker-compose.yml` (docker).
  Everything else is copied — so a `docs/` template keeps its own `package.json`,
  and `requirements.txt` / Dockerfiles / CI files drop in as setup files.
- **Kinds:** project-type, stack, database, **vector-db**, **orm**, storage,
  auth, **iac**, **security**, docker, ci, docs, skill, agent, claude.
  (`vector-db`/`orm`/`iac` added in the v1 roadmap — see the 2026-07-14 note in
  §9.5; `security` added 2026-07-14 — see the note below.)
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

### 9.3.1 Open Questions / Follow-ups
- Distribution: publish flow to npm (unscoped `create-ai-native-project`).
- Full runnable boilerplate for `node-nest` / `react-native` (currently
  package.json + deps; entry files come from their official CLIs — see stack docs).
- Multi-stack conflicts: `type: module` vs CommonJS, or two stacks shipping the
  same setup file (currently first-wins on new, skip-existing when adding).

### 9.4 Layout
```
src/
  index.ts            # commander entry — default (create) + `update`; loads .env
  commands/
    create.ts         # interactive flow: new-folder / existing / --boot
    update.ts         # refresh the registry cache
  lib/
    templates.ts      # git registry: clone/pull + list/fetch + read; kind-aware compose exclusion
    claudemd.ts       # compose CLAUDE.md (base + section refs: stack/database/vector-db/storage/auth/iac)
    pkgjson.ts        # compose package.json (project-type base + stack + orm fragments, first-wins)
    compose.ts        # compose docker-compose.yml (base + compose.service.yml fragments)
    ci.ts             # compose CI pipeline (provider base + per-stack ci.<provider>.yml)
    monorepo.ts       # scaffold monorepo: apps under apps/<group>/<app>, agents→root, per-app package.json, per-app docker/CI
    augment.ts        # add-later helpers: append blocks idempotently, read-if-exists, used host ports
    names.ts          # slugSegment
    tools.ts          # agentic tool targets: retarget/translate .claude/{agents,skills} → per-tool layouts (claude-code/codex/opencode/cline), instruction filenames, opencode.json
    version.ts        # VERSION read from package.json at runtime
test/                 # vitest unit tests (augment, pkgjson, manifest, files, transforms, names)
.gitlab-ci.yml        # repo CI: npm ci → typecheck → build → test
README.md / LICENSE   # package docs + MIT
    manifest.ts       # read/merge/write .ai-native-project.json (project state)
                      # (templates.ts readCore() reads registry core.json)
    install.ts        # detect pnpm/npm + run install
    files.ts          # write files to disk (skip existing unless overwrite)
    project.ts        # detect existing-vs-new project
tsup.config.ts        # build config (ESM + shebang)
tsconfig.json         # strict TS, Bundler resolution
.env / .env.example   # registry config (URL + ref)
```

**Dev commands:** `npm run dev` (tsx) · `npm run typecheck` · `npm run build` · `npm start`

### 9.5 Notes
- 2026-07-10 — Established CLAUDE.md as the living project knowledge base.
- 2026-07-10 — Project defined: a CLI to scaffold projects with CLAUDE.md, skills, and agents.
- 2026-07-10 — Stack decided: Node.js + TypeScript, interactive prompts, remote templates.
- 2026-07-10 — Scaffolded the CLI: package.json, tsconfig, tsup, `init` + `add` commands, remote-template lib. Typecheck + build pass; `--help`/`--version` verified.
- 2026-07-10 — Switched template source to a git registry (`geekyants/claude-registry`), configured via `.env`/`.env.example`. `templates.ts` now clones/pulls + reads from disk; `.env` loaded at startup via `process.loadEnvFile()`. Verified env loads and empty-repo case is handled gracefully.
- 2026-07-10 — Renamed package to `create-ai-native-project`; reshaped commands to default interactive flow (new / existing / `--boot`) + `update`. Added existing-project detection and no-overwrite file writes. Registry cache is clone-on-first-use with explicit `update`.
- 2026-07-10 — Seeded the `geekyants/claude-registry` registry (`main`): `claude/default`, `skills/knowledge-base`, `agents/code-reviewer`. Verified the CLI end-to-end against the live registry (files land at correct target paths). Typecheck + build pass.
- 2026-07-10 — Moved the CLI to its own repo `geekyants/create-ai-native-project` (`origin`; old `base-claude-setup` kept as `legacy` remote). Renamed registry `claude-setup` → `claude-registry` and updated all references; cache dir → `~/.cache/create-ai-native-project/registry`. Re-verified end-to-end against the renamed registry.
- 2026-07-10 — Added **project-type** + **tech-stack** selection (registry-driven) and **CLAUDE.md composition** (project-type base + stack sections). New `lib/claudemd.ts`; `templates.ts` gained kinds `project-type`/`stack`, `readTemplateFile`, and compose-file exclusion. Seeded registry with `single`/`monorepo` project-types and `react`/`node-nest`/`react-native` stacks. Verified end-to-end (composition + setup-file copy). Typecheck + build pass.
- 2026-07-10 — Added **runnable scaffolding** (composed `package.json`, first-wins merge; new `lib/pkgjson.ts`) + **optional dependency install** (`lib/install.ts`), and a **docs folder option** (new registry `docs/` kind + `docs/docusaurus`; kind-aware compose exclusion so the docs sub-project keeps its own package.json). Seeded registry: package.json fragments for all project-types/stacks, runnable React files, and the Docusaurus template. Verified end-to-end (merged root pkg, unpolluted docs sub-project).
- 2026-07-10 — Added stacks (**flutter, laravel, python-fastapi, python-streamlit**), new kinds **database** (postgres/mysql/mongodb), **storage** (minio/aws-s3), and **docker** (compose). New `lib/compose.ts` composes `docker-compose.yml` from a base + `compose.service.yml` fragments; `composeClaudeMd` generalized to section refs. `create.ts` adds database/storage selection + a Docker prompt. Verified end-to-end (nest+postgres+minio+docker → valid 3-service compose, all CLAUDE.md sections). Committed via branch `feat/runnable-scaffolding-and-docs` → MR → merged to `main`.
- 2026-07-10 — Added **runnable stack boilerplate** (NestJS/FastAPI/Streamlit complete; Laravel/Flutter starters), **per-stack Dockerfiles** (compose now `build: .`), and two new kinds: **auth** (jwt/clerk — section ref + setup) and **ci** (github-actions/gitlab-ci — copy kind). `create.ts` adds auth selection + a CI prompt. Verified end-to-end (nest+postgres+jwt+github-actions+docker: full boilerplate, Dockerfile, CI yaml, build-based compose; all parsed OK). Committed via branch `feat/dockerfiles-ci-auth-boilerplate` → MR → merged to `main`.
- 2026-07-10 — Added **`.ai-native-project.json` manifest** (new `lib/manifest.ts`): written into every project with its state; on existing-project runs the CLI reads it, reuses the immutable project type (skips that prompt), and merges (unions) selections. Added **per-stack agents** bundled in each stack (`.claude/agents/<stack>.md`) that auto-install with the stack; installed agents/skills are derived from written paths and recorded in the manifest. Base CLAUDE.md templates now point to the manifest. Verified end-to-end (agents auto-install; manifest merge preserves createdAt + immutable type + unions arrays). Committed via branch `feat/manifest-and-stack-agents` → MR → merged to `main`.
- 2026-07-10 — Added **default development-workflow conventions** to the base CLAUDE.md templates (single/monorepo/default) in the registry: branch-first for any feature/change (never commit directly to `main`), bump the version (semver) after each commit/push, atomic commits, merge via PR/MR. Registry-only change (`geekyants/claude-registry` @ main); verified the instructions appear in a composed CLAUDE.md.
- 2026-07-10 — Added **engineering standards** (registry-only), layered by cost/frequency: (1) base CLAUDE.md templates gained a non-negotiable standards block (no secrets, validate-before-done, test behavior changes, untrusted input, smallest-change, decision-priority); (2) new **`engineering-standards` skill** = the full 28-section senior-engineer playbook (on-demand); (3) new **`security-reviewer` agent** for diff security review (complements `code-reviewer`). Model: CLAUDE.md = always-on guardrails; skill = auto-triggers on dev tasks; agents = independent review at the pre-PR checkpoint. Verified end-to-end (skill/agent listed + install to correct paths; standing instructions in composed CLAUDE.md).
- 2026-07-10 — Made those a **core set** (new `core.json` + `templates.ts` `readCore()`): `engineering-standards`, `code-reviewer`, `security-reviewer` install on every project regardless of selection and are hidden from the pickers; core is registry-editable. Verified: with zero skill/agent selections all three still install; core ids excluded from picker options. Registry `core.json` pushed to `main`.
- 2026-07-10 — Added **`knowledge-base`** to the core set (registry `core.json` edit; no CLI change). Core is now skills `engineering-standards` + `knowledge-base`, agents `code-reviewer` + `security-reviewer`. Verified all four install with zero selections; since both skills are core the skills picker is empty (auto-skipped).
- 2026-07-10 — Added the **Next.js** stack (Next 15 App Router: boilerplate, Dockerfile, agent, package.json, compose service, CLAUDE section, CI fragments) and reworked CI to be **per-stack composed** (new `lib/ci.ts`; provider `template.json` `compose` config; each stack ships `ci.github.yml` / `ci.gitlab.yml` job fragments). Verified end-to-end (nextjs+python-fastapi+node-nest → valid GitHub + GitLab pipelines with a job per stack; Next.js installs boilerplate + agent). Committed via branch `feat/nextjs-and-per-stack-ci` → MR → merged to `main`.
- 2026-07-10 — **Monorepo apps** (new `lib/monorepo.ts`): monorepo runs a dedicated flow that prompts for apps (group/name/stack) and scaffolds each under `apps/<group>/<name>/` (grouped-under-apps layout, Turborepo + pnpm workspace globs `apps/*/*` + `packages/*`, shared `packages/tsconfig`). Per-app `package.json` (name = app), stack code in the app dir, stack agents + skills routed to the workspace root `.claude/`, and per-app CLAUDE.md sections. Adding apps later = re-run the generator (reads manifest, merges). Manifest gained `apps[]`. Injected a core skill **`using-create-ai-native-project`** (how to extend the project). Verified end-to-end (3 apps across frontend/backend/mobile + workspace Postgres: correct dirs, per-app pkg, agents at root, valid turbo/workspace config). Committed via branch `feat/monorepo-apps` → MR → merged to `main`.
- 2026-07-10 — **Monorepo per-app Docker + CI** (in `lib/monorepo.ts`): `composeMonorepoDockerCompose` emits one build-based service per app (`build: ./apps/<group>/<name>`, collision-free host ports assigned from each stack's declared port) plus shared db/storage services; `composeMonorepoCi` emits one job per app scoped to its dir (GitHub `defaults.run.working-directory`, GitLab `cd <appDir>` first in `script`). Job/service names are `<group>-<name>` (unique). `runMonorepoFlow` adds Docker + CI prompts; manifest records them. Verified end-to-end (nextjs+node-nest+fastapi+flutter → 3000/3001/8000 + 5432/9000/9001 all-unique compose; per-app GitHub & GitLab pipelines; all valid YAML). Committed via branch `feat/monorepo-docker-ci` → MR → merged to `main`.
- 2026-07-10 — **Hardening + real "add later"** (v0.2.0, branch `feat/hardening-and-add-later`): full-project review produced 9 tracked tasks, all done. (1) Add-later runs now actually update composed files — new `lib/augment.ts` appends CLAUDE.md sections / compose services (port-aware vs the existing file) / CI jobs idempotently, and deep-merges `package.json` existing-wins; pickers filter installed options from the manifest; monorepo blocks duplicate app names and appends per-app service+job+section. (2) Bug fixes: engines `>=20.12` (`process.loadEnvFile` silently failed on Node 18–20.11), `--boot` into an existing project no longer overwrites, monorepo docker extras (`.dockerignore`) now copied, version single-sourced from package.json. (3) Quality: 28 vitest unit tests, repo `.gitlab-ci.yml`, README, MIT LICENSE, publish metadata. Registry: fixed `node-nest` test script (jest w/o dep) + `react` build script (`tsc --noEmit`); skill updated to describe append-on-add. Verified end-to-end: fresh single, add-stack-to-single (deps merged, sections/services/jobs appended, idempotent), fresh monorepo, add-app-to-monorepo (port 3002 auto-assigned, per-app job appended) — all YAML/JSON valid; typecheck+build+tests pass.
- 2026-07-11 — **Moved the CLI repo to GitHub** (`https://github.com/GeekyAnts/create-ai-native-project`, public). All feature branches were already merged into `main` (0 ahead) and there were no tags, so pushing `main` moved the full history. Made GitHub the new `origin`; kept the old GitLab remote as `gitlab` (backup). Updated `package.json` (`repository`/`homepage` → GitHub, added `bugs`) and the §9 project table. **Registry repo (`geekyants/claude-registry`) stays on `git.geekyants.com`** — unchanged; `.env.example`, `src/lib/templates.ts` default, and README registry URL still point there intentionally.
- 2026-07-11 — **Moved + renamed the registry to GitHub** (`https://github.com/GeekyAnts/agentic-coding-registry`, public; renamed from `claude-registry`). Supersedes the "registry stays on GitLab" note above. Mirror-cloned from GitLab (only `main`, no tags) and pushed to the new repo. Repointed the CLI's default `REGISTRY_URL` (`src/lib/templates.ts`) from the SSH GitLab URL to the **HTTPS** GitHub URL (public repo → anonymous clone, no SSH key needed); updated `.env`, `.env.example`, and README. Also hardened `pull()` (in `templates.ts`) to `git remote set-url origin <REGISTRY_URL>` before fetch, so `update` realigns any pre-existing cache clone with the new/configured URL instead of silently pulling from the old origin. Version bump handled in the same PR.
- 2026-07-11 — **Multi-tool support: Codex + OpenCode** (branch `feat/multi-tool-support`, v0.3.0). Researched the exact current formats for both tools (OpenCode `opencode.ai/docs`; Codex `learn.chatgpt.com/docs` + `agents.md`). New `lib/tools.ts` retargets/translates the single Claude-shaped registry source per selected tool: instructions → `CLAUDE.md` and/or `AGENTS.md`; skills → `.claude/skills` (Claude Code + OpenCode-native) / `.agents/skills` (Codex), same `SKILL.md`; subagents → `.claude/agents/*.md` / `.opencode/agents/*.md` (frontmatter translated: drop `name`, `mode: subagent`, `permission.edit: deny` for read-only) / `.codex/agents/*.toml` (`name`/`description`/`developer_instructions`); OpenCode also gets `opencode.json`. New multiselect prompt threaded through single + monorepo flows; `copy()` retargets so **stack-bundled** agents convert too; manifest gained `tools` (backward-compat default `["claude-code"]`). 18 new unit tests (46 total). Verified end-to-end against the live registry with all three tools selected: CLAUDE.md===AGENTS.md, core + stack agents present in all three layouts, skills placed correctly (no redundant `.opencode/skills`), OpenCode frontmatter + Codex TOML well-formed, `opencode.json` valid, manifest records all tools. **Follow-ups:** (1) ✅ DONE (see next note) — base instruction wording made tool-neutral in the registry. (2) ✅ DONE (see 0.3.1 note below) — adding a tool later now backfills stack-bundled specialist agents too.
- 2026-07-11 — **Registry: tool-neutral base instructions** (`agentic-coding-registry` PR #1, merged). Since the base templates now compose into `AGENTS.md` (Codex/OpenCode) as well as `CLAUDE.md`, dropped the Claude-specific filename from the shared text in all three base templates (`claude/default`, `project-types/single`, `project-types/monorepo`): title `# CLAUDE.md — <Project>` → `# <Project> Knowledge Base`, task row `Keep CLAUDE.md updated` → `Keep this file updated`. That was the entire Claude-specific surface — everything else (manifest, workflow, standards, `engineering-standards` skill ref) was already neutral; no `CLAUDE.section.md` fragment mentioned Claude. Verified via `update` + fresh compose. Resolves multi-tool follow-up (1).
- 2026-07-11 — **Add-tool-later backfill** (v0.3.1, branch `feat/retarget-added-tools`). Closes multi-tool follow-up (2). New exported `materializeInstalledForTools(targetDir, {stacks, agents, skills}, tools)` in `create.ts`: on an add-run where a **new** tool was selected, it regenerates that tool's agent/skill layouts for pieces already installed — standalone registry agents (`manifest.agents ∩ registry agents/`), **stack-bundled** agents (the `.claude/` portion of each `manifest.stacks` entry, e.g. `.opencode/agents/react.md`), and skills (`manifest.skills` → each tool's skill dir). Passes the **full** effective tool set (so `retargetForTools`/`skillBaseDirs` pick idiomatic dirs) with `overwrite:false`, so only the newly-needed per-tool files are written and existing files are never touched. `selectedTools` is now the union of prior + picked tools (tools are additive; the manifest never drops one); `newTools` gates the backfill. Wired into single + monorepo flows. Verified end-to-end (claude-only React project → add codex+opencode: `.opencode/agents/react.md` + `.codex/agents/react.toml` + `.agents/skills/*` backfilled, `AGENTS.md`/`opencode.json` created, existing `.claude/agents/react.md` untouched, no redundant `.opencode/skills`); typecheck + 46 tests pass.
- 2026-07-11 — **Documentation site** (v0.3.2, branch `feat/docs-site`). Added a **VitePress** docs site under `docs/` (home + Guide: getting-started, usage, coding-tools, project-types, stacks, extending + Reference: configuration, manifest + contributing), deployed to **GitHub Pages** via `.github/workflows/deploy-docs.yml` (build → `upload-pages-artifact` → `deploy-pages`, on push to `main` touching `docs/**`). `base: /create-ai-native-project/`, local search, edit-links. `vitepress` is a **dev-dependency** (not in `files: ["dist"]`, so the npm package is unaffected); scripts `docs:dev`/`docs:build`/`docs:preview`; `.gitignore` excludes `docs/.vitepress/{dist,cache}`. Refreshed README intro + "What it asks" to lead with multi-tool and link the site; updated package.json `description`/`keywords` (codex, opencode, agents.md). Verified `docs:build` (all 11 pages render, no dead links, base path applied) + CLI typecheck unaffected. **Pages must be enabled** (Settings → Pages → Source: GitHub Actions) for the first deploy.
- 2026-07-11 — **npm publish + CI auto-publish** (branch `feat/npm-publish-ci`). Package name `create-ai-native-project` confirmed **available** on npm. `npm pkg fix` normalized `bin` `./dist/index.js` → `dist/index.js` (clears a publish-time warning; functionally identical). Dry-run clean: gate (typecheck + 46 tests + build) passes and the tarball is exactly `LICENSE`, `README.md`, `dist/index.js`, `package.json` (16.4 kB) — no src/tests/docs (`files: ["dist"]`). Added `.github/workflows/publish.yml`: on a **GitHub Release** (`vX.Y.Z`) — or manual dispatch — it runs `npm ci`, verifies the tag matches `package.json` version, then `npm publish --provenance --access public` (`prepublishOnly` re-runs the gate). Needs an **`NPM_TOKEN`** repo secret (npm **automation** token) with `id-token: write` for provenance. **First publish (0.3.2):** set the secret, then cut release `v0.3.2` (CI publishes) — or `npm login && npm publish` locally.
- 2026-07-11 — **Published `create-ai-native-project@0.3.2` to npm** (public, owner `kumarpratik`; 2FA OTP entered interactively). Verified live (`latest = 0.3.2`, `bin` intact, `npx create-ai-native-project@0.3.2 --version/--help` runs). Tagged `v0.3.2` as a **plain git tag** (not a GitHub Release — avoids triggering the release-publish workflow against an already-published version). Then set up **npm Trusted Publishing (OIDC)**: added a gated GitHub Actions **environment `release`** to the `publish` job (name must match the npm Trusted Publisher config exactly — OIDC matches the environment claim). With Trusted Publishing configured, CI can publish tokenlessly (the `NODE_AUTH_TOKEN`/`NPM_TOKEN` env can later be dropped from the publish step). **Known nit:** the CLI `--help` description string in `src/index.ts` still reads "…with CLAUDE.md, skills, and agents" (pre-multi-tool) — the npm/package.json description is current; fold the one-liner into the next release.
- 2026-07-11 — **v0.3.3 + Trusted Publishing test** (branch `ci/test-trusted-publishing`). Fixed the `src/index.ts` `--help` description → multi-tool text (resolves the nit above). Hardened `publish.yml` for **OIDC Trusted Publishing**: added `npm install -g npm@latest` (OIDC needs npm ≥ 11.5.1; Node 20 ships npm 10) and **removed** the `NODE_AUTH_TOKEN`/`NPM_TOKEN` env (auth is now tokenless via OIDC + `id-token: write` + the `release` environment). Bumped 0.3.2 → 0.3.3; cutting GitHub Release `v0.3.3` triggers the workflow to publish tokenlessly with provenance — the real end-to-end test of the Trusted Publisher setup.
- 2026-07-11 — **Trusted Publishing works; `0.3.3` published via OIDC.** Debugging the CI publish surfaced a chain of issues (all fixed in `publish.yml`): (1) `npm@latest` is npm 12 needing Node ≥22.22/24.15 → run on **Node 24** + pin **`npm@11`** (11.18, ≥11.5.1 for OIDC); (2) briefly removed `registry-url` → `ENEEDAUTH` (npm needs the registry context for OIDC) → **restored it** (npm 11.5.1+ prefers OIDC over setup-node's placeholder token). The real blocker was the **npm Trusted Publisher config**: `Organization or user` was `geekyants` (lowercase) but the OIDC claim is case-sensitive `GeekyAnts` → exchange returned `404 "package not found"`. After correcting the org casing on npm, the exchange returned `201` and `0.3.3` published **tokenlessly with SLSA provenance**. Verified live (`latest = 0.3.3`, attestation present, `npx …@0.3.3` runs). Also added a "Built by GeekyAnts" section (README) + docs footer callout linking `geekyants.com/ai-powered-product-engineering` (referral/brand link — npm/GitHub mark README links nofollow). Going forward: bump version → cut GitHub Release `vX.Y.Z` → CI auto-publishes (no token).
- 2026-07-14 — **v1 registry-additions roadmap — COMPLETE.** Ran two 2026 market/GitHub-trend deep-research passes (fan-out search → source fetch → 3-vote adversarial verification) and worked the resulting backlog end-to-end as an autonomous loop: each item on its own feature branch → real SDK build/verify → CLI compose e2e → PR → merge. Every build item is merged across **both** repos. This note supersedes the local `v1-todo.md` planning file (now deleted); the durable outcome + reference lists live here.
  - **New kinds (CLI):** `vector-db` (CLI #17), `orm` (CLI #18), `iac` (CLI #19), plus the `cline` tool target (CLI #20). Each threaded through `templates.ts`/`manifest.ts`/`create.ts` with backward-compat manifest backfill; `pkgjson.ts` merges `orm` deps; `manifest.ts` unions the new arrays.
  - **AI-native stacks (the on-brand gap):** `mcp-server` + `mcp-server-py`, `vercel-ai-sdk` (AI SDK **v5 stable** — v7 was `latest` at build time; user chose v5), `langgraph` (LangChain 1.0 `createAgent`), `pydantic-ai`. vector-db: `pgvector` (default), `qdrant`, `chroma`.
  - **Framework/infra breadth:** web `vue`/`svelte`/`sveltekit`/`astro`/`nuxt`/`angular`; backend `hono`/`django`/`spring-boot`/`aspnet`; desktop `tauri`; `react-native` bumped to **Expo SDK 57**. orm `prisma` (**Prisma 7**: `prisma.config.ts` + `@prisma/adapter-pg` driver adapter — v6 datasource `url` shape is gone) + `drizzle`. auth `better-auth` + `authjs`. databases `valkey`/`neon`/`supabase`. docs `fumadocs`/`starlight`.
  - **License-safety policy (no SSPL/BSL/source-available in the registry):** **MinIO** (AGPL, likely relicense) → removed; **SeaweedFS** (Apache-2.0) is the self-host storage default + **Cloudflare R2** managed. **Redis** (SSPL/RSALv2) → **Valkey** (BSD-3). **Terraform** (BSL) → **OpenTofu only** (MPL-2.0). Weaviate (BSD-3) + Milvus (Apache-2.0) are fine (only Weaviate's *managed* pricing changed).
  - **Baked into base templates (not new kinds):** an **LLM-provider** section (Anthropic/OpenAI SDK starter, default to latest Claude) and a **Deploying** section (Vercel/Cloudflare Workers/Netlify/Railway/Fly/Render) — covers the deploy-target lines without a `deploy` kind.
  - **Skills/subagents batch 1:** skills `test-generation`/`debugging`/`pr-description`/`refactoring`/`performance-profiling`/`dependency-upgrade`; agents `test-engineer`/`api-designer`/`database-optimizer`/`performance-engineer`/`devops-engineer`/`docs-writer`/`accessibility-auditor`.
  - **Cline tool target (CLI #20, CLI-only):** reuses the Claude-shaped source with two retargets — instructions → `AGENTS.md` (native), skills → `.clinerules/workflows/<n>.md` (slash commands). Cline has no per-file subagent format, so subagents aren't emitted for it.
  - **Deferred to a future wave** (conscious scope calls, not incomplete work): tool targets **Aider** (~47k⭐), **Goose** (~51k⭐), **OpenHands** (~65–79k⭐); watch **Pi** (~70k⭐) before targeting. Skills `api-design`/`database-migration`/`commit-message`/`observability-setup`/`cost-monitoring`; per-language specialist subagents.
  - **Do NOT add (declining/archived/risky):** Gemini CLI (Google retired free/consumer access Jun 2026), Roo Code (archived May 2026), Lucia auth (deprecated → Better Auth), TypeORM (fading for greenfield), Fastify/Express as *standout* stacks (not differentiated), Buildkite/Woodpecker/SST (no momentum), Pinecone (managed-only — client SDK + env only if ever added).
  - **Watch (pricing/ops, not license):** Milvus (heavy for compose: etcd+object store+MQ), Weaviate managed pricing (Oct 2025), Fly.io/Railway free-tier removals — note in scaffolded docs.
  - **Open follow-ups (own research pass):** vector-db breadth (LanceDB, risers); per-tool translation cost for the deferred Wave-4 targets; re-confirm `python-streamlit` earns its slot; validate each deploy config-file shape against a real deploy.
  - **Latent, out-of-scope:** `updateRegistry()`/`pull()` keep a single-branch shallow clone of `main`, so the cache can't track a non-main branch; e2e verification against unmerged branches was done by positioning the cache with `git fetch --depth 1 origin <branch>` + `reset --hard FETCH_HEAD`, then restoring to `main`.
- 2026-07-14 — **Project name + brief injection** (v1.2.0, CLI branch `feat/project-name-brief`; **CLI-only**, no registry change). Two prompts at the **start** of the flow (project name, defaulting to the folder basename / manifest value; one-line brief) feed a `ProjectMeta` (`name`/`brief`/`date`) that `composeClaudeMd` + `composeMonorepoClaudeMd` substitute into the base template's existing placeholders via the new **`applyProjectMeta`** helper (`lib/claudemd.ts`): `<Project>` → name (title + Metadata), `<one-line description>` → brief, the Overview italic prompt → brief, `<YYYY-MM-DD>` → today. Non-empty-only (blank leaves the placeholder for later); function-replacer so a `$` in the brief is literal. Substitution runs only when a file is composed fresh (new project / newly-selected tool's file), so add-runs never clobber an edited CLAUDE.md. Manifest gained optional `projectName`/`brief` (merge = new non-empty wins, else keep prev — so a blank re-run preserves them); recorded in single + monorepo writes. `package.json` name still uses the folder basename (slug), not the human name. Tests: new `test/claudemd.test.ts` (applyProjectMeta) + manifest merge test (58 total). No registry change — the base templates already shipped these placeholders.
- 2026-07-14 — **Security-standards kind** (v1.1.0, CLI branch `feat/security-kind` + registry branch `feat/security-standards`). Added a **`security` kind** — a section-contributing fragment kind like `iac`/`auth` — threaded through `templates.ts` (`TemplateKind`/`FRAGMENT_KINDS`/`KIND_DIR`/`TARGET_ROOT`/`listSecurity`), `manifest.ts` (`security: string[]` + backward-compat backfill `[]` + union), and `create.ts` (single + monorepo flows; prompt after IaC; `refs`/`mergedRefs`/`sectionRefs`; `copy("security", …)`; manifest write). Registry ships **7 priority groups** (from a user-supplied table), one selectable option each, whose `CLAUDE.section.md` maps its standards to concrete guidance: `essential` (NIST SSDF, OWASP ASVS/Top 10/API Top 10, CWE Top 25), `infrastructure` (CIS Benchmarks, NIST 800-190, CIS K8s), `governance` (ISO 27001, NIST CSF 2.0, ISO 31000), `testing-validation` (OWASP WSTG, PTES, NIST 800-115), `identity-access` (NIST 800-63/800-207), `supply-chain` (SLSA, CycloneDX, SPDX, Sigstore), `industry-compliance` (GDPR, PCI DSS, HIPAA, FedRAMP, SOC 2, DPDP Act). **Auto-install on selection:** picking ≥1 group unions in the new `security-standards` skill + `threat-modeler` (STRIDE) and `security-auditor` (standards-conformance) agents — mirroring how a stack installs its specialist; they stay independently pickable (`unionStr` dedups) and are NOT in `core.json`. New manifest test (52 total). Security groups ship no verbatim setup files (section-only), so the monorepo flow needs no `monorepo.ts` change (handled via `sectionRefs`, like databases/storage).
