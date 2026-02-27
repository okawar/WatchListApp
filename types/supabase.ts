// Supabase Database types

export interface WatchlistRow {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  overview: string | null;
  vote_average: number | null;
  release_date: string | null;
  added_at: string;
}

export type WatchlistInsert = Omit<WatchlistRow, "id" | "added_at">;

export interface Database {
  public: {
    Tables: {
      watchlist: {
        Row: WatchlistRow;
        Insert: WatchlistInsert;
        Update: Partial<Omit<WatchlistRow, "id" | "user_id" | "added_at">>;
      };
    };
  };
}
