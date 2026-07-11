import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest, writeManifest, type ManifestState } from "../src/lib/manifest.js";

const state = (over: Partial<ManifestState> = {}): ManifestState => ({
  projectType: "single",
  tools: [],
  stacks: [],
  apps: [],
  databases: [],
  storage: [],
  auth: [],
  ci: [],
  docker: false,
  docs: [],
  skills: [],
  agents: [],
  ...over,
});

describe("manifest", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "canp-manifest-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("round-trips a fresh manifest", async () => {
    await writeManifest(dir, state({ stacks: ["react"] }), "0.2.0", "2026-07-10T00:00:00.000Z");
    const m = await readManifest(dir);
    expect(m?.projectType).toBe("single");
    expect(m?.stacks).toEqual(["react"]);
    expect(m?.createdAt).toBe("2026-07-10T00:00:00.000Z");
  });

  it("preserves createdAt and keeps the project type immutable", async () => {
    await writeManifest(dir, state(), "0.2.0", "2026-07-10T00:00:00.000Z");
    const m = await writeManifest(
      dir,
      state({ projectType: "monorepo" }),
      "0.2.0",
      "2026-07-11T00:00:00.000Z",
    );
    expect(m.projectType).toBe("single"); // existing type wins
    expect(m.createdAt).toBe("2026-07-10T00:00:00.000Z");
    expect(m.updatedAt).toBe("2026-07-11T00:00:00.000Z");
  });

  it("unions arrays and dedupes apps by group/name", async () => {
    await writeManifest(
      dir,
      state({
        projectType: "monorepo",
        stacks: ["react"],
        apps: [{ group: "frontend", name: "web", stack: "react" }],
      }),
      "0.2.0",
      "2026-07-10T00:00:00.000Z",
    );
    const m = await writeManifest(
      dir,
      state({
        projectType: "monorepo",
        stacks: ["react", "node-nest"],
        apps: [
          { group: "frontend", name: "web", stack: "react" },
          { group: "backend", name: "api", stack: "node-nest" },
        ],
        docker: true,
      }),
      "0.2.0",
      "2026-07-11T00:00:00.000Z",
    );
    expect(m.stacks).toEqual(["react", "node-nest"]);
    expect(m.apps).toHaveLength(2);
    expect(m.docker).toBe(true);
  });

  it("keeps docker true once set", async () => {
    await writeManifest(dir, state({ docker: true }), "0.2.0", "2026-07-10T00:00:00.000Z");
    const m = await writeManifest(dir, state({ docker: false }), "0.2.0", "2026-07-11T00:00:00.000Z");
    expect(m.docker).toBe(true);
  });

  it("returns null when no manifest exists", async () => {
    expect(await readManifest(dir)).toBeNull();
  });

  it("defaults tools to claude-code and unions tool selections", async () => {
    // No tools specified -> backward-compat default.
    const fresh = await writeManifest(dir, state(), "0.3.0", "2026-07-10T00:00:00.000Z");
    expect(fresh.tools).toEqual(["claude-code"]);
    // Adding a tool later unions with the existing set.
    const merged = await writeManifest(
      dir,
      state({ tools: ["opencode", "codex"] }),
      "0.3.0",
      "2026-07-11T00:00:00.000Z",
    );
    expect(merged.tools).toEqual(["claude-code", "opencode", "codex"]);
  });
});
