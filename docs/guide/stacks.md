# Stacks & Add-ons

Everything below comes from the [template registry](/reference/configuration),
so the exact catalog can grow without a CLI release. This is the current set.

## Tech stacks

Each stack contributes an instructions section, a `package.json` fragment, CI
job fragments, a Dockerfile, and a **specialist agent** — retargeted to your
selected [tools](/guide/coding-tools).

| Stack | Notes |
| --- | --- |
| **React** (Vite) | Runnable boilerplate |
| **Next.js** (App Router) | Runnable boilerplate |
| **React Native** | Starter (full skeleton via the official CLI) |
| **Flutter** | Starter (full skeleton via the official CLI) |
| **NestJS** | Runnable boilerplate |
| **Laravel** | Starter (full skeleton via the official CLI) |
| **Python FastAPI** | Runnable boilerplate |
| **Python Streamlit** | Runnable boilerplate |

## Databases

`Postgres` · `MySQL` · `MongoDB` — each adds an instructions section and a
`docker-compose` service.

## Storage

`MinIO` · `AWS S3` — instructions section (+ compose service for MinIO).

## Auth

`JWT` · `Clerk` — instructions section plus verbatim setup files.

## CI

`GitHub Actions` · `GitLab CI` — the pipeline is **composed per stack**: a base
skeleton plus one job per selected stack (or one job per app in a monorepo).

## Docker

Opt in to generate a `docker-compose.yml` composed from a base plus one service
per stack/database/storage selection. Stacks use `build: .` against their
per-stack Dockerfile; in a monorepo, each app gets its own build-based service.

## Docs

Optionally scaffold a self-contained **Docusaurus** site into `docs/` (its own
sub-project — its `package.json` is copied, not merged into your root).

## The core set

Installed on **every** project regardless of selections (and hidden from the
pickers):

- Skills — `engineering-standards`, `knowledge-base`, `using-create-ai-native-project`
- Agents — `code-reviewer`, `security-reviewer`

These are the always-on quality and security guardrails.
