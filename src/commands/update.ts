import * as p from "@clack/prompts";
import pc from "picocolors";
import { REGISTRY_URL, REGISTRY_REF, updateRegistry } from "../lib/templates.js";

export async function updateCommand(): Promise<void> {
  p.intro(pc.cyan("create-ai-native-project update"));
  p.log.info(`Registry: ${pc.dim(`${REGISTRY_URL} (${REGISTRY_REF})`)}`);

  const spin = p.spinner();
  spin.start("Updating template registry cache…");
  try {
    const path = await updateRegistry();
    spin.stop(`Registry up to date at ${pc.dim(path)}`);
  } catch (err) {
    spin.error("Update failed.");
    p.log.error(String(err instanceof Error ? err.message : err));
    return;
  }
  p.outro(pc.green("Done!"));
}
