import { Movie } from "./movie";

export interface WatchlistItem {
  movie: Movie;
  watched: boolean;
  addedAt: number;
}
