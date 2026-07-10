import { describe, expect, it } from "vitest";
import { appendBlocks, toBlock, usedHostPorts } from "../src/lib/augment.js";

describe("toBlock", () => {
  it("uses the first line as the identity header", () => {
    const b = toBlock("  nest:\n    build: .\n");
    expect(b.header).toBe("  nest:");
    expect(b.body).toBe("  nest:\n    build: .");
  });
});

describe("appendBlocks", () => {
  const existing = "services:\n  web:\n    build: .\n";

  it("appends blocks whose header is absent", () => {
    const { content, added } = appendBlocks(existing, [toBlock("  db:\n    image: postgres\n")]);
    expect(added).toEqual(["db:"]);
    expect(content).toBe("services:\n  web:\n    build: .\n  db:\n    image: postgres\n");
  });

  it("skips blocks whose header already exists (idempotent)", () => {
    const { content, added } = appendBlocks(existing, [toBlock("  web:\n    build: ./other\n")]);
    expect(added).toEqual([]);
    expect(content).toBe(existing);
  });

  it("supports a custom separator for markdown sections", () => {
    const md = "# Doc\n\n## Stack: React\n";
    const { content, added } = appendBlocks(md, [toBlock("## Database: PostgreSQL\ndetails")], "\n\n");
    expect(added).toEqual(["## Database: PostgreSQL"]);
    expect(content).toContain("## Stack: React\n\n## Database: PostgreSQL\ndetails\n");
  });

  it("ignores blocks with an empty header", () => {
    const { content, added } = appendBlocks(existing, [{ header: "  ", body: "junk" }]);
    expect(added).toEqual([]);
    expect(content).toBe(existing);
  });
});

describe("usedHostPorts", () => {
  it("collects host ports from HOST:CONTAINER mappings", () => {
    const yml = 'ports:\n  - "3000:3000"\n  - "3001:3000"\n  - "5432:5432"\n';
    expect([...usedHostPorts(yml)].sort()).toEqual([3000, 3001, 5432]);
  });

  it("returns an empty set when no ports are mapped", () => {
    expect(usedHostPorts("services:\n").size).toBe(0);
  });
});
