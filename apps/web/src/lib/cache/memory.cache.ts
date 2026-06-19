import { ICacheService } from "./cache.interface";

interface CacheItem<T> {
  value: T;
  expiry: number | null;
}

export class MemoryCache implements ICacheService {
  private store: Map<string, CacheItem<unknown>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export const memoryCache = new MemoryCache();
