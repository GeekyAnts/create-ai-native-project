# Project Manifest

Every scaffolded project carries **`.ai-native-project.json`** at its root. It
records the project's state so re-runs (and your coding assistant) stay aware of
what's already set up — avoiding duplicate or inapplicable actions.

## Example

```json
{
  "generator": "create-ai-native-project",
  "version": "0.3.4",
  "createdAt": "2026-07-14T00:00:00.000Z",
  "updatedAt": "2026-07-14T00:00:00.000Z",
  "projectType": "single",
  "projectName": "Acme Chat",
  "brief": "Realtime chat app for support teams",
  "tools": ["claude-code", "codex", "opencode", "cline"],
  "stacks": ["nextjs", "vercel-ai-sdk"],
  "apps": [],
  "databases": ["postgres"],
  "vectorDb": ["pgvector"],
  "orm": ["prisma"],
  "iac": ["opentofu"],
  "storage": ["seaweedfs"],
  "auth": ["better-auth"],
  "security": ["essential", "supply-chain"],
  "ci": ["github-actions"],
  "docker": true,
  "docs": [],
  "skills": ["engineering-standards", "knowledge-base", "security-standards"],
  "agents": ["code-reviewer", "security-reviewer", "threat-modeler", "security-auditor", "nextjs"]
}
```

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `generator` | string | Always `create-ai-native-project`. |
| `version` | string | CLI version that last wrote the manifest. |
| `createdAt` / `updatedAt` | ISO string | `createdAt` is preserved across re-runs. |
| `projectType` | `single` \| `monorepo` \| null | **Immutable** once set. |
| `projectName` · `brief` | string \| null | Human-readable name + one-line brief, asked up front and substituted into the instructions file's title / description / overview. A blank answer on a re-run keeps the existing value. |
| `tools` | string[] | `claude-code` / `codex` / `opencode` / `cline`. **Additive** — never dropped; defaults to `["claude-code"]` for projects created before tool selection. |
| `stacks` | string[] | Installed stack ids. |
| `apps` | `{group,name,stack}[]` | Monorepo apps (deduped by `group/name`). |
| `databases` · `vectorDb` · `orm` · `storage` · `auth` · `iac` · `security` · `ci` · `docs` | string[] | Installed ids per kind. `vectorDb` / `orm` / `iac` / `security` were added later and **backfill to `[]`** on older manifests. |
| `security` | string[] | Security-standard priority groups the project follows (`essential`, `infrastructure`, `governance`, `testing-validation`, `identity-access`, `supply-chain`, `industry-compliance`). Picking any group auto-installs the `security-standards` skill + `threat-modeler` / `security-auditor` agents. |
| `docker` | boolean | Sticky — stays `true` once enabled. |
| `skills` · `agents` | string[] | Installed skill/agent names (across every tool layout). |

## Merge semantics

On a re-run the manifest is merged, not replaced: arrays are **unioned**,
`createdAt` is preserved, `projectType` keeps its existing value, `docker` stays
`true` once set, and `tools` accumulates. This is why re-running the CLI is safe
and idempotent — see [Extending a Project](/guide/extending).
