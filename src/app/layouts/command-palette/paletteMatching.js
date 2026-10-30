// Accent-insensitive matching helpers for the command palette.

const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalizeText(value) {
  return String(value ?? '').normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

/**
 * Scores how well `query` matches an item (higher is better, 0 = no match).
 * Exact/prefix matches on the title win, then word starts, then keywords, then a
 * loose in-order subsequence on the title ("fuzzy-ish").
 */
export function scoreMatch(query, title, keywords = []) {
  const q = normalizeText(query).trim();
  if (!q) return 1;

  const t = normalizeText(title);
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.split(/[\s·/-]+/).some((word) => word.startsWith(q))) return 80;
  if (t.includes(q)) return 70;

  const haystack = `${t} ${keywords.map(normalizeText).join(' ')}`;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.every((token) => haystack.includes(token))) return 55;

  let cursor = 0;
  for (const char of q.replace(/\s+/g, '')) {
    cursor = t.indexOf(char, cursor);
    if (cursor === -1) return 0;
    cursor += 1;
  }
  return 20;
}

/**
 * Splits `text` into [{ text, match }] segments highlighting the first
 * accent-insensitive occurrence of `query`. Original characters are preserved.
 */
export function splitHighlight(text, query) {
  const source = String(text ?? '');
  const q = normalizeText(query).trim();
  if (!q || !source) return [{ text: source, match: false }];

  // Per-character normalization keeps a map back to the original indexes.
  const offsets = [];
  let normalized = '';
  for (let index = 0; index < source.length; index += 1) {
    const piece = normalizeText(source[index]);
    for (let k = 0; k < piece.length; k += 1) offsets.push(index);
    normalized += piece;
  }

  const start = normalized.indexOf(q);
  if (start === -1) return [{ text: source, match: false }];

  const from = offsets[start];
  const to = offsets[start + q.length - 1] + 1;
  return [
    { text: source.slice(0, from), match: false },
    { text: source.slice(from, to), match: true },
    { text: source.slice(to), match: false },
  ].filter((segment) => segment.text);
}
