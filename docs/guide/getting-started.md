# Getting Started

`create-ai-native-project` is an interactive CLI that makes a project
**AI-native**: it scaffolds an instructions file (`CLAUDE.md` / `AGENTS.md`),
reusable **skills** and **agents**, runnable **stack boilerplate**,
**docker-compose**, and **CI** — all composed from a central
[template registry](/reference/configuration).

> ▶ **See it in action** — watch the wizard scaffold a project in the [Demos](/guide/demos).

## Prerequisites

- **Node.js ≥ 20.12** (the CLI relies on `process.loadEnvFile`).
- **git** on your `PATH` — the registry is a git repo, shallow-cloned into a
  local cache on first use.

## Run it

No install required — use your package manager's create/exec command:

```bash
# new or existing project — interactive wizard
npm create ai-native-project

# or with pnpm / yarn
pnpm create ai-native-project
yarn create ai-native-project

# create a folder and scaffold into it
npx create-ai-native-project --boot my-app
```

On first run the CLI clones the template registry into
`~/.cache/create-ai-native-project/registry`. It's cached from then on — run
[`update`](/guide/usage#update) to refresh it.

## What happens

1. The CLI detects whether you're in an **existing project** or starting fresh.
2. It asks which **agentic coding tool(s)** you use — Claude Code, OpenAI Codex,
   OpenCode, Cline — then walks you through project type, stacks (web, backend,
   mobile/desktop, and AI-native), databases, vector DBs, ORM, storage, auth,
   IaC, skills, agents, docs, CI, and Docker.
3. It generates the files, tailored to your tool(s), and records everything in
   [`.ai-native-project.json`](/reference/manifest) so future runs stay aware of
   what's already set up.

Nothing you already have is overwritten — see [Extending a Project](/guide/extending).

## Next steps

- [Usage & Commands](/guide/usage) — the interactive flow and CLI commands.
- [Agentic Coding Tools](/guide/coding-tools) — what gets generated for each tool.
- [Project Types](/guide/project-types) — single vs. monorepo.
