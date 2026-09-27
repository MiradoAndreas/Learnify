/**
 * Fixed-size chunker with overlap. Good enough for lesson descriptions and
 * short transcripts; swap for a token-aware splitter once lessons grow long
 * enough that character count stops being a fair proxy for token count.
 */
export function chunkText(
  text: string,
  { size = 800, overlap = 120 }: { size?: number; overlap?: number } = {},
): string[] {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + size, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }

  return chunks;
}
