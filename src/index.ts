import { Command } from "commander";
import { createCommand } from "./commands/create.js";
import { updateCommand } from "./commands/update.js";
import { VERSION } from "./lib/version.js";

// Load .env (registry config) from the current working directory if present.
try {
  process.loadEnvFile();
} catch {
  // No .env — fall back to built-in defaults.
}

const program = new Command();

program
  .name("create-ai-native-project")
  .description(
    "Interactive CLI to scaffold AI-native projects with CLAUDE.md, skills, and agents",
  )
  .version(VERSION)
  .option("--boot <project-name>", "create a new folder and scaffold into it")
  .action((opts: { boot?: string }) => createCommand(opts));

program
  .command("update")
  .description("update the local template registry cache")
  .action(updateCommand);

program.parseAsync(process.argv);
