import * as crypto from 'crypto';
import { CacheEntry } from '../utils/types';
import { CACHE_MAX_ENTRIES, CACHE_TTL_MS } from '../utils/constants';

interface InternalCacheEntry extends CacheEntry {
  lastAccess: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export class ExplanationCache {
  private cache: Map<string, InternalCacheEntry>;
  private maxEntries: number;
  private ttlMs: number;
  private hits: number;
  private misses: number;
  private inFlight: Map<string, Promise<string>>;

  constructor(maxEntries?: number, ttlMs?: number) {
    this.cache = new Map();
    this.maxEntries = maxEntries ?? CACHE_MAX_ENTRIES;
    this.ttlMs = ttlMs ?? CACHE_TTL_MS;
    this.hits = 0;
    this.misses = 0;
    this.inFlight = new Map();
  }

  private makeKey(key: string): string {
    return crypto.createHash('md5').update(key).digest('hex');
  }

  private touch(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
  }

  get(key: string): CacheEntry | null {
    const cacheKey = this.makeKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.misses++;
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(cacheKey);
      this.misses++;
      return null;
    }

    this.touch(cacheKey);
    this.hits++;
    return { data: entry.data, timestamp: entry.timestamp, model: entry.model, language: entry.language, key: entry.key };
  }

  set(key: string, entry: Omit<CacheEntry, 'key'>): void {
    const cacheKey = this.makeKey(key);
    const internalEntry: InternalCacheEntry = {
      key: cacheKey,
      data: entry.data,
      timestamp: entry.timestamp,
      model: entry.model,
      language: entry.language,
      lastAccess: Date.now(),
    };

    if (this.cache.has(cacheKey)) {
      this.cache.delete(cacheKey);
    } else if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, internalEntry);
  }

  has(key: string): boolean {
    const cacheKey = this.makeKey(key);
    const entry = this.cache.get(cacheKey);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  getOrFetch(key: string, fetcher: () => Promise<string>): Promise<string> {
    const cacheKey = this.makeKey(key);
    const existing = this.get(key);
    if (existing) {
      return Promise.resolve(existing.data);
    }

    const inFlightPromise = this.inFlight.get(cacheKey);
    if (inFlightPromise) {
      return inFlightPromise;
    }

    const promise = fetcher().then(result => {
      this.set(key, { data: result, timestamp: Date.now(), model: '', language: '' });
      this.inFlight.delete(cacheKey);
      return result;
    }).catch(error => {
      this.inFlight.delete(cacheKey);
      throw error;
    });

    this.inFlight.set(cacheKey, promise);
    return promise;
  }

  purgeExpired(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}
