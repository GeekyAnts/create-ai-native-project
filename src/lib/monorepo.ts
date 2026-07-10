import { join } from "node:path";
import { fetchTemplate, readTemplateFile, type TemplateRef } from "./templates.js";
import { composePackageJson } from "./pkgjson.js";
import { writeTemplateFiles, type WriteResult } from "./files.js";
import { readCiComposeConfig, type ComposedFile } from "./ci.js";
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
  /** CI provider ids to compose per-app pipelines for. */
  ci: string[];
  /** Compose a docker-compose.yml (app services + db/storage). */
  docker: boolean;
  dockerBaseId: string | null;
}

/** Unique, stable job/service name for an app. */
export const appId = (a: AppEntry): string => `${a.group}-${a.name}`;

/** The app's directory relative to the workspace root. */
export const appDirOf = (a: AppEntry): string => `apps/${a.group}/${a.name}`;

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

// ---- Per-app Docker & CI composition (transforms on stack fragments) --------

/** Rewrite a stack's compose service for a monorepo app: name, build context, host port. */
export function transformDockerService(
  fragment: string,
  service: string,
  context: string,
  hostPort: number,
  containerPort: number,
): string {
  const lines = fragment.replace(/\s+$/, "").split("\n");
  lines[0] = `  ${service}:`;
  return lines
    .join("\n")
    .replace(/build:\s*\./, `build: ${context}`)
    .replace(/-\s*"\d+:\d+"/, `- "${hostPort}:${containerPort}"`);
}

/** Rewrite a stack's GitHub job: unique name + run steps scoped to the app dir. */
export function transformGithubJob(fragment: string, job: string, dir: string): string {
  const lines = fragment.replace(/\s+$/, "").split("\n");
  lines[0] = `  ${job}:`;
  lines.splice(1, 0, "    defaults:", "      run:", `        working-directory: ${dir}`);
  return lines.join("\n");
}

/** Rewrite a stack's GitLab job: unique name + `cd` into the app dir first. */
export function transformGitlabJob(fragment: string, job: string, dir: string): string {
  const lines = fragment.replace(/\s+$/, "").split("\n");
  lines[0] = `${job}:`;
  return lines.join("\n").replace(/\n  script:\n/, `\n  script:\n    - cd ${dir}\n`);
}

/**
 * Build the docker-compose service block for one app: name = <group>-<name>,
 * build context = the app dir, host port allocated collision-free against
 * `usedPorts` (which is mutated to claim the chosen port). Returns null for
 * stacks with no service (e.g. mobile).
 */
export async function buildAppServiceBlock(
  app: AppEntry,
  usedPorts: Set<number>,
): Promise<string | null> {
  const frag = await readTemplateFile("stack", app.stack, "compose.service.yml");
  if (!frag) return null;
  const m = frag.match(/"(\d+):(\d+)"/);
  const desired = m ? Number(m[1]) : 8000;
  const container = m ? Number(m[2]) : desired;
  let host = desired;
  while (usedPorts.has(host)) host++;
  usedPorts.add(host);
  return transformDockerService(frag, appId(app), `./${appDirOf(app)}`, host, container);
}

/** Build the CI job block for one app (fragmentFile: ci.github.yml / ci.gitlab.yml). */
export async function buildAppJobBlock(
  app: AppEntry,
  fragmentFile: string,
): Promise<string | null> {
  const frag = await readTemplateFile("stack", app.stack, fragmentFile);
  if (!frag || frag.trim().length === 0) return null;
  const dir = appDirOf(app);
  return fragmentFile === "ci.github.yml"
    ? transformGithubJob(frag, appId(app), dir)
    : transformGitlabJob(frag, appId(app), dir);
}

/**
 * Compose docker-compose.yml for a monorepo: one build-based service per app
 * (context = app dir, collision-free host port) plus the workspace databases/
 * storage services (image-based, unchanged).
 */
export async function composeMonorepoDockerCompose(
  baseId: string,
  apps: AppEntry[],
  sectionRefs: TemplateRef[],
): Promise<ComposedFile | null> {
  const base = await readTemplateFile("docker", baseId, "docker-compose.yml");
  if (base === null) return null;

  const usedPorts = new Set<number>();
  const infra: string[] = [];
  for (const ref of sectionRefs) {
    const frag = await readTemplateFile(ref.kind, ref.id, "compose.service.yml");
    if (!frag) continue;
    for (const m of frag.matchAll(/"(\d+):\d+"/g)) usedPorts.add(Number(m[1]));
    infra.push(frag.replace(/\s+$/, ""));
  }

  const appServices: string[] = [];
  for (const app of apps) {
    const block = await buildAppServiceBlock(app, usedPorts);
    if (block) appServices.push(block);
  }

  let out = base.replace(/\s+$/, "");
  for (const block of [...appServices, ...infra]) out += "\n" + block;
  return { path: "docker-compose.yml", contents: out + "\n" };
}

/**
 * Compose a CI pipeline for a monorepo: the provider base + one job per app,
 * each scoped to the app's directory.
 */
export async function composeMonorepoCi(
  providerId: string,
  apps: AppEntry[],
): Promise<ComposedFile | null> {
  const compose = await readCiComposeConfig(providerId);
  if (!compose) return null;

  const base = await readTemplateFile("ci", providerId, compose.base);
  if (base === null) return null;

  let out = base.replace(/\s+$/, "");
  for (const app of apps) {
    const block = await buildAppJobBlock(app, compose.fragment);
    if (block) out += "\n" + block;
  }
  return { path: compose.base, contents: out + "\n" };
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

  // Docker: per-app services (build context + unique host port) + db/storage.
  if (plan.docker && plan.dockerBaseId) {
    const compose = await composeMonorepoDockerCompose(plan.dockerBaseId, plan.apps, plan.sectionRefs);
    if (compose) {
      mergeWR(result, await writeTemplateFiles(targetDir, [{ path: compose.path, contents: compose.contents }], { overwrite }));
    }
    // Verbatim extras shipped by the docker template (e.g. .dockerignore).
    mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("docker", plan.dockerBaseId), { overwrite }));
  }

  // CI: per-app jobs scoped to each app directory.
  for (const providerId of plan.ci) {
    const composed = await composeMonorepoCi(providerId, plan.apps);
    if (composed) {
      mergeWR(result, await writeTemplateFiles(targetDir, [{ path: composed.path, contents: composed.contents }], { overwrite }));
    }
  }

  // Workspace-level extras.
  for (const id of plan.docs) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("docs", id), { overwrite }));
  for (const id of plan.auth) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("auth", id), { overwrite }));
  for (const id of plan.skills) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("skill", id), { overwrite }));
  for (const id of plan.agents) mergeWR(result, await writeTemplateFiles(targetDir, await fetchTemplate("agent", id), { overwrite }));

  return result;
}
