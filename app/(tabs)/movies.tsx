import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { FilterSelect } from "@/components/filter-select";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import { useMediaDiscover } from "@/hooks/use-media-discover";
import { useMediaSection } from "@/hooks/use-media-section";
import { getMovieGenres } from "@/services/movies";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

const CATEGORY_FILTERS = [
  { label: "Тренды", value: "trending" },
  { label: "Популярные", value: "popular" },
  { label: "Топ рейтинг", value: "top_rated" },
  { label: "Скоро в кино", value: "upcoming" },
] as const;

type MovieCategory = (typeof CATEGORY_FILTERS)[number]["value"];

const SORT_OPTIONS = [
  { label: "Популярные", value: "popularity.desc" },
  { label: "По рейтингу", value: "vote_average.desc" },
  { label: "Новинки", value: "release_date.desc" },
];

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2015, 2010, 2005, 2000].map(
  (y) => ({ label: String(y), value: y }),
);

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

export default function MoviesScreen() {
  const router = useRouter();

  const [category, setCategory] = useState<MovieCategory>("trending");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [genres, setGenres] = useState<{ label: string; value: number }[]>([]);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const effectiveSortBy = sortBy ?? "popularity.desc";

  const hasFilter =
    sortBy !== null || year !== null || country !== null || minRating !== null || genreId !== null;

  const activeFilterCount = [sortBy, year, country, minRating, genreId].filter(
    (v) => v !== null,
  ).length;

  useEffect(() => {
    getMovieGenres().then((data) =>
      setGenres((data.genres ?? []).map((g: any) => ({ label: g.name, value: g.id }))),
    );
  }, []);

  const sectionData = useMediaSection("movie", category);
  const discoverData = useMediaDiscover(
    "movie",
    effectiveSortBy,
    year,
    country,
    minRating,
    genreId,
    hasFilter,
  );

  const { visibleItems, isLoading, loadMore, hasMore } = hasFilter ? discoverData : sectionData;

  const clearFilters = () => {
    setSortBy(null);
    setYear(null);
    setCountry(null);
    setMinRating(null);
    setGenreId(null);
  };

  const onScrollBeginDrag = () => {
    if (showFilters) setShowFilters(false);
  };

  const navigate = (movie: Movie) =>
    router.push({
      pathname: "/movie/[id]",
      params: { id: movie.id, type: movie.media_type ?? "movie" },
    });

  const renderCard = ({ item: movie }: { item: Movie }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => navigate(movie)}>
      <View style={styles.posterWrap}>
        <Image
          source={{ uri: IMAGE_BASE + movie.poster_path }}
          style={styles.poster}
          contentFit="cover"
          transition={200}
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
        <ThemedText style={styles.cardYear}>{movie.release_date.slice(0, 4)}</ThemedText>
      ) : null}
    </TouchableOpacity>
  );

  const header = (
    <View>
      <ThemedText type="title" style={styles.title}>
        Фильмы
      </ThemedText>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORY_FILTERS.map((f) => (
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

      {/* Filter toggle */}
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

      {/* Filter selects */}
      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.selectRow}>
            <FilterSelect
              label="Сортировка"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
            />
            <FilterSelect label="Год" value={year} options={YEARS} onChange={setYear} />
          </View>
          <View style={styles.selectRow}>
            <FilterSelect
              label="Страна"
              value={country}
              options={COUNTRIES}
              onChange={setCountry}
            />
            <FilterSelect
              label="Рейтинг"
              value={minRating}
              options={RATINGS}
              onChange={setMinRating}
            />
          </View>
          <View style={styles.selectRowSingle}>
            <FilterSelect
              label="Жанр"
              value={genreId}
              options={genres}
              onChange={setGenreId}
            />
          </View>
          {hasFilter && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <ThemedText style={styles.clearBtnText}>Сбросить все фильтры</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading && visibleItems.length === 0 && (
        <ActivityIndicator style={{ marginTop: 40 }} />
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={visibleItems}
        key={category}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderCard}
        ListHeaderComponent={header}
        ListFooterComponent={
          <View style={styles.footer}>
            {isLoading && visibleItems.length > 0 && <ActivityIndicator />}
            {!isLoading && hasMore && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                <ThemedText style={styles.loadMoreText}>Загрузить ещё</ThemedText>
              </TouchableOpacity>
            )}
            <View style={{ height: 16 }} />
          </View>
        }
        onScrollBeginDrag={onScrollBeginDrag}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  title: { marginBottom: 12 },

  chipsScroll: { flexGrow: 0, marginBottom: 8 },
  chipsContent: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#333",
    flexShrink: 0,
  },
  chipActive: { backgroundColor: "#2ecc71" },
  chipText: { fontSize: 14, color: "#ccc" },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  filterToggleBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 10,
  },
  filterToggleBtnActive: { backgroundColor: "#1a4a2a", borderColor: "#2ecc71" },
  filterToggleText: { fontSize: 13, color: "#aaa" },
  filterToggleTextActive: { color: "#2ecc71", fontWeight: "600" },

  filterSection: { marginBottom: 10, gap: 8 },
  selectRow: { flexDirection: "row", gap: 8 },
  selectRowSingle: { flexDirection: "row" },
  clearBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#3a2020",
    borderWidth: 1,
    borderColor: "#cc4444",
  },
  clearBtnText: { fontSize: 12, color: "#cc4444", fontWeight: "600" },

  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1 },
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

  footer: { paddingTop: 4 },
  loadMoreBtn: {
    marginVertical: 8,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },
  loadMoreText: { fontSize: 14, fontWeight: "600" },
});
