import { fetchData } from "./tmdb";

export const getTrending = async () => fetchData("/trending/movie/day");
export const searchMovies = async (query: string) => fetchData(`/search/movie?query=${encodeURIComponent(query)}`);
export const getMovieDetails = async (id: number) => fetchData(`/movie/${id}`);
export const getMovieCredits = async (id: number) => fetchData(`/movie/${id}/credits`);
export const getPopularMovies = async (page = 1) => fetchData(`/movie/popular?page=${page}`);
export const getPopularTVShows = async (page = 1) => fetchData(`/tv/popular?page=${page}`);

// Trending (paginated)
export const getTrendingMovies = async (page = 1) => fetchData(`/trending/movie/week?page=${page}`);
export const getTrendingTV = async (page = 1) => fetchData(`/trending/tv/week?page=${page}`);

// Genres
export const getMovieGenres = async () => fetchData("/genre/movie/list");
export const getTVGenres = async () => fetchData("/genre/tv/list");

// Discover by genre
export const discoverMovies = async (genreId: number, page = 1) =>
  fetchData(`/discover/movie?sort_by=popularity.desc&with_genres=${genreId}&page=${page}`);

export const discoverTV = async (genreId: number, page = 1) =>
  fetchData(`/discover/tv?sort_by=popularity.desc&with_genres=${genreId}&page=${page}`);

export const getTopRatedMovies = async (page = 1) => fetchData(`/movie/top_rated?page=${page}`);
export const getUpcomingMovies = async (page = 1) => fetchData(`/movie/upcoming?page=${page}`);
export const getTopRatedTV = async (page = 1) => fetchData(`/tv/top_rated?page=${page}`);
export const getOnAirTV = async (page = 1) => fetchData(`/tv/on_the_air?page=${page}`);
export const searchMulti = async (query: string) =>
  fetchData(`/search/multi?query=${encodeURIComponent(query)}`);

interface DiscoverParams {
  sort_by: string;
  year: number | null;
  country: string | null;
  min_rating: number | null;
  genre: number | null;
  page: number;
}

const buildDiscoverParts = (params: DiscoverParams, yearKey: string) => {
  const parts: string[] = [`sort_by=${params.sort_by}`];
  if (params.year) parts.push(`${yearKey}=${params.year}`);
  if (params.country) parts.push(`with_origin_country=${params.country}`);
  if (params.min_rating) {
    parts.push(`vote_average.gte=${params.min_rating}`);
    parts.push(`vote_count.gte=100`);
  }
  if (params.genre) parts.push(`with_genres=${params.genre}`);
  parts.push(`page=${params.page}`);
  return parts;
};

export const getMovieVideos = (id: number) => fetchData(`/movie/${id}/videos`);
export const getTVDetails = (id: number) => fetchData(`/tv/${id}`);
export const getTVCredits = (id: number) => fetchData(`/tv/${id}/credits`);
export const getTVVideos = (id: number) => fetchData(`/tv/${id}/videos`);
export const getMovieExternalIds = (id: number) => fetchData(`/movie/${id}/external_ids`);
export const getTVExternalIds = (id: number) => fetchData(`/tv/${id}/external_ids`);

/** Получить Kinopoisk ID по IMDB ID через kinopoisk.dev (требует EXPO_PUBLIC_KP_KEY) */
export const getKinopoiskId = async (imdbId: string): Promise<number | null> => {
  const key = process.env.EXPO_PUBLIC_KP_KEY;
  if (!key || !imdbId) return null;
  try {
    const resp = await fetch(
      `https://api.kinopoisk.dev/v1.4/movie?externalId.imdb=${imdbId}&limit=1`,
      { headers: { "X-API-KEY": key } },
    );
    const data = await resp.json();
    return (data?.docs?.[0]?.id as number) ?? null;
  } catch {
    return null;
  }
};

export const discoverMoviesAdvanced = async (params: DiscoverParams) =>
  fetchData(`/discover/movie?${buildDiscoverParts(params, "primary_release_year").join("&")}`);

export const discoverTVAdvanced = async (params: DiscoverParams) =>
  fetchData(`/discover/tv?${buildDiscoverParts(params, "first_air_date_year").join("&")}`);
