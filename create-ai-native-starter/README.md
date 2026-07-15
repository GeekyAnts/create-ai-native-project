# create-ai-native-starter

An **alias** for [`create-ai-native-project`](https://www.npmjs.com/package/create-ai-native-project).
It runs the exact same interactive wizard — this package just exists so you can
invoke it under a shorter/alternate name:

```bash
npm create ai-native-starter
# or
npx create-ai-native-starter
```

Both are equivalent to `npm create ai-native-project`. See the
**[documentation](https://geekyants.github.io/create-ai-native-project/)** for
everything it can scaffold (Claude Code / Codex / OpenCode / Cline instructions,
skills, agents, stacks, databases, MCP servers, Docker, CI, and more).

## How it works

This package is a one-line wrapper that imports `create-ai-native-project` (a
dependency, pinned with a caret range). New minor/patch releases of the
canonical CLI flow through automatically, so this alias rarely needs
republishing.

## Releasing

Because it depends on `create-ai-native-project` with a caret range, this alias
only needs republishing on a **major** bump of the canonical CLI. When that
happens:

1. Bump `version` in this folder's `package.json` (and the dependency range).
2. Tag and push `starter-vX.Y.Z` — the `.github/workflows/publish-starter.yml`
   workflow publishes it via npm Trusted Publishing (OIDC, no token). You can
   also trigger that workflow manually from the Actions tab.

Released under the MIT License. © GeekyAnts Inc
