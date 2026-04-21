function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) {
    prev[j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = curr[j];
    }
  }
  return prev[b.length];
}

function maxEditsForTerm(length: number): number {
  if (length <= 3) {
    return 0;
  }
  if (length <= 5) {
    return 1;
  }
  return 2;
}

const TOKEN_RE = /[\p{L}\p{N}+#.]+/gu;

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(TOKEN_RE);
  return matches ?? [];
}

function termMatchesHaystack(term: string, haystack: string, tokens: string[]): boolean {
  if (!term) {
    return true;
  }
  if (haystack.includes(term)) {
    return true;
  }
  const budget = maxEditsForTerm(term.length);
  if (budget === 0) {
    return false;
  }
  for (const token of tokens) {
    if (Math.abs(token.length - term.length) > budget) {
      continue;
    }
    if (levenshtein(token, term) <= budget) {
      return true;
    }
  }
  return false;
}

export function fuzzyMatch(query: string, haystack: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  const lowered = haystack.toLowerCase();
  const terms = trimmed.split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return true;
  }
  const tokens = tokenize(lowered);
  return terms.every((term) => termMatchesHaystack(term, lowered, tokens));
}
