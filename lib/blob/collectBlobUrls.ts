import { isOwnBlobUrl } from "@/lib/azureBlob";

function toPlain(doc: unknown): unknown {
  if (doc && typeof doc === "object") {
    const maybeDoc = doc as { toObject?: () => unknown };
    if (typeof maybeDoc.toObject === "function") return maybeDoc.toObject();
  }
  return doc;
}

/**
 * Walk an arbitrary value (Mongo doc, plain object, array) and collect every
 * string that is one of our own storage-blob URLs.
 *
 * Convention-based on purpose: no per-model field config to keep in sync. New
 * image fields and nested sections are picked up automatically.
 *
 * Pass an existing Set as `into` to accumulate across many documents without
 * allocating intermediates.
 */
export function collectBlobUrls(
  doc: unknown,
  into: Set<string> = new Set(),
): Set<string> {
  const seen = new WeakSet<object>();

  const visit = (node: unknown) => {
    if (typeof node === "string") {
      const url = node.split("?")[0];
      if (isOwnBlobUrl(url)) into.add(url);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    Object.values(node as Record<string, unknown>).forEach(visit);
  };

  visit(toPlain(doc));
  return into;
}
