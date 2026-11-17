const HISTORY_STORAGE_KEY = 'country_search_history_v1';
const MAX_HISTORY_ITEMS = 5;

export function loadSearchHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function saveSearchQuery(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return loadSearchHistory();
  }

  const current = loadSearchHistory();
  const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return updated;
  }
}
