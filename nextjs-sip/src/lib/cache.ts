type Entry<T> = { value: T; expiresAt: number };

export class TTLCache<K, V> {
  private store = new Map<K, Entry<V>>();

  constructor(private defaultTTLms: number) {}

  set(key: K, value: V, ttlMs?: number) {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTLms);
    this.store.set(key, { value, expiresAt });
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key: K) {
    return this.get(key) !== undefined;
  }

  clear() {
    this.store.clear();
  }
}