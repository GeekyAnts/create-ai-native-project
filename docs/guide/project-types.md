# Project Types

The project type is chosen once and **fixed** for the life of the project (it's
recorded in the [manifest](/reference/manifest) and reused on re-runs).

## Single

One application or package in the repo. The CLI:

- composes the instructions file from the `single` base + a section per selection,
- writes a runnable root `package.json` (base + stack fragments, merged first-wins),
- drops each stack's boilerplate, Dockerfile, and CI job fragments at the root,
- optionally composes `docker-compose.yml` and a CI pipeline from your choices.

Best for a standalone app, service, or library.

## Monorepo

Multiple apps/packages in one repo, using **Turborepo + pnpm workspaces**. Apps
are grouped under `apps/`:

```
apps/
  frontend/website/      # one stack per app
  backend/admin-api/
  mobile/app/
packages/                # shared code (tsconfig, ui, …)
turbo.json
pnpm-workspace.yaml
```

The monorepo flow prompts for apps as **group / name / stack** triples and
scaffolds each under `apps/<group>/<name>/`:

- Each app gets its own `package.json` (name = the app) and its stack code.
- **Agents and skills are workspace-wide** — routed to the repo-root
  `.claude/` / `.opencode/` / `.codex/` (per your [tools](/guide/coding-tools)).
- The instructions file gets a section per app plus the workspace selections.
- **Docker**: one build-based service per app (`build: ./apps/<group>/<name>`)
  with collision-free host ports, plus shared database/storage services.
- **CI**: one job per app, scoped to that app's directory.

Add more apps at any time by [re-running the CLI](/guide/extending) — it reads
the manifest and appends the new app's service, CI job, and instructions section.
