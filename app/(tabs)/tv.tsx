import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useMediaSection } from "@/hooks/use-media-section";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

const FILTERS = [
  { label: "Тренды", value: "trending" },
  { label: "Популярные", value: "popular" },
  { label: "Топ рейтинг", value: "top_rated" },
  { label: "В эфире", value: "on_air" },
] as const;

type TVCategory = (typeof FILTERS)[number]["value"];

export default function TVScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<TVCategory>("trending");
  const { visibleItems, isLoading, loadMore, hasMore } = useMediaSection("tv", category);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Сериалы
      </ThemedText>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, category === f.value && styles.chipActive]}
            onPress={() => setCategory(f.value)}
          >
            <ThemedText style={[styles.chipText, category === f.value && styles.chipTextActive]}>
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoading && visibleItems.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.grid}>
              {visibleItems.map((show: Movie) => (
                <TouchableOpacity
                  key={show.id}
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({ pathname: "/movie/[id]", params: { id: show.id } })
                  }
                >
                  <View style={styles.posterWrap}>
                    <Image
                      source={{ uri: IMAGE_BASE + show.poster_path }}
                      style={styles.poster}
                    />
                    <TouchableOpacity
                      style={[styles.addBtn, isInWatchlist(show.id) && styles.addBtnActive]}
                      onPress={() => toggleWatchlist(show)}
                    >
                      <ThemedText style={styles.addBtnText}>
                        {isInWatchlist(show.id) ? "✓" : "+"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.cardTitle} numberOfLines={2}>
                    {show.title}
                  </ThemedText>
                  {show.release_date ? (
                    <ThemedText style={styles.cardYear}>
                      {show.release_date.slice(0, 4)}
                    </ThemedText>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            {isLoading && <ActivityIndicator style={{ marginVertical: 16 }} />}

            {!isLoading && hasMore && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                <ThemedText style={styles.loadMoreText}>Загрузить ещё</ThemedText>
              </TouchableOpacity>
            )}
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
  filtersScroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  filtersContent: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  chipActive: {
    backgroundColor: "#2ecc71",
  },
  chipText: {
    fontSize: 14,
    color: "#ccc",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 8,
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
  cardYear: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  loadMoreBtn: {
    marginVertical: 12,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
