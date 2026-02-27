import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { supabase } from "@/services/supabase";
import { Movie } from "@/types/movie";
import { WatchlistInsert, WatchlistRow } from "@/types/supabase";

const STORAGE_KEY = "@watchlist";

interface WatchlistContextValue {
  watchlist: Movie[];
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (movie: Movie) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

// ── Supabase helpers ──────────────────────────────────────────────────────────

const rowToMovie = (row: WatchlistRow): Movie => ({
  id: row.tmdb_id,
  title: row.title,
  overview: row.overview ?? "",
  poster_path: row.poster_path,
  vote_average: row.vote_average ?? 0,
  release_date: row.release_date ?? "",
  media_type: row.media_type,
});

async function fetchSupabaseWatchlist(userId: string): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    if (__DEV__) console.error("[Watchlist] fetch error:", error.message);
    return [];
  }
  return (data ?? []).map(rowToMovie);
}

async function upsertSupabase(movie: Movie, userId: string): Promise<void> {
  const row: WatchlistInsert = {
    user_id: userId,
    tmdb_id: movie.id,
    media_type: movie.media_type ?? "movie",
    title: movie.title,
    poster_path: movie.poster_path,
    overview: movie.overview,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
  };

  const { error } = await supabase
    .from("watchlist")
    .upsert(row, { onConflict: "user_id,tmdb_id" });

  if (error && __DEV__) console.error("[Watchlist] upsert error:", error.message);
}

async function deleteSupabase(tmdbId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId);

  if (error && __DEV__) console.error("[Watchlist] delete error:", error.message);
}

// ─────────────────────────────────────────────────────────────────────────────

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const loaded = useRef(false);

  // Subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load watchlist when userId changes (login / logout / startup)
  useEffect(() => {
    loaded.current = false;

    if (userId) {
      // Logged in: load from Supabase + migrate any local items
      fetchSupabaseWatchlist(userId).then(async (remote) => {
        const localJson = await AsyncStorage.getItem(STORAGE_KEY);
        const local: Movie[] = localJson ? JSON.parse(localJson) : [];

        const remoteIds = new Set(remote.map((m) => m.id));
        const toMigrate = local.filter((m) => !remoteIds.has(m.id));

        if (toMigrate.length > 0) {
          await Promise.all(toMigrate.map((m) => upsertSupabase(m, userId)));
          await AsyncStorage.removeItem(STORAGE_KEY);
          if (__DEV__) console.log(`[Watchlist] migrated ${toMigrate.length} local items`);
        }

        setWatchlist([...toMigrate, ...remote]);
        loaded.current = true;
      });
    } else {
      // Guest: clear Supabase data and load from AsyncStorage
      setWatchlist([]);
      AsyncStorage.getItem(STORAGE_KEY)
        .then((json) => {
          if (json) setWatchlist(JSON.parse(json));
        })
        .catch((e) => {
          if (__DEV__) console.error("[Watchlist] AsyncStorage load error:", e);
        })
        .finally(() => {
          loaded.current = true;
        });
    }
  }, [userId]);

  // Persist to AsyncStorage for guest mode only
  useEffect(() => {
    if (!loaded.current || userId) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist)).catch((e) => {
      if (__DEV__) console.error("[Watchlist] AsyncStorage save error:", e);
    });
  }, [watchlist, userId]);

  const isInWatchlist = (id: number): boolean => watchlist.some((m) => m.id === id);

  const toggleWatchlist = (movie: Movie): void => {
    const adding = !isInWatchlist(movie.id);
    setWatchlist((prev) =>
      adding ? [...prev, movie] : prev.filter((m) => m.id !== movie.id),
    );
    if (userId) {
      if (adding) upsertSupabase(movie, userId);
      else deleteSupabase(movie.id, userId);
    }
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
