# Configuration

## Template registry

The CLI reads all templates — project types, stacks, databases, storage, auth,
CI, docs, skills, agents, and the instruction bases — from a **git registry**.
It's shallow-cloned to `~/.cache/create-ai-native-project/registry` on first use
and cached from then on.

- Run [`update`](/guide/usage#update) to refresh the cache (fetch + hard-reset to
  the configured ref). `update` also realigns the cache's `origin` with the
  configured URL, so switching registries takes effect immediately.

The default registry is
[`GeekyAnts/agentic-coding-registry`](https://github.com/GeekyAnts/agentic-coding-registry)
(public — cloned anonymously over HTTPS, no credentials needed).

## Environment variables

Point the CLI at a different registry (no code change) via a `.env` in your
working directory:

| Env var | Default | Purpose |
| --- | --- | --- |
| `CLAUDE_SETUP_REGISTRY` | `https://github.com/GeekyAnts/agentic-coding-registry.git` | Registry repo URL |
| `CLAUDE_SETUP_REGISTRY_REF` | `main` | Branch / ref to use |

```bash
# .env
CLAUDE_SETUP_REGISTRY=https://github.com/your-org/your-registry.git
CLAUDE_SETUP_REGISTRY_REF=main
```

::: info
`.env` is loaded at startup via Node's native `process.loadEnvFile` — hence the
**Node ≥ 20.12** requirement.
:::

## Registry layout

Each kind lives in a top-level directory; every template folder may include a
`template.json` (`{ name, description }`) that isn't copied into projects:

```
project-types/<id>/   base instructions (CLAUDE.md) + package.json base
stacks/<id>/          boilerplate + Dockerfile + CLAUDE.section.md + fragments + bundled agent
databases/<id>/       CLAUDE.section.md + compose.service.yml
storage/<id>/         CLAUDE.section.md + compose.service.yml
auth/<id>/            CLAUDE.section.md + setup files
ci/<id>/              base skeleton + per-stack job fragments
docker/<id>/          docker-compose base + verbatim extras
docs/<id>/            copied to the project docs/ (self-contained)
skills/<id>/          copied to the skills dir(s)
agents/<id>/          copied/translated to the agents dir(s)
claude/default/       fallback base instructions
core.json             skills/agents installed on every project
```

Some files are **composed** rather than copied verbatim: `template.json` (all
kinds); `CLAUDE.section.md` + `compose.service.yml`; `CLAUDE.md` + `package.json`
(project-type/stack); `docker-compose.yml`. Everything else is copied as-is.
