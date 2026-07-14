# Usage & Commands

## Commands

### Default (interactive)

```bash
npm create ai-native-project
```

Runs the guided wizard. Behavior depends on the current directory:

- **New project** — if the current directory isn't an AI-native project, the CLI
  asks for a folder name and scaffolds a fresh project into it.
- **Existing project** — if it detects a project (or an
  [`.ai-native-project.json`](/reference/manifest)), it **adds** the setup to the
  current directory. Existing files are never overwritten; composed files
  (`CLAUDE.md`/`AGENTS.md`, `package.json`, `docker-compose.yml`, CI) are
  **appended to / merged** so new selections actually land.

### `--boot <name>`

```bash
npx create-ai-native-project --boot my-app
```

Creates the `my-app` folder and scaffolds into it. If that folder already
contains a project, it's treated as an existing project (adds, never clobbers).

### `update`

```bash
npx create-ai-native-project update
```

Refreshes the local template registry cache (clones it if missing, otherwise
fetches and hard-resets to the configured ref). See
[Configuration](/reference/configuration).

## The interactive flow

```
target (new / existing / --boot)
  → agentic coding tool(s)   (Claude Code / Codex / OpenCode / Cline)
  → project type             (single / monorepo)
  → tech stack(s)
  → database(s) · vector-db · ORM · storage · auth · IaC
  → skills · agents
  → docs folder?  (Docusaurus / Fumadocs / Starlight)
  → CI?           (GitHub Actions / GitLab CI)
  → Docker?       (docker-compose)
  → generate
  → optional dependency install
```

Multi-select steps (stacks, databases, skills, …) let you pick any combination.
On an **existing project**, already-installed options are filtered out of the
pickers, and the fixed **project type** is reused without asking again.

## What gets generated

- An **instructions file** — `CLAUDE.md` and/or `AGENTS.md`, composed from the
  project-type base plus a section per stack/database/vector-db/storage/auth/IaC
  selection.
- **Skills & agents** in each selected tool's layout
  (see [Agentic Coding Tools](/guide/coding-tools)).
- A runnable **`package.json`** (project-type base + stack + ORM fragments, merged).
- Optional **`docker-compose.yml`**, **CI pipeline**, and **docs** site.
- The **core set** on every project: the `engineering-standards`,
  `knowledge-base`, and `using-create-ai-native-project` skills, plus the
  `code-reviewer` and `security-reviewer` agents.
- **`.ai-native-project.json`** — the [project manifest](/reference/manifest).

After writing, the CLI offers to install dependencies (only if it wrote a
`package.json`).
