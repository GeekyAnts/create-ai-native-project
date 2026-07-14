import { describe, expect, it } from "vitest";
import { applyProjectMeta } from "../src/lib/claudemd.js";

const BASE = [
  "# <Project> Knowledge Base",
  "",
  "| Title | <Project> Knowledge Base |",
  "| Description | <one-line description> |",
  "| Last Updated | <YYYY-MM-DD> |",
  "",
  "## 2. Overview",
  "_What this project is and the problem it solves._",
  "",
  "- <YYYY-MM-DD> — Initialized project knowledge base.",
].join("\n");

describe("applyProjectMeta", () => {
  it("substitutes name into every <Project> placeholder", () => {
    const out = applyProjectMeta(BASE, { name: "Acme Chat" });
    expect(out).toContain("# Acme Chat Knowledge Base");
    expect(out).toContain("| Title | Acme Chat Knowledge Base |");
    expect(out).not.toContain("<Project>");
  });

  it("substitutes brief into description + overview placeholders", () => {
    const out = applyProjectMeta(BASE, { brief: "Realtime chat for support teams" });
    expect(out).toContain("| Description | Realtime chat for support teams |");
    expect(out).toContain("## 2. Overview\nRealtime chat for support teams");
    expect(out).not.toContain("<one-line description>");
    expect(out).not.toContain("_What this project is and the problem it solves._");
  });

  it("substitutes the date into every <YYYY-MM-DD> placeholder", () => {
    const out = applyProjectMeta(BASE, { date: "2026-07-14" });
    expect(out).toContain("| Last Updated | 2026-07-14 |");
    expect(out).toContain("- 2026-07-14 — Initialized project knowledge base.");
    expect(out).not.toContain("<YYYY-MM-DD>");
  });

  it("leaves placeholders intact for empty/undefined values", () => {
    expect(applyProjectMeta(BASE, {})).toBe(BASE);
    expect(applyProjectMeta(BASE, { name: "   ", brief: "" })).toBe(BASE);
    expect(applyProjectMeta(BASE, undefined)).toBe(BASE);
  });

  it("inserts a brief containing $ literally (no regex replacement surprises)", () => {
    const out = applyProjectMeta(BASE, { brief: "Costs $5/mo; uses $HOME" });
    expect(out).toContain("| Description | Costs $5/mo; uses $HOME |");
  });
});
