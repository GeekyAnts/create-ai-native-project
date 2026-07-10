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
| Last Updated    | 2026-07-10                                                   |
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
| Repository     | `geekyants/create-ai-native-project` (moved here from `antfabric/internal-tools/base-claude-setup`) |
| npm package    | `create-ai-native-project`                            |
| Registry repo  | `geekyants/claude-registry` (templates)               |
| Host           | git.geekyants.com                                     |
| Default Branch | main                                                  |

### 9.1 Overview
A **CLI tool** (`create-ai-native-project`) that helps users make a project
"AI-native" using Claude Code building blocks:
- **CLAUDE.md** — generates a project knowledge base / instructions file.
- **Skills** — copies reusable Claude Code skills into `.claude/skills/`.
- **Agents** — copies custom subagents into `.claude/agents/`.

**Distribution & usage:**
- Installed via npm; invocable as `npm create ai-native-project` / `create-ai-native-project`.
- **Bare run** → interactive TUI. If the current directory is an existing
  project, it **adds** the setup there (never overwriting existing files);
  otherwise it **asks for a folder name** and scaffolds a new project.
- **`--boot <project-name>`** → creates that folder and scaffolds the selected
  skills/agents/CLAUDE.md into it.
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

### 9.3 Registry (template source)
The CLI reads skills, agents, and the CLAUDE.md template from a **git repo**,
shallow-cloned/updated into a local cache (`~/.cache/create-ai-native-project/registry`).

- **Config (`.env`, switchable):**
  - `CLAUDE_SETUP_REGISTRY` — repo URL (default `git@git.geekyants.com:geekyants/claude-registry.git`)
  - `CLAUDE_SETUP_REGISTRY_REF` — branch/ref (default `main`)
  - `.env` is gitignored; `.env.example` is committed as the reference.
- **Repo layout** (each `<id>/` may include `template.json` = `{ name, description }`, which is *not* copied):
  ```
  skills/<id>/     → copied to .claude/skills/<id>/
  agents/<id>/     → copied to .claude/agents/
  claude/<id>/     → copied to project root (e.g. claude/default/CLAUDE.md)
  ```
- **Status:** ✅ seeded (branch `main`) with `claude/default` (OKF CLAUDE.md),
  `skills/knowledge-base`, and `agents/code-reviewer`. Verified end-to-end:
  clone → list → fetch → files land at the correct target paths.

### 9.3.1 Open Questions
- Distribution: publish flow to npm (unscoped `create-ai-native-project`).
- Whether `--boot` (and existing-project mode) should also seed a runnable
  project scaffold (package.json etc.) or only the `.claude/` + CLAUDE.md assets.

### 9.4 Layout
```
src/
  index.ts            # commander entry — default (create) + `update`; loads .env
  commands/
    create.ts         # interactive flow: new-folder / existing / --boot
    update.ts         # refresh the registry cache
  lib/
    templates.ts      # git registry: clone/pull + list/fetch templates
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
