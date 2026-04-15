export function readSessionSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return new Set();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

export function writeSessionSet(key: string, value: Set<string>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify([...value]));
  } catch {
    // ignore quota errors
  }
}
