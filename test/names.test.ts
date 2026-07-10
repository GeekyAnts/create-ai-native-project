import { describe, expect, it } from "vitest";
import { slugSegment } from "../src/lib/names.js";

describe("slugSegment", () => {
  it("lowercases and dashes arbitrary input", () => {
    expect(slugSegment("Admin Panel")).toBe("admin-panel");
    expect(slugSegment("  My_App  ")).toBe("my_app");
  });

  it("strips leading/trailing separators", () => {
    expect(slugSegment("--api--")).toBe("api");
  });

  it("falls back to 'app' for empty results", () => {
    expect(slugSegment("!!!")).toBe("app");
  });
});
