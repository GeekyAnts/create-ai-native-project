# create-ai-native-project

Interactive CLI that makes a project **AI-native**: it scaffolds a
[CLAUDE.md](https://docs.claude.com/en/docs/claude-code/memory) knowledge base,
Claude Code **skills** and **agents**, runnable **stack boilerplate**,
**docker-compose**, and **CI** — all composed from a central template registry.

## Usage

```bash
# new or existing project — interactive wizard
npm create ai-native-project

# create a folder and scaffold into it
npx create-ai-native-project --boot my-app

# refresh the local template registry cache
npx create-ai-native-project update
```

- **Bare run** — detects whether you're in an existing project. New folder →
  asks for a name and scaffolds; existing project → *adds* to it, never
  overwriting your files (new selections are **appended/merged** into
  CLAUDE.md, package.json, docker-compose.yml, and CI).
- **`--boot <name>`** — creates that folder and scaffolds into it.

## What it asks

1. **Project type** — `single` or `monorepo` (fixed once set).
2. **Tech stack(s)** — React, Next.js, React Native, Flutter, NestJS, Laravel,
   Python FastAPI, Python Streamlit — each ships runnable boilerplate, a
   Dockerfile, CI job fragments, and a specialist Claude agent.
3. **Databases** (Postgres/MySQL/MongoDB), **storage** (MinIO/AWS S3),
   **auth** (JWT/Clerk) — each contributes CLAUDE.md sections and compose services.
4. **Skills / agents**, an optional **docs site** (Docusaurus), **CI**
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

## License

[MIT](./LICENSE) © GeekyAnts Inc
