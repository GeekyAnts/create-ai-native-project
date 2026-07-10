import { describe, expect, it } from "vitest";
import { mergeFirstWins, toPackageName } from "../src/lib/pkgjson.js";

describe("mergeFirstWins", () => {
  it("never overwrites existing top-level scalar fields", () => {
    const out = mergeFirstWins({ type: "module" }, { type: "commonjs", private: true });
    expect(out.type).toBe("module");
    expect(out.private).toBe(true);
  });

  it("merges dependencies per entry with first-wins", () => {
    const out = mergeFirstWins(
      { dependencies: { react: "^18.0.0" } },
      { dependencies: { react: "^19.0.0", next: "^15.0.0" } },
    );
    expect(out.dependencies).toEqual({ react: "^18.0.0", next: "^15.0.0" });
  });

  it("merges scripts per entry with first-wins", () => {
    const out = mergeFirstWins(
      { scripts: { build: "vite build" } },
      { scripts: { build: "nest build", test: "jest" } },
    );
    expect(out.scripts).toEqual({ build: "vite build", test: "jest" });
  });

  it("keeps user-added fields untouched", () => {
    const base = { name: "app", customField: [1, 2, 3] };
    const out = mergeFirstWins(base, { name: "other", scripts: { dev: "x" } });
    expect(out.name).toBe("app");
    expect(out.customField).toEqual([1, 2, 3]);
    expect(out.scripts).toEqual({ dev: "x" });
  });
});

describe("toPackageName", () => {
  it("slugs arbitrary names into npm-safe ones", () => {
    expect(toPackageName("My Cool App!")).toBe("my-cool-app");
    expect(toPackageName("  --weird--  ")).toBe("weird");
  });

  it("falls back to 'app' when nothing survives", () => {
    expect(toPackageName("###")).toBe("app");
  });
});
