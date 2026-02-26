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
