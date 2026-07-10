/** A safe single path segment (lowercase, dashes). */
export function slugSegment(v: string): string {
  return (
    v
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "") || "app"
  );
}
