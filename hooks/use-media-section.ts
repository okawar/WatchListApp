import { useCallback, useEffect, useState } from "react";

import {
  getOnAirTV,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTV,
  getTrendingMovies,
  getTrendingTV,
  getUpcomingMovies,
} from "@/services/movies";
import { TmdbMovieResult, TmdbPaginatedResponse, TmdbTVResult } from "@/types/tmdb";
import { Movie } from "@/types/movie";

const VISIBLE_STEP = 10;

type MovieFetcher = (page: number) => Promise<TmdbPaginatedResponse<TmdbMovieResult>>;
type TVFetcher = (page: number) => Promise<TmdbPaginatedResponse<TmdbTVResult>>;
type Fetcher = MovieFetcher | TVFetcher;

const FETCHERS: Record<"movie" | "tv", Record<string, Fetcher>> = {
  movie: {
    trending: getTrendingMovies,
    popular: getPopularMovies,
    top_rated: getTopRatedMovies,
    upcoming: getUpcomingMovies,
  },
  tv: {
    trending: getTrendingTV,
    popular: getPopularTVShows,
    top_rated: getTopRatedTV,
    on_air: getOnAirTV,
  },
};

const normalizeTV = (show: TmdbTVResult): Movie => ({
  id: show.id,
  title: show.name,
  overview: show.overview,
  poster_path: show.poster_path,
  vote_average: show.vote_average,
  release_date: show.first_air_date,
  media_type: "tv",
  popularity: show.popularity,
});

const normalizeMovie = (m: TmdbMovieResult): Movie => ({
  id: m.id,
  title: m.title,
  overview: m.overview,
  poster_path: m.poster_path,
  vote_average: m.vote_average,
  release_date: m.release_date,
  media_type: "movie",
  popularity: m.popularity,
});

export function useMediaSection(type: "movie" | "tv", category: string) {
  const [allItems, setAllItems] = useState<Movie[]>([]);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const [fetchedPage, setFetchedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const fetcher = FETCHERS[type]?.[category];
        if (!fetcher) return;
        const data = await (fetcher as Fetcher)(page);
        const results = data.results ?? [];
        const normalized: Movie[] =
          type === "tv"
            ? (results as TmdbTVResult[]).map(normalizeTV)
            : (results as TmdbMovieResult[]).map(normalizeMovie);
        setAllItems((prev) => (page === 1 ? normalized : [...prev, ...normalized]));
        setTotalPages(data.total_pages ?? 1);
        setFetchedPage(page);
      } catch (e) {
        if (__DEV__) console.error("[useMediaSection]", type, category, e);
      } finally {
        setIsLoading(false);
      }
    },
    [type, category],
  );

  useEffect(() => {
    setAllItems([]);
    setVisibleCount(VISIBLE_STEP);
    setFetchedPage(0);
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
    hasMore: visibleCount < allItems.length || (fetchedPage > 0 && fetchedPage < totalPages),
  };
}
