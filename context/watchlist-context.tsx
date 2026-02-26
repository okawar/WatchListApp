import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { Movie } from "@/types/movie";

const STORAGE_KEY = "@watchlist";

interface WatchlistContextValue {
  watchlist: Movie[];
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (movie: Movie) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const loaded = useRef(false);

  // Load persisted watchlist on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setWatchlist(JSON.parse(json));
      })
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  // Persist whenever watchlist changes (skip initial empty state before load)
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const isInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) =>
      isInWatchlist(movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie],
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
