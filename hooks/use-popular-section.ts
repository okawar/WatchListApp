import { useCallback, useEffect, useState } from "react";

import { getPopularMovies, getPopularTVShows } from "@/services/movies";
import { Movie, TVShow } from "@/types/movie";

const VISIBLE_STEP = 10;

const normalizeTV = (show: TVShow): Movie => ({
  id: show.id,
  title: show.name,
  overview: show.overview,
  poster_path: show.poster_path,
  vote_average: show.vote_average,
  release_date: show.first_air_date,
});

export function usePopularSection(type: "movie" | "tv") {
  const [allItems, setAllItems] = useState<Movie[]>([]);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const [fetchedPage, setFetchedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const fetcher = type === "movie" ? getPopularMovies : getPopularTVShows;
      const data = await fetcher(page);
      const normalized: Movie[] =
        type === "tv" ? data.results.map(normalizeTV) : data.results;
      setAllItems((prev) => (page === 1 ? normalized : [...prev, ...normalized]));
      setTotalPages(data.total_pages ?? 1);
      setFetchedPage(page);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const loadMore = async () => {
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
    hasMore:
      visibleCount < allItems.length ||
      (fetchedPage > 0 && fetchedPage < totalPages),
  };
}
