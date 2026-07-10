import { describe, expect, it } from "vitest";
import {
  appDirOf,
  appId,
  transformDockerService,
  transformGithubJob,
  transformGitlabJob,
} from "../src/lib/monorepo.js";

const app = { group: "frontend", name: "website", stack: "nextjs" };

describe("app identity", () => {
  it("derives a unique service/job name and directory", () => {
    expect(appId(app)).toBe("frontend-website");
    expect(appDirOf(app)).toBe("apps/frontend/website");
  });
});

describe("transformDockerService", () => {
  const fragment = '  nextjs:\n    build: .\n    ports:\n      - "3000:3000"\n';

  it("renames the service, points build at the app dir, and remaps the host port", () => {
    const out = transformDockerService(fragment, "frontend-website", "./apps/frontend/website", 3001, 3000);
    expect(out).toContain("  frontend-website:");
    expect(out).toContain("build: ./apps/frontend/website");
    expect(out).toContain('- "3001:3000"');
    expect(out).not.toContain("  nextjs:");
  });
});

describe("transformGithubJob", () => {
  const fragment =
    "  nextjs:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: pnpm run build\n";

  it("renames the job and scopes run steps to the app directory", () => {
    const out = transformGithubJob(fragment, "frontend-website", "apps/frontend/website");
    const lines = out.split("\n");
    expect(lines[0]).toBe("  frontend-website:");
    expect(lines[1]).toBe("    defaults:");
    expect(lines[2]).toBe("      run:");
    expect(lines[3]).toBe("        working-directory: apps/frontend/website");
    expect(out).toContain("runs-on: ubuntu-latest");
  });
});

describe("transformGitlabJob", () => {
  const fragment =
    "nextjs:\n  stage: build\n  image: node:22\n  script:\n    - pnpm run build\n";

  it("renames the job and cds into the app directory first", () => {
    const out = transformGitlabJob(fragment, "frontend-website", "apps/frontend/website");
    expect(out.split("\n")[0]).toBe("frontend-website:");
    expect(out).toContain("  script:\n    - cd apps/frontend/website\n    - pnpm run build");
  });
});
