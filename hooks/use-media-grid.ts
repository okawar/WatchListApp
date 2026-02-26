import { useCallback, useEffect, useState } from "react";

import { discoverMovies, discoverTV, getTrendingMovies, getTrendingTV } from "@/services/movies";
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

export function useMediaGrid(type: "movie" | "tv", genreId: number | null) {
  const [allItems, setAllItems] = useState<Movie[]>([]);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const [fetchedPage, setFetchedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const doFetch = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        let data;
        if (genreId === null) {
          data = type === "movie" ? await getTrendingMovies(page) : await getTrendingTV(page);
        } else {
          data = type === "movie" ? await discoverMovies(genreId, page) : await discoverTV(genreId, page);
        }
        const items: Movie[] =
          type === "tv" ? (data.results as TVShow[]).map(normalizeTV) : data.results;
        setAllItems((prev) => (page === 1 ? items : [...prev, ...items]));
        setTotalPages(data.total_pages ?? 1);
        setFetchedPage(page);
      } finally {
        setIsLoading(false);
      }
    },
    [type, genreId]
  );

  useEffect(() => {
    setAllItems([]);
    setVisibleCount(VISIBLE_STEP);
    setFetchedPage(0);
    doFetch(1);
  }, [doFetch]);

  const loadMore = async () => {
    const nextVisible = visibleCount + VISIBLE_STEP;
    if (nextVisible > allItems.length && fetchedPage < totalPages) {
      await doFetch(fetchedPage + 1);
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
