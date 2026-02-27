import { useScrollToTop } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FilterSelect } from "@/components/filter-select";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import { useMediaDiscover } from "@/hooks/use-media-discover";
import { useMediaSection } from "@/hooks/use-media-section";
import { getTVGenres } from "@/services/movies";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

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
  { label: "Испания", value: "ES" },
  { label: "Мексика", value: "MX" },
  { label: "Канада", value: "CA" },
  { label: "Австралия", value: "AU" },
  { label: "Швеция", value: "SE" },
  { label: "Дания", value: "DK" },
  { label: "Норвегия", value: "NO" },
  { label: "Польша", value: "PL" },
  { label: "Турция", value: "TR" },
  { label: "Бразилия", value: "BR" },
];

const RATINGS = [
  { label: "5+", value: 5 },
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
  { label: "9+", value: 9 },
];

export default function TVScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  const [category, setCategory] = useState<TVCategory>("trending");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [yearText, setYearText] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [genres, setGenres] = useState<{ label: string; value: number }[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const effectiveSortBy = sortBy ?? "popularity.desc";

  const hasFilter =
    sortBy !== null || year !== null || country !== null || minRating !== null || genreId !== null;

  const activeFilterCount = [sortBy, year, country, minRating, genreId].filter(
    (v) => v !== null,
  ).length;

  useEffect(() => {
    setGenresLoading(true);
    getTVGenres()
      .then((data) =>
        setGenres((data.genres ?? []).map((g: any) => ({ label: g.name, value: g.id }))),
      )
      .finally(() => setGenresLoading(false));
  }, []);

  const onYearChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setYearText(digits);
    const parsed = parseInt(digits, 10);
    if (digits.length === 4 && parsed >= 1900 && parsed <= 2030) {
      setYear(parsed);
    } else {
      setYear(null);
    }
  };

  const sectionData = useMediaSection("tv", category);
  const discoverData = useMediaDiscover(
    "tv",
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
    setYearText("");
    setYear(null);
    setCountry(null);
    setMinRating(null);
    setGenreId(null);
  };

  const navigate = (show: Movie) =>
    router.push({
      pathname: "/movie/[id]",
      params: { id: show.id, type: show.media_type ?? "tv" },
    });

  const renderCard = ({ item: show }: { item: Movie }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => navigate(show)}>
      <View style={styles.posterWrap}>
        <Image
          source={show.poster_path ? { uri: IMAGE_BASE + show.poster_path } : null}
          style={styles.poster}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <TouchableOpacity
          style={[styles.addBtn, isInWatchlist(show.id) && styles.addBtnActive]}
          onPress={() => toggleWatchlist(show)}
        >
          <Text style={styles.addBtnText}>{isInWatchlist(show.id) ? "✓" : "+"}</Text>
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
            <Text
              style={[styles.chipText, !hasFilter && category === f.value && styles.chipTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.filterToggleBtn, (showFilters || hasFilter) && styles.filterToggleBtnActive]}
        onPress={() => setShowFilters((v) => !v)}
      >
        <Text
          style={[
            styles.filterToggleText,
            (showFilters || hasFilter) && styles.filterToggleTextActive,
          ]}
        >
          {activeFilterCount > 0 ? `Фильтры (${activeFilterCount}) ` : "Фильтры "}
          {showFilters ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.selectRow}>
            <FilterSelect
              label="Сортировка"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
            />
            <View style={[styles.yearBox, year !== null && styles.yearBoxActive]}>
              <TextInput
                style={[styles.yearInput, year !== null && styles.yearInputActive]}
                placeholder="Год"
                placeholderTextColor={year !== null ? "#1aa84a" : "#666"}
                keyboardType="numeric"
                maxLength={4}
                value={yearText}
                onChangeText={onYearChange}
                returnKeyType="done"
              />
              {yearText.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setYearText("");
                    setYear(null);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.yearClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
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
              label={genresLoading ? "Жанр (загрузка...)" : "Жанр"}
              value={genreId}
              options={genres}
              onChange={setGenreId}
            />
          </View>
          {hasFilter && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Сбросить все фильтры</Text>
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
        ref={listRef}
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
                <Text style={styles.loadMoreText}>Загрузить ещё</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 16 }} />
          </View>
        }
        onScrollBeginDrag={() => showFilters && setShowFilters(false)}
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
  chipsContent: { gap: 6, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#333",
    flexShrink: 0,
  },
  chipActive: { backgroundColor: "#2ecc71" },
  chipText: { fontSize: 13, color: "#ccc", fontWeight: "600", lineHeight: 18 },
  chipTextActive: { color: "#fff", fontWeight: "700" },

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
  filterToggleText: { fontSize: 13, color: "#aaa", lineHeight: 18 },
  filterToggleTextActive: { color: "#2ecc71", fontWeight: "600" },

  filterSection: { marginBottom: 10, gap: 8 },
  selectRow: { flexDirection: "row", gap: 8 },
  selectRowSingle: { flexDirection: "row" },

  yearBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    flex: 1,
    gap: 4,
  },
  yearBoxActive: { backgroundColor: "#1a4a2a", borderColor: "#2ecc71" },
  yearInput: { fontSize: 14, color: "#ccc", flex: 1, padding: 0, lineHeight: 18 },
  yearInputActive: { color: "#2ecc71", fontWeight: "600" },
  yearClear: { fontSize: 11, color: "#666" },

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
  loadMoreText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
