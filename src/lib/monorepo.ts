import { join } from "node:path";
import { fetchTemplate, readTemplateFile, type TemplateRef } from "./templates.js";
import { composePackageJson } from "./pkgjson.js";
import { writeTemplateFiles, type WriteResult } from "./files.js";
import type { AppEntry } from "./manifest.js";

export interface MonorepoPlan {
  projectName: string;
  apps: AppEntry[];
  /** databases/storage/auth — contribute CLAUDE.md sections. */
  sectionRefs: TemplateRef[];
  /** auth ids — also copy their verbatim setup files. */
  auth: string[];
  docs: string[];
  /** skills/agents to install at the workspace root (already unioned with core). */
  skills: string[];
  agents: string[];
  includeClaudeMd: boolean;
}

const appDir = (a: AppEntry): string => join("apps", a.group, a.name);

function mergeWR(into: WriteResult, from: WriteResult): void {
  into.written.push(...from.written);
  into.skipped.push(...from.skipped);
}

/** Compose the monorepo CLAUDE.md: base + a section per app + workspace sections. */
export async function composeMonorepoClaudeMd(
  apps: AppEntry[],
  sectionRefs: TemplateRef[],
): Promise<string | null> {
  let base = await readTemplateFile("project-type", "monorepo", "CLAUDE.md");
  if (base === null) base = await readTemplateFile("claude", "default", "CLAUDE.md");
  if (base === null) return null;

  let out = base.trimEnd();
  for (const app of apps) {
    out += `\n\n### App: apps/${app.group}/${app.name} — ${app.stack}`;
    const sec = await readTemplateFile("stack", app.stack, "CLAUDE.section.md");
    if (sec && sec.trim().length > 0) out += "\n\n" + sec.trim();
  }
  for (const ref of sectionRefs) {
    const sec = await readTemplateFile(ref.kind, ref.id, "CLAUDE.section.md");
    if (sec && sec.trim().length > 0) out += "\n\n" + sec.trim();
  }
  return out + "\n";
}

/**
 * Install one app's stack under apps/<group>/<name>/. Files under `.claude/`
 * are routed to the workspace root (agents/skills are project-wide); everything
 * else lands in the app directory. The app's package.json is composed from the
 * stack fragment with the app's name.
 */
async function installApp(
  targetDir: string,
  app: AppEntry,
  overwrite: boolean,
): Promise<WriteResult> {
  const dir = appDir(app);
  const files = await fetchTemplate("stack", app.stack);
  const routed = files.map((f) =>
    f.path.startsWith(".claude/") ? f : { ...f, path: join(dir, f.path) },
  );
  const result = await writeTemplateFiles(targetDir, routed, { overwrite });

  const pkg = await composePackageJson(app.name, null, [app.stack]);
  if (pkg) {
    mergeWR(
      result,
      await writeTemplateFiles(
        targetDir,
        [{ path: join(dir, "package.json"), contents: pkg }],
        { overwrite },
      ),
    );
  }
  return result;
}

/** Scaffold a monorepo: workspace root + one app per entry + workspace tooling. */
export async function scaffoldMonorepo(
  targetDir: string,
  plan: MonorepoPlan,
  overwrite: boolean,
): Promise<WriteResult> {
  const result: WriteResult = { written: [], skipped: [] };

  // Workspace root: turbo.json, pnpm-workspace.yaml, packages/*, .gitignore.
  mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("project-type", "monorepo"), { overwrite }));

  // Root package.json (Turborepo base).
  const rootPkg = await composePackageJson(plan.projectName, "monorepo", []);
  if (rootPkg) {
    mergeWR(result, await writeTemplateFiles(targetDir, [{ path: "package.json", contents: rootPkg }], { overwrite }));
  }

  if (plan.includeClaudeMd) {
    const md = await composeMonorepoClaudeMd(plan.apps, plan.sectionRefs);
    if (md) mergeWR(result, await writeTemplateFiles(targetDir, [{ path: "CLAUDE.md", contents: md }], { overwrite }));
  }

  for (const app of plan.apps) mergeWR(result, await installApp(targetDir, app, overwrite));

  // Workspace-level extras.
  for (const id of plan.docs) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("docs", id), { overwrite }));
  for (const id of plan.auth) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("auth", id), { overwrite }));
  for (const id of plan.skills) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("skill", id), { overwrite }));
  for (const id of plan.agents) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("agent", id), { overwrite }));

  return result;
}
