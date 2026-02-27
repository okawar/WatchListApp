const BASE_URL = "https://api.themoviedb.org/3";
const TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: unknown;
  ts: number;
}

const cache = new Map<string, CacheEntry>();

export const fetchData = async <T = unknown>(endpoint: string): Promise<T> => {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url =
    BASE_URL +
    endpoint +
    separator +
    "api_key=" +
    process.env.EXPO_PUBLIC_TMDB_KEY +
    "&language=ru-RU";

  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;

  const response = await fetch(url);

  if (!response.ok) {
    if (__DEV__) console.warn("[TMDB] HTTP error", response.status, endpoint);
    throw new Error(`TMDB ${response.status}: ${endpoint}`);
  }

  const data: T = await response.json();
  cache.set(url, { data, ts: Date.now() });
  return data;
};

export const clearCache = () => cache.clear();
