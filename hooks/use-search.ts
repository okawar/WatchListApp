import { useState } from "react";

import { searchMulti } from "@/services/movies";
import { Movie, TVShow } from "@/types/movie";

const normalizeResult = (item: any): Movie | null => {
  if (item.media_type === "movie") return { ...item, media_type: "movie" } as Movie;
  if (item.media_type === "tv") {
    return {
      id: item.id,
      title: item.name,
      overview: item.overview,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.first_air_date ?? "",
      media_type: "tv",
    };
  }
  return null;
};

export const useSearch = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await searchMulti(query);
      const normalized = (response.results ?? [])
        .map(normalizeResult)
        .filter((x: Movie | null): x is Movie => x !== null && !!x.poster_path);
      setMovies(normalized);
    } catch (e) {
      setError(String(e));
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
