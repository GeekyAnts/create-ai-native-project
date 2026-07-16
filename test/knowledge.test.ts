import { describe, expect, it } from "vitest";
import {
  buildAreaIndex,
  buildConcept,
  buildLog,
  buildOverview,
  buildRootIndex,
} from "../src/lib/knowledge.js";

describe("buildConcept", () => {
  const section = [
    "## Stack: Next.js",
    "",
    "- **Framework:** Next.js (App Router) + React + TypeScript.",
  ].join("\n");

  it("emits frontmatter with a non-empty type and an H1 title", () => {
    const out = buildConcept({
      type: "Tech Stack",
      title: "Next.js",
      description: "React framework (App Router)",
      tags: ["stack", "nextjs"],
      date: "2026-07-16",
      section,
    });
    expect(out.startsWith("---\n")).toBe(true);
    expect(out).toContain("type: Tech Stack");
    expect(out).toContain("tags: [stack, nextjs]");
    expect(out).toContain("timestamp: 2026-07-16");
    expect(out).toContain("# Next.js");
  });

  it("strips the section's own leading H2 heading (concept supplies the H1)", () => {
    const out = buildConcept({
      type: "Tech Stack",
      title: "Next.js",
      description: "x",
      tags: ["stack", "nextjs"],
      section,
    });
    expect(out).not.toContain("## Stack: Next.js");
    expect(out).toContain("- **Framework:** Next.js");
    expect(out).toContain("## Related");
  });

  it("falls back to the description when there's no section body", () => {
    const out = buildConcept({
      type: "Database",
      title: "PostgreSQL",
      description: "Relational database",
      tags: ["database", "postgres"],
      section: null,
    });
    expect(out).toContain("# PostgreSQL");
    expect(out).toContain("Relational database");
  });

  it("quotes a title/description containing YAML-significant characters", () => {
    const out = buildConcept({
      type: "MCP Server",
      title: "context7",
      description: "Docs: up-to-date, version-specific",
      tags: ["mcp", "context7"],
      section: null,
    });
    expect(out).toContain('description: "Docs: up-to-date, version-specific"');
  });
});

describe("buildAreaIndex", () => {
  it("lists entries with descriptions and no frontmatter", () => {
    const out = buildAreaIndex("Stacks", [
      { id: "nextjs", title: "Next.js", description: "React framework" },
      { id: "node-nest", title: "NestJS", description: "" },
    ]);
    expect(out.startsWith("# Stacks")).toBe(true);
    expect(out).not.toContain("---");
    expect(out).toContain("- [Next.js](./nextjs.md) — React framework");
    expect(out).toContain("- [NestJS](./node-nest.md)");
    expect(out).not.toContain("NestJS](./node-nest.md) —");
  });
});

describe("buildRootIndex", () => {
  it("declares okf_version and links present areas + the About table", () => {
    const out = buildRootIndex(
      { name: "Acme Chat", brief: "Realtime chat", date: "2026-07-16" },
      [
        { dir: "stacks", heading: "Stacks" },
        { dir: "databases", heading: "Databases" },
      ],
    );
    expect(out).toContain('okf_version: "0.1"');
    expect(out).toContain("# Acme Chat Knowledge Base");
    expect(out).toContain("- [Overview](./overview.md)");
    expect(out).toContain("- [Stacks](./stacks/index.md)");
    expect(out).toContain("- [Databases](./databases/index.md)");
    expect(out).toContain("| Description | Realtime chat |");
    expect(out).toContain("| Last Updated | 2026-07-16 |");
  });

  it("is valid with no areas selected", () => {
    const out = buildRootIndex({ name: "Bare" }, []);
    expect(out).toContain('okf_version: "0.1"');
    expect(out).toContain("# Bare Knowledge Base");
    expect(out).toContain("- [Overview](./overview.md)");
  });
});

describe("buildOverview", () => {
  it("injects the project name + brief and lists areas", () => {
    const out = buildOverview({ name: "Acme Chat", brief: "Realtime chat", date: "2026-07-16" }, [
      { dir: "stacks", heading: "Stacks" },
    ]);
    expect(out).toContain("type: Project Overview");
    expect(out).toContain("# Acme Chat");
    expect(out).toContain("Realtime chat");
    expect(out).toContain("- [Stacks](./stacks/index.md)");
  });

  it("uses the placeholder prose when no brief is given", () => {
    const out = buildOverview({ name: "Acme" }, []);
    expect(out).toContain("_What this project is and the problem it solves._");
  });
});

describe("buildLog", () => {
  it("uses an ISO date heading and a creation entry", () => {
    const out = buildLog({ date: "2026-07-16" });
    expect(out).toContain("# Update Log");
    expect(out).toContain("## 2026-07-16");
    expect(out).toContain("- **Creation**: Initialized the OKF knowledge bundle.");
  });
});
