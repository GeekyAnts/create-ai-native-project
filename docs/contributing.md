# Contributing

## Repositories

The project spans two repos:

- **CLI** — [`GeekyAnts/create-ai-native-project`](https://github.com/GeekyAnts/create-ai-native-project)
  (this package).
- **Registry** — [`GeekyAnts/agentic-coding-registry`](https://github.com/GeekyAnts/agentic-coding-registry)
  (all templates: project types, stacks, skills, agents, …).

Most "add a stack / skill / agent" changes are **registry-only** and need no CLI
release.

## Develop the CLI

```bash
git clone https://github.com/GeekyAnts/create-ai-native-project.git
cd create-ai-native-project
npm install

npm run dev        # run the CLI from source (tsx)
npm run typecheck
npm test           # vitest
npm run build      # tsup → dist/
```

Requires **Node ≥ 20.12**.

### Docs

This site is built with [VitePress](https://vitepress.dev):

```bash
npm run docs:dev       # local preview with hot reload
npm run docs:build     # build the static site
npm run docs:preview   # preview the production build
```

It deploys to GitHub Pages automatically on push to `main` (see
`.github/workflows/deploy-docs.yml`).

## Conventions

- **Branch first** for any change — never commit directly to `main`.
- Keep changes focused and atomic; write clear commit messages.
- **Validate before done** — run typecheck, tests, and build.
- Merge via PR.
- Bump the version (semver) when you ship a change.

## Add a template (registry)

Add a folder under the matching kind (`stacks/`, `skills/`, `agents/`, …) with an
optional `template.json` (`{ name, description }`). See the
[registry layout](/reference/configuration#registry-layout) and the registry's
own README for the file conventions per kind.
