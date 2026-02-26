import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { supabase } from "@/services/supabase";
import { Movie } from "@/types/movie";

const STORAGE_KEY = "@watchlist";

interface WatchlistContextValue {
  watchlist: Movie[];
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (movie: Movie) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

// ── Supabase helpers ──────────────────────────────────────────────────────────

const rowToMovie = (row: any): Movie => ({
  id: row.tmdb_id,
  title: row.title,
  overview: row.overview ?? "",
  poster_path: row.poster_path ?? "",
  vote_average: row.vote_average ?? 0,
  release_date: row.release_date ?? "",
  media_type: row.media_type as "movie" | "tv",
});

async function fetchSupabaseWatchlist(userId: string): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToMovie);
}

async function upsertSupabase(movie: Movie, userId: string) {
  await supabase.from("watchlist").upsert(
    {
      user_id: userId,
      tmdb_id: movie.id,
      media_type: movie.media_type ?? "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    },
    { onConflict: "user_id,tmdb_id" },
  );
}

async function deleteSupabase(tmdbId: number, userId: string) {
  await supabase.from("watchlist").delete().eq("user_id", userId).eq("tmdb_id", tmdbId);
}

// ─────────────────────────────────────────────────────────────────────────────

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const loaded = useRef(false);

  // Track auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When userId changes — load watchlist from appropriate source
  useEffect(() => {
    if (userId) {
      // Logged in: load from Supabase, also migrate any local items
      fetchSupabaseWatchlist(userId).then(async (remote) => {
        const localJson = await AsyncStorage.getItem(STORAGE_KEY);
        const local: Movie[] = localJson ? JSON.parse(localJson) : [];

        // Merge: upload local items not yet in Supabase
        const remoteIds = new Set(remote.map((m) => m.id));
        const toMigrate = local.filter((m) => !remoteIds.has(m.id));
        for (const m of toMigrate) {
          await upsertSupabase(m, userId);
        }

        const merged = [
          ...toMigrate,
          ...remote.filter((m) => !toMigrate.some((l) => l.id === m.id)),
        ];

        setWatchlist(merged.length > 0 ? merged : remote);
        await AsyncStorage.removeItem(STORAGE_KEY); // clean up local storage
        loaded.current = true;
      });
    } else {
      // Guest / not logged in: load from AsyncStorage
      AsyncStorage.getItem(STORAGE_KEY)
        .then((json) => {
          if (json) setWatchlist(JSON.parse(json));
        })
        .finally(() => {
          loaded.current = true;
        });
    }
  }, [userId]);

  // Persist for guest mode
  useEffect(() => {
    if (!loaded.current || userId) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist, userId]);

  const isInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  const toggleWatchlist = (movie: Movie) => {
    const adding = !isInWatchlist(movie.id);
    setWatchlist((prev) =>
      adding ? [...prev, movie] : prev.filter((m) => m.id !== movie.id),
    );
    if (userId) {
      if (adding) {
        upsertSupabase(movie, userId);
      } else {
        deleteSupabase(movie.id, userId);
      }
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
