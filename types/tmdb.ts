// TMDB API v3 — raw response types

export interface TmdbMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  media_type?: "movie";
}

export interface TmdbTVResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  origin_country: string[];
  original_name: string;
  media_type?: "tv";
}

export interface TmdbPersonResult {
  id: number;
  name: string;
  media_type: "person";
  popularity: number;
  profile_path: string | null;
}

export type TmdbSearchMultiResult = TmdbMovieResult | TmdbTVResult | TmdbPersonResult;

export interface TmdbPaginatedResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbGenreListResponse {
  genres: TmdbGenre[];
}

export interface TmdbVideoResult {
  id: string;
  key: string;
  name: string;
  site: "YouTube" | "Vimeo" | string;
  type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind the Scenes" | string;
  official: boolean;
  published_at: string;
}

export interface TmdbVideosResponse {
  results: TmdbVideoResult[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbCreditsResponse {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbExternalIds {
  imdb_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

export interface TmdbMovieDetail extends TmdbMovieResult {
  runtime: number | null;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  genres: TmdbGenre[];
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  belongs_to_collection: { id: number; name: string; poster_path: string | null } | null;
}

export interface TmdbTVDetail extends TmdbTVResult {
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  tagline: string;
  genres: TmdbGenre[];
  created_by: Array<{ id: number; name: string }>;
  networks: Array<{ id: number; name: string; logo_path: string | null }>;
  seasons: Array<{
    id: number;
    name: string;
    episode_count: number;
    season_number: number;
    poster_path: string | null;
    air_date: string;
  }>;
}
