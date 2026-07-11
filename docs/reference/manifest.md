# Project Manifest

Every scaffolded project carries **`.ai-native-project.json`** at its root. It
records the project's state so re-runs (and your coding assistant) stay aware of
what's already set up — avoiding duplicate or inapplicable actions.

## Example

```json
{
  "generator": "create-ai-native-project",
  "version": "0.3.1",
  "createdAt": "2026-07-11T00:00:00.000Z",
  "updatedAt": "2026-07-11T00:00:00.000Z",
  "projectType": "single",
  "tools": ["claude-code", "codex", "opencode"],
  "stacks": ["react", "node-nest"],
  "apps": [],
  "databases": ["postgres"],
  "storage": [],
  "auth": ["jwt"],
  "ci": ["github-actions"],
  "docker": true,
  "docs": [],
  "skills": ["engineering-standards", "knowledge-base"],
  "agents": ["code-reviewer", "security-reviewer", "react"]
}
```

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `generator` | string | Always `create-ai-native-project`. |
| `version` | string | CLI version that last wrote the manifest. |
| `createdAt` / `updatedAt` | ISO string | `createdAt` is preserved across re-runs. |
| `projectType` | `single` \| `monorepo` \| null | **Immutable** once set. |
| `tools` | string[] | `claude-code` / `codex` / `opencode`. **Additive** — never dropped; defaults to `["claude-code"]` for projects created before tool selection. |
| `stacks` | string[] | Installed stack ids. |
| `apps` | `{group,name,stack}[]` | Monorepo apps (deduped by `group/name`). |
| `databases` · `storage` · `auth` · `ci` · `docs` | string[] | Installed ids per kind. |
| `docker` | boolean | Sticky — stays `true` once enabled. |
| `skills` · `agents` | string[] | Installed skill/agent names (across every tool layout). |

## Merge semantics

On a re-run the manifest is merged, not replaced: arrays are **unioned**,
`createdAt` is preserved, `projectType` keeps its existing value, `docker` stays
`true` once set, and `tools` accumulates. This is why re-running the CLI is safe
and idempotent — see [Extending a Project](/guide/extending).
