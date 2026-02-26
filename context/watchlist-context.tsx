import { createContext, useContext, useState } from "react";

import { Movie } from "@/types/movie";

interface WatchlistContextValue {
  watchlist: Movie[];
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (movie: Movie) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  const isInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) =>
      isInWatchlist(movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, isInWatchlist, toggleWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return ctx;
}
