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

Released under the MIT License. © GeekyAnts Inc
