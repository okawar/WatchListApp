import { fetchData } from "./tmdb";
import {
  TmdbCreditsResponse,
  TmdbExternalIds,
  TmdbGenreListResponse,
  TmdbMovieDetail,
  TmdbPaginatedResponse,
  TmdbMovieResult,
  TmdbTVDetail,
  TmdbTVResult,
  TmdbVideosResponse,
  TmdbSearchMultiResult,
} from "@/types/tmdb";

// ── Lists ─────────────────────────────────────────────────────────────────────
export const getTrendingMovies = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbMovieResult>>(`/trending/movie/week?page=${page}`);

export const getTrendingTV = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbTVResult>>(`/trending/tv/week?page=${page}`);

export const getPopularMovies = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbMovieResult>>(`/movie/popular?page=${page}`);

export const getPopularTVShows = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbTVResult>>(`/tv/popular?page=${page}`);

export const getTopRatedMovies = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbMovieResult>>(`/movie/top_rated?page=${page}`);

export const getTopRatedTV = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbTVResult>>(`/tv/top_rated?page=${page}`);

export const getUpcomingMovies = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbMovieResult>>(`/movie/upcoming?page=${page}`);

export const getOnAirTV = (page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbTVResult>>(`/tv/on_the_air?page=${page}`);

// ── Details ───────────────────────────────────────────────────────────────────
export const getMovieDetails = (id: number) =>
  fetchData<TmdbMovieDetail>(`/movie/${id}`);

export const getMovieCredits = (id: number) =>
  fetchData<TmdbCreditsResponse>(`/movie/${id}/credits`);

export const getMovieVideos = (id: number) =>
  fetchData<TmdbVideosResponse>(`/movie/${id}/videos`);

export const getMovieExternalIds = (id: number) =>
  fetchData<TmdbExternalIds>(`/movie/${id}/external_ids`);

export const getTVDetails = (id: number) =>
  fetchData<TmdbTVDetail>(`/tv/${id}`);

export const getTVCredits = (id: number) =>
  fetchData<TmdbCreditsResponse>(`/tv/${id}/credits`);

export const getTVVideos = (id: number) =>
  fetchData<TmdbVideosResponse>(`/tv/${id}/videos`);

export const getTVExternalIds = (id: number) =>
  fetchData<TmdbExternalIds>(`/tv/${id}/external_ids`);

// ── Genres ────────────────────────────────────────────────────────────────────
export const getMovieGenres = () =>
  fetchData<TmdbGenreListResponse>("/genre/movie/list");

export const getTVGenres = () =>
  fetchData<TmdbGenreListResponse>("/genre/tv/list");

// ── Search ────────────────────────────────────────────────────────────────────
export const searchMulti = (query: string, page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbSearchMultiResult>>(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
  );

// ── Discover ──────────────────────────────────────────────────────────────────
export const discoverMovies = (genreId: number, page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbMovieResult>>(
    `/discover/movie?sort_by=popularity.desc&with_genres=${genreId}&page=${page}`,
  );

export const discoverTV = (genreId: number, page = 1) =>
  fetchData<TmdbPaginatedResponse<TmdbTVResult>>(
    `/discover/tv?sort_by=popularity.desc&with_genres=${genreId}&page=${page}`,
  );

interface DiscoverParams {
  sort_by: string;
  year: number | null;
  country: string | null;
  min_rating: number | null;
  genre: number | null;
  page: number;
}

const buildDiscoverParts = (params: DiscoverParams, yearKey: string): string[] => {
  const parts: string[] = [`sort_by=${params.sort_by}`];
  if (params.year) parts.push(`${yearKey}=${params.year}`);
  if (params.country) parts.push(`with_origin_country=${params.country}`);
  if (params.min_rating != null) {
    parts.push(`vote_average.gte=${params.min_rating}`);
    parts.push(`vote_count.gte=100`);
  }
  if (params.genre) parts.push(`with_genres=${params.genre}`);
  parts.push(`page=${params.page}`);
  return parts;
};

export const discoverMoviesAdvanced = (params: DiscoverParams) =>
  fetchData<TmdbPaginatedResponse<TmdbMovieResult>>(
    `/discover/movie?${buildDiscoverParts(params, "primary_release_year").join("&")}`,
  );

export const discoverTVAdvanced = (params: DiscoverParams) =>
  fetchData<TmdbPaginatedResponse<TmdbTVResult>>(
    `/discover/tv?${buildDiscoverParts(params, "first_air_date_year").join("&")}`,
  );

// ── Kinopoisk ─────────────────────────────────────────────────────────────────
export const getKinopoiskId = async (imdbId: string): Promise<number | null> => {
  const key = process.env.EXPO_PUBLIC_KP_KEY;
  if (!key || !imdbId) return null;
  try {
    const resp = await fetch(
      `https://api.kinopoisk.dev/v1.4/movie?externalId.imdb=${imdbId}&limit=1`,
      { headers: { "X-API-KEY": key } },
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return (data?.docs?.[0]?.id as number) ?? null;
  } catch (e) {
    if (__DEV__) console.warn("[KP]", e);
    return null;
  }
};
