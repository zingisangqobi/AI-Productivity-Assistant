const KEYS = {
  emails: "aria:emails",
  meetings: "aria:meetings",
  tasks: "aria:tasks",
  research: "aria:research",
  chatThreads: "aria:chat:threads",
} as const;

export type StoreKey = keyof typeof KEYS;

export function loadList<T>(key: StoreKey): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS[key]);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function saveList<T>(key: StoreKey, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS[key], JSON.stringify(items));
}

export function pushItem<T extends { id: string }>(key: StoreKey, item: T) {
  const list = loadList<T>(key);
  list.unshift(item);
  saveList(key, list.slice(0, 50));
}

export function getCount(key: StoreKey): number {
  return loadList(key).length;
}
