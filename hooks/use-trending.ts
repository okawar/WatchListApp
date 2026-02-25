import { getTrending } from "@/services/movies";
import { useEffect, useState } from "react";

export const useTrending = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const movies = await getTrending();
        setMovies(movies.results);
      } catch (e) {
        setError(String(e));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { isLoading, error, movies };
};
