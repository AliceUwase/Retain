// localStorage helpers for the fake API... will be deleted once the backend is ready.

const PREFIX = 'retain:';

// Returns the saved list, or saves and returns a copy of `seed` the first time.
export function loadList<T>(key: string, seed: T[]): T[] {
  const saved = localStorage.getItem(PREFIX + key);
  if (saved === null) {
    const copy = structuredClone(seed);
    saveList(key, copy);
    return copy;
  }
  return JSON.parse(saved) as T[];
}

export function saveList<T>(key: string, items: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(items));
}

// Fake network delay.
export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

// Current time as an ISO timestamp.
export function now(): string {
  return new Date().toISOString();
}
