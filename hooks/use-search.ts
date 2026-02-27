import { useState } from "react";

import { searchMulti } from "@/services/movies";
import { TmdbMovieResult, TmdbTVResult, TmdbSearchMultiResult } from "@/types/tmdb";
import { Movie } from "@/types/movie";

const normalizeResult = (item: TmdbSearchMultiResult): Movie | null => {
  if (item.media_type === "person") return null;

  if (item.media_type === "movie") {
    const m = item as TmdbMovieResult;
    if (!m.poster_path) return null;
    return {
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path,
      vote_average: m.vote_average,
      release_date: m.release_date ?? "",
      media_type: "movie",
      popularity: m.popularity,
    };
  }

  if (item.media_type === "tv") {
    const t = item as TmdbTVResult;
    if (!t.poster_path) return null;
    return {
      id: t.id,
      title: t.name,
      overview: t.overview,
      poster_path: t.poster_path,
      vote_average: t.vote_average,
      release_date: t.first_air_date ?? "",
      media_type: "tv",
      popularity: t.popularity,
    };
  }

  return null;
};

export const useSearch = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await searchMulti(query);
      const normalized = (response.results ?? [])
        .map(normalizeResult)
        .filter((x): x is Movie => x !== null)
        // Sort by popularity — popular titles always come first
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
      setMovies(normalized);
    } catch (e) {
      if (__DEV__) console.error("[useSearch]", e);
      setError("Ошибка поиска");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMovies([]);
    setError(null);
  };

  return { search, reset, movies, isLoading, error };
};
