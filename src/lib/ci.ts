import { readTemplateFile, type TemplateRef } from "./templates.js";

export interface ComposedFile {
  /** Path relative to the target project root. */
  path: string;
  contents: string;
}

/** Read a CI provider's compose config ({base, fragment}) from its template.json. */
export async function readCiComposeConfig(
  providerId: string,
): Promise<{ base: string; fragment: string } | null> {
  const manifestRaw = await readTemplateFile("ci", providerId, "template.json");
  if (!manifestRaw) return null;
  try {
    const compose = JSON.parse(manifestRaw).compose;
    if (compose?.base && compose?.fragment) {
      return { base: compose.base, fragment: compose.fragment };
    }
  } catch {
    // malformed manifest — treat as no compose config
  }
  return null;
}

/**
 * Compose a per-stack CI pipeline (text composition, like docker-compose):
 * the CI provider template's `template.json` declares `compose: { base, fragment }`,
 * where `base` is the skeleton pipeline file and `fragment` is the per-stack job
 * file name. Each selected stack's `fragment` is appended to the base.
 *
 * Returns null if the provider has no compose config (caller should copy it
 * verbatim instead) or its base file is missing.
 */
export async function composeCi(
  providerId: string,
  refs: TemplateRef[],
): Promise<ComposedFile | null> {
  const compose = await readCiComposeConfig(providerId);
  if (!compose) return null;

  const base = await readTemplateFile("ci", providerId, compose.base);
  if (base === null) return null;

  let out = base.replace(/\s+$/, "");
  for (const ref of refs) {
    const frag = await readTemplateFile(ref.kind, ref.id, compose.fragment);
    if (frag && frag.trim().length > 0) {
      out += "\n" + frag.replace(/\s+$/, "");
    }
  }
  return { path: compose.base, contents: out + "\n" };
}
