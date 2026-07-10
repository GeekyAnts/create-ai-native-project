/**
 * Helpers for "add-later" runs: instead of skipping generator-owned files that
 * already exist, we append the newly selected pieces to them — new CLAUDE.md
 * sections, docker-compose services, and CI jobs — and deep-merge package.json
 * with EXISTING-WINS semantics so user edits are never clobbered.
 *
 * The core of each operation is a pure function (unit-testable, no I/O).
 */

import { access, readFile } from "node:fs/promises";

/** A self-contained chunk to append, identified by its first line. */
export interface Block {
  /** Identity line — if it already appears in the file, the block is skipped. */
  header: string;
  body: string;
}

/** Read a file's contents, or null if it doesn't exist. */
export async function readIfExists(path: string): Promise<string | null> {
  try {
    await access(path);
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

/** Build a Block from a fragment, using its first line as the identity. */
export function toBlock(fragment: string): Block {
  const body = fragment.replace(/\s+$/, "");
  return { header: body.split("\n", 1)[0], body };
}

/**
 * Append blocks to an existing file's content, skipping any block whose header
 * line already appears (so re-runs are idempotent). Returns the new content and
 * which headers were actually added.
 */
export function appendBlocks(
  existing: string,
  blocks: Block[],
  sep = "\n",
): { content: string; added: string[] } {
  let out = existing.replace(/\s+$/, "");
  const added: string[] = [];
  for (const block of blocks) {
    if (block.header.trim().length === 0) continue;
    if (out.includes(block.header)) continue;
    out += sep + block.body;
    added.push(block.header.trim());
  }
  return { content: out + "\n", added };
}

/** Host ports already claimed in a docker-compose file ("HOST:CONTAINER"). */
export function usedHostPorts(content: string): Set<number> {
  return new Set(
    [...content.matchAll(/"(\d+):\d+"/g)].map((m) => Number(m[1])),
  );
}
