import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import { useMediaDiscover } from "@/hooks/use-media-discover";
import { useMediaSection } from "@/hooks/use-media-section";
import { getTVGenres } from "@/services/movies";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

const CATEGORY_FILTERS = [
  { label: "Тренды", value: "trending" },
  { label: "Популярные", value: "popular" },
  { label: "Топ рейтинг", value: "top_rated" },
  { label: "В эфире", value: "on_air" },
] as const;

type TVCategory = (typeof CATEGORY_FILTERS)[number]["value"];

const SORT_OPTIONS = [
  { label: "Популярные", value: "popularity.desc" },
  { label: "По рейтингу", value: "vote_average.desc" },
  { label: "Новинки", value: "first_air_date.desc" },
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

function FilterChips<T extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T | null;
  onSelect: (v: T | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRowContent}
    >
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[styles.smallChip, active && styles.smallChipActive]}
            onPress={() => onSelect(active ? null : opt.value)}
          >
            <ThemedText style={[styles.smallChipText, active && styles.smallChipTextActive]}>
              {opt.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function TVScreen() {
  const router = useRouter();

  const [category, setCategory] = useState<TVCategory>("trending");
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
    getTVGenres().then((data) => setGenres(data.genres ?? []));
  }, []);

  const sectionData = useMediaSection("tv", category);
  const discoverData = useMediaDiscover(
    "tv",
    sortBy,
    year,
    country,
    minRating,
    genreId,
    hasFilter,
  );

  const { visibleItems, isLoading, loadMore, hasMore } = hasFilter ? discoverData : sectionData;

  const clearFilters = () => {
    setSortBy("popularity.desc");
    setYear(null);
    setCountry(null);
    setMinRating(null);
    setGenreId(null);
  };

  const renderCard = ({ item: show }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push({ pathname: "/movie/[id]", params: { id: show.id } })}
    >
      <View style={styles.posterWrap}>
        <Image source={{ uri: IMAGE_BASE + show.poster_path }} style={styles.poster} />
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
        <ThemedText style={styles.cardYear}>{show.release_date.slice(0, 4)}</ThemedText>
      ) : null}
    </TouchableOpacity>
  );

  const header = (
    <View>
      <ThemedText type="title" style={styles.title}>
        Сериалы
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

      {/* Toggle advanced filters */}
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

      {/* Advanced filter rows */}
      {showFilters && (
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterLabel}>Сортировка</ThemedText>
          <FilterChips
            options={SORT_OPTIONS}
            selected={sortBy}
            onSelect={(v) => setSortBy(v ?? "popularity.desc")}
          />

          <ThemedText style={[styles.filterLabel, styles.filterLabelTop]}>Год</ThemedText>
          <FilterChips
            options={YEARS.map((y) => ({ label: String(y), value: y }))}
            selected={year}
            onSelect={setYear}
          />

          <ThemedText style={[styles.filterLabel, styles.filterLabelTop]}>Страна</ThemedText>
          <FilterChips options={COUNTRIES} selected={country} onSelect={setCountry} />

          <ThemedText style={[styles.filterLabel, styles.filterLabelTop]}>Рейтинг</ThemedText>
          <FilterChips options={RATINGS} selected={minRating} onSelect={setMinRating} />

          <ThemedText style={[styles.filterLabel, styles.filterLabelTop]}>Жанр</ThemedText>
          <FilterChips
            options={genres.map((g) => ({ label: g.name, value: g.id }))}
            selected={genreId}
            onSelect={setGenreId}
          />

          {hasFilter && (
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
              <ThemedText style={styles.clearFiltersText}>Сбросить фильтры</ThemedText>
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

  // Category chips
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

  // Filter toggle
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

  // Filter section
  filterSection: { marginBottom: 10 },
  filterLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  filterLabelTop: { marginTop: 10 },
  filterRowContent: { gap: 6, paddingRight: 8 },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    flexShrink: 0,
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
    marginTop: 10,
  },
  clearFiltersText: { fontSize: 12, color: "#cc4444", fontWeight: "600" },

  // Grid
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

  // Footer
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
