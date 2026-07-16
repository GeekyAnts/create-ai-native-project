---
type: Reference
title: Source Layout
description: The source tree and dev commands for create-ai-native-project.
tags: [project, layout, source]
timestamp: 2026-07-14
---

# Source Layout

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
    mcp.ts            # compose per-tool MCP config from a tool-neutral spec (.mcp.json / opencode.json mcp / .codex/config.toml), merge-not-clobber
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

## Related

- [Overview](./overview.md)
- [Registry](./registry.md)
- [Change Log](./log.md)
