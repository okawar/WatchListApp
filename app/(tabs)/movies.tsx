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
import { useMovieDiscover } from "@/hooks/use-movie-discover";
import { useMediaSection } from "@/hooks/use-media-section";
import { getMovieGenres } from "@/services/movies";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

const FILTERS = [
  { label: "Тренды", value: "trending" },
  { label: "Популярные", value: "popular" },
  { label: "Топ рейтинг", value: "top_rated" },
  { label: "Скоро в кино", value: "upcoming" },
] as const;

type MovieCategory = (typeof FILTERS)[number]["value"];

const SORT_OPTIONS = [
  { label: "Популярные", value: "popularity.desc" },
  { label: "По рейтингу", value: "vote_average.desc" },
  { label: "Новинки", value: "release_date.desc" },
];

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2015, 2010, 2005, 2000];

const COUNTRIES = [
  { label: "США", value: "US" },
  { label: "Россия", value: "RU" },
  { label: "Великобритания", value: "GB" },
  { label: "Франция", value: "FR" },
  { label: "Германия", value: "DE" },
  { label: "Япония", value: "JP" },
  { label: "Корея", value: "KR" },
  { label: "Италия", value: "IT" },
  { label: "Индия", value: "IN" },
  { label: "Китай", value: "CN" },
];

const RATINGS = [
  { label: "5+", value: 5 },
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
];

interface Genre {
  id: number;
  name: string;
}

export default function MoviesScreen() {
  const router = useRouter();

  const [category, setCategory] = useState<MovieCategory>("trending");

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [year, setYear] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const hasFilter =
    sortBy !== "popularity.desc" ||
    year !== null ||
    country !== null ||
    minRating !== null ||
    genreId !== null;

  const activeFilterCount = [
    sortBy !== "popularity.desc",
    year !== null,
    country !== null,
    minRating !== null,
    genreId !== null,
  ].filter(Boolean).length;

  useEffect(() => {
    getMovieGenres().then((data) => setGenres(data.genres ?? []));
  }, []);

  const sectionData = useMediaSection("movie", category);
  const discoverData = useMovieDiscover(sortBy, year, country, minRating, genreId, hasFilter);

  const { visibleItems, isLoading, loadMore, hasMore } = hasFilter ? discoverData : sectionData;

  const clearFilters = () => {
    setSortBy("popularity.desc");
    setYear(null);
    setCountry(null);
    setMinRating(null);
    setGenreId(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Фильмы
      </ThemedText>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, !hasFilter && category === f.value && styles.chipActive]}
            onPress={() => setCategory(f.value)}
          >
            <ThemedText
              style={[styles.chipText, !hasFilter && category === f.value && styles.chipTextActive]}
            >
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Toggle advanced filters */}
      <View style={styles.filterToggleRow}>
        <TouchableOpacity
          style={[styles.filterToggleBtn, (showFilters || hasFilter) && styles.filterToggleBtnActive]}
          onPress={() => setShowFilters((v) => !v)}
        >
          <ThemedText
            style={[
              styles.filterToggleText,
              (showFilters || hasFilter) && styles.filterToggleTextActive,
            ]}
          >
            {activeFilterCount > 0 ? `Фильтры (${activeFilterCount}) ` : "Фильтры "}
            {showFilters ? "▲" : "▼"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Advanced filters section */}
      {showFilters && (
        <View style={styles.filterSection}>
          {/* Sort */}
          <View style={styles.filterRow}>
            <ThemedText style={styles.filterLabel}>Сортировка</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowContent}
            >
              {SORT_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.smallChip, sortBy === s.value && styles.smallChipActive]}
                  onPress={() => setSortBy(s.value)}
                >
                  <ThemedText
                    style={[styles.smallChipText, sortBy === s.value && styles.smallChipTextActive]}
                  >
                    {s.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Year */}
          <View style={styles.filterRow}>
            <ThemedText style={styles.filterLabel}>Год</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowContent}
            >
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.smallChip, year === y && styles.smallChipActive]}
                  onPress={() => setYear(year === y ? null : y)}
                >
                  <ThemedText
                    style={[styles.smallChipText, year === y && styles.smallChipTextActive]}
                  >
                    {y}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Country */}
          <View style={styles.filterRow}>
            <ThemedText style={styles.filterLabel}>Страна</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowContent}
            >
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.smallChip, country === c.value && styles.smallChipActive]}
                  onPress={() => setCountry(country === c.value ? null : c.value)}
                >
                  <ThemedText
                    style={[
                      styles.smallChipText,
                      country === c.value && styles.smallChipTextActive,
                    ]}
                  >
                    {c.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Rating */}
          <View style={styles.filterRow}>
            <ThemedText style={styles.filterLabel}>Рейтинг</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowContent}
            >
              {RATINGS.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.smallChip, minRating === r.value && styles.smallChipActive]}
                  onPress={() => setMinRating(minRating === r.value ? null : r.value)}
                >
                  <ThemedText
                    style={[
                      styles.smallChipText,
                      minRating === r.value && styles.smallChipTextActive,
                    ]}
                  >
                    {r.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Genre */}
          <View style={styles.filterRow}>
            <ThemedText style={styles.filterLabel}>Жанр</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowContent}
            >
              {genres.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.smallChip, genreId === g.id && styles.smallChipActive]}
                  onPress={() => setGenreId(genreId === g.id ? null : g.id)}
                >
                  <ThemedText
                    style={[styles.smallChipText, genreId === g.id && styles.smallChipTextActive]}
                  >
                    {g.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {hasFilter && (
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
              <ThemedText style={styles.clearFiltersText}>Сбросить фильтры</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Grid */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.gridScroll}>
        {isLoading && visibleItems.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.grid}>
              {visibleItems.map((movie: Movie) => (
                <TouchableOpacity
                  key={movie.id}
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({ pathname: "/movie/[id]", params: { id: movie.id } })
                  }
                >
                  <View style={styles.posterWrap}>
                    <Image
                      source={{ uri: IMAGE_BASE + movie.poster_path }}
                      style={styles.poster}
                    />
                    <TouchableOpacity
                      style={[styles.addBtn, isInWatchlist(movie.id) && styles.addBtnActive]}
                      onPress={() => toggleWatchlist(movie)}
                    >
                      <ThemedText style={styles.addBtnText}>
                        {isInWatchlist(movie.id) ? "✓" : "+"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.cardTitle} numberOfLines={2}>
                    {movie.title}
                  </ThemedText>
                  {movie.release_date ? (
                    <ThemedText style={styles.cardYear}>
                      {movie.release_date.slice(0, 4)}
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
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  title: { marginBottom: 12 },

  // Category chips
  filtersScroll: { marginBottom: 8, flexGrow: 0 },
  filtersContent: { gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#333" },
  chipActive: { backgroundColor: "#2ecc71" },
  chipText: { fontSize: 14, color: "#ccc" },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  // Toggle button
  filterToggleRow: { marginBottom: 8 },
  filterToggleBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
  },
  filterToggleBtnActive: { backgroundColor: "#1a4a2a", borderColor: "#2ecc71" },
  filterToggleText: { fontSize: 13, color: "#aaa" },
  filterToggleTextActive: { color: "#2ecc71", fontWeight: "600" },

  // Advanced filter section
  filterSection: { marginBottom: 8 },
  filterRow: { marginBottom: 8 },
  filterLabel: { fontSize: 11, color: "#888", fontWeight: "600", marginBottom: 4, textTransform: "uppercase" },
  filterRowContent: { gap: 6, paddingRight: 8 },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  smallChipActive: { backgroundColor: "#1a4a2a", borderColor: "#2ecc71" },
  smallChipText: { fontSize: 12, color: "#bbb" },
  smallChipTextActive: { color: "#2ecc71", fontWeight: "600" },
  clearFiltersBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#3a2020",
    borderWidth: 1,
    borderColor: "#cc4444",
    marginTop: 2,
  },
  clearFiltersText: { fontSize: 12, color: "#cc4444", fontWeight: "600" },

  // Grid
  gridScroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingBottom: 8 },
  card: { width: "47%" },
  posterWrap: { position: "relative" },
  poster: { width: "100%", aspectRatio: 2 / 3, borderRadius: 10, backgroundColor: "#333" },
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
  addBtnActive: { backgroundColor: "#2ecc71" },
  addBtnText: { fontSize: 16, fontWeight: "bold", color: "#fff", lineHeight: 20 },
  cardTitle: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  cardYear: { fontSize: 11, color: "#888", marginTop: 2 },
  loadMoreBtn: {
    marginVertical: 12,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },
  loadMoreText: { fontSize: 14, fontWeight: "600" },
});
