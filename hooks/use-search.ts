import { searchMovies } from "@/services/movies";
import { Movie } from "@/types/movie";
import { useState } from "react";

export const useSearch = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchMovies(query);
        setMovies(response.results);
      } catch (e) {
        setError(String(e));
      } finally {
        setIsLoading(false);
      }
  };

  return { search, movies, isLoading, error };
};
