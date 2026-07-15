#!/usr/bin/env node
/**
 * Thin alias for `create-ai-native-project`.
 *
 * `npm create ai-native-starter` (and `npx create-ai-native-starter`) resolve
 * THIS package; we simply import the canonical CLI, which self-executes on
 * import (it builds its commander program and calls `parseAsync(process.argv)`
 * at module top level). So a bare run, `--boot <name>`, and `update` all behave
 * exactly as the canonical package — there is no separate code path to maintain.
 *
 * The real CLI is pulled in as a dependency (`create-ai-native-project`) with a
 * caret range, so new minor/patch releases flow through without republishing
 * this alias.
 */
import "create-ai-native-project/dist/index.js";
