import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import { useMediaGrid } from "@/hooks/use-media-grid";
import { getMovieGenres, getTVGenres } from "@/services/movies";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

interface Genre {
  id: number;
  name: string;
}

interface Props {
  type: "movie" | "tv";
  title: string;
}

export function MediaBrowser({ type, title }: Props) {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { visibleItems, isLoading, loadMore, hasMore } = useMediaGrid(type, selectedGenre);

  useEffect(() => {
    const fetchGenres = type === "movie" ? getMovieGenres : getTVGenres;
    fetchGenres().then((data) => setGenres(data.genres ?? []));
  }, [type]);

  const handleChip = (id: number | null) => {
    setSelectedGenre(id);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      {/* Genre filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          style={[styles.chip, selectedGenre === null && styles.chipActive]}
          onPress={() => handleChip(null)}
        >
          <ThemedText style={[styles.chipText, selectedGenre === null && styles.chipTextActive]}>
            В тренде
          </ThemedText>
        </TouchableOpacity>

        {genres.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.chip, selectedGenre === g.id && styles.chipActive]}
            onPress={() => handleChip(selectedGenre === g.id ? null : g.id)}
          >
            <ThemedText style={[styles.chipText, selectedGenre === g.id && styles.chipTextActive]}>
              {g.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {isLoading && visibleItems.length === 0 ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <>
            <View style={styles.grid}>
              {visibleItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({ pathname: "/movie/[id]", params: { id: item.id } })
                  }
                >
                  <View style={styles.posterWrap}>
                    <Image
                      source={{ uri: IMAGE_BASE + item.poster_path }}
                      style={styles.poster}
                    />
                    <TouchableOpacity
                      style={[styles.addBtn, isInWatchlist(item.id) && styles.addBtnActive]}
                      onPress={() => toggleWatchlist(item)}
                    >
                      <ThemedText style={styles.addBtnText}>
                        {isInWatchlist(item.id) ? "✓" : "+"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.cardRating}>
                    ★ {item.vote_average.toFixed(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.loadMoreText}>Загрузить ещё</ThemedText>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.bottomPad} />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 12,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
  },
  chipActive: {
    backgroundColor: "#2ecc71",
  },
  chipText: {
    fontSize: 13,
    color: "#aaa",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  loader: {
    marginTop: 60,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
  },
  posterWrap: {
    position: "relative",
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  addBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnActive: {
    backgroundColor: "#2ecc71",
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  cardRating: {
    fontSize: 12,
    color: "#f5c518",
    marginTop: 2,
    marginBottom: 8,
  },
  loadMoreBtn: {
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bottomPad: {
    height: 24,
  },
});
