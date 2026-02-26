import { useCallback, useEffect, useState } from "react";

import { discoverMoviesAdvanced, discoverTVAdvanced } from "@/services/movies";
import { Movie } from "@/types/movie";

const VISIBLE_STEP = 10;

const normalizeTV = (item: any): Movie => ({
  id: item.id,
  title: item.name,
  overview: item.overview,
  poster_path: item.poster_path,
  vote_average: item.vote_average,
  release_date: item.first_air_date ?? "",
});

export function useMediaDiscover(
  type: "movie" | "tv",
  sort_by: string,
  year: number | null,
  country: string | null,
  min_rating: number | null,
  genre: number | null,
  enabled: boolean,
) {
  const [allItems, setAllItems] = useState<Movie[]>([]);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const [fetchedPage, setFetchedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const params = { sort_by, year, country, min_rating, genre, page };
        const data =
          type === "movie"
            ? await discoverMoviesAdvanced(params)
            : await discoverTVAdvanced(params);

        const raw: any[] = data.results ?? [];
        const results: Movie[] = type === "tv" ? raw.map(normalizeTV) : raw;

        setAllItems((prev) => (page === 1 ? results : [...prev, ...results]));
        setTotalPages(data.total_pages ?? 1);
        setFetchedPage(page);
      } finally {
        setIsLoading(false);
      }
    },
    [type, sort_by, year, country, min_rating, genre],
  );

  useEffect(() => {
    if (!enabled) return;
    setAllItems([]);
    setVisibleCount(VISIBLE_STEP);
    setFetchedPage(0);
    fetchPage(1);
  }, [fetchPage, enabled]);

  const loadMore = async () => {
    if (!enabled) return;
    const nextVisible = visibleCount + VISIBLE_STEP;
    if (nextVisible > allItems.length && fetchedPage < totalPages) {
      await fetchPage(fetchedPage + 1);
    }
    setVisibleCount((v) => v + VISIBLE_STEP);
  };

  return {
    visibleItems: allItems.slice(0, visibleCount),
    isLoading,
    loadMore,
    hasMore: visibleCount < allItems.length || (fetchedPage > 0 && fetchedPage < totalPages),
  };
}
