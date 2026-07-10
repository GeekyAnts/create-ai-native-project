import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeTemplateFiles } from "../src/lib/files.js";

describe("writeTemplateFiles", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "canp-files-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("writes files, creating nested directories", async () => {
    const res = await writeTemplateFiles(dir, [{ path: "a/b/c.txt", contents: "hi" }]);
    expect(res.written).toHaveLength(1);
    expect(await readFile(join(dir, "a/b/c.txt"), "utf8")).toBe("hi");
  });

  it("skips existing files by default", async () => {
    await writeTemplateFiles(dir, [{ path: "x.txt", contents: "original" }]);
    const res = await writeTemplateFiles(dir, [{ path: "x.txt", contents: "clobber" }]);
    expect(res.written).toHaveLength(0);
    expect(res.skipped).toHaveLength(1);
    expect(await readFile(join(dir, "x.txt"), "utf8")).toBe("original");
  });

  it("overwrites when asked to", async () => {
    await writeTemplateFiles(dir, [{ path: "x.txt", contents: "original" }]);
    const res = await writeTemplateFiles(dir, [{ path: "x.txt", contents: "new" }], {
      overwrite: true,
    });
    expect(res.written).toHaveLength(1);
    expect(await readFile(join(dir, "x.txt"), "utf8")).toBe("new");
  });
});
