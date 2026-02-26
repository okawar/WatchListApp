const BASE_URL: string = "https://api.themoviedb.org/3";
const TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: any; ts: number }>();

export const fetchData = async (endpoint: string) => {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url =
    BASE_URL +
    endpoint +
    separator +
    "api_key=" +
    process.env.EXPO_PUBLIC_TMDB_KEY +
    "&language=ru-RU";

  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, { data, ts: Date.now() });
  return data;
};
