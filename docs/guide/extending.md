# Extending a Project

There's no separate `add` command — **you extend a project by re-running the
CLI** inside it. The CLI reads [`.ai-native-project.json`](/reference/manifest),
skips what's already set up, and merges your new selections.

## The golden rule: nothing is clobbered

- **Setup files** (boilerplate, Dockerfiles, config) are written only if they
  don't already exist — your edits are safe.
- **Composed files** are updated in place:
  - **`CLAUDE.md` / `AGENTS.md`** — new sections are appended idempotently
    (skipped if the section header is already present).
  - **`package.json`** — stack fragments are deep-merged, **existing wins**.
  - **`docker-compose.yml`** — new services are appended, with host ports chosen
    to avoid collisions with what's already declared.
  - **CI** — a job is appended per newly selected stack/app.

## Common re-runs

### Add a stack (single project)

Run the CLI again and pick the new stack. Its deps merge into `package.json`,
its section/service/CI-job are appended, and its specialist agent is installed
for your tools.

### Add an app (monorepo)

Re-run and define another `group/name/stack`. Duplicate app names are rejected.
The new app gets its dir, `package.json`, a compose service (with a free port),
a CI job, and an instructions section.

### Add a coding tool

Select a tool you didn't have before (e.g. add Codex to a Claude-only project).
The CLI backfills that tool's layout for everything already installed — the
instructions file, `opencode.json`, standalone and stack-bundled agents, and
skills — without touching existing files. See
[Agentic Coding Tools](/guide/coding-tools#adding-a-tool-later).

## For the assistant

The injected `using-create-ai-native-project` skill teaches your coding agent
how to extend the project correctly (re-run to add apps/stacks/tools) so it
doesn't hand-roll structure that breaks these conventions.
