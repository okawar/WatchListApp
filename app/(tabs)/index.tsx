import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSearch } from "@/hooks/use-search";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

type ViewMode = "grid" | "list";

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { movies, error, isLoading, search } = useSearch();

  const isInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) =>
      isInWatchlist(movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const renderListItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => router.push({ pathname: "/movie/[id]", params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: IMAGE_BASE + item.poster_path }} style={styles.poster} />
      <View style={styles.movieInfo}>
        <ThemedText style={styles.movieTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.movieOverview} numberOfLines={2} ellipsizeMode="tail">
          {item.overview}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.addButton, isInWatchlist(item.id) && styles.addButtonActive]}
        onPress={() => toggleWatchlist(item)}
      >
        <ThemedText style={styles.addButtonText}>
          {isInWatchlist(item.id) ? "✓" : "+"}
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push({ pathname: "/movie/[id]", params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.gridPosterWrap}>
        <Image source={{ uri: IMAGE_BASE + item.poster_path }} style={styles.gridPoster} />
        <TouchableOpacity
          style={[styles.gridAddButton, isInWatchlist(item.id) && styles.addButtonActive]}
          onPress={() => toggleWatchlist(item)}
        >
          <ThemedText style={styles.gridAddButtonText}>
            {isInWatchlist(item.id) ? "✓" : "+"}
          </ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.gridTitle} numberOfLines={1}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Фильмы
      </ThemedText>

      <TextInput
        style={styles.input}
        value={query}
        placeholder="Поиск фильмов..."
        placeholderTextColor="#999"
        onChangeText={(text) => {
          setQuery(text);
          if (text.length > 0) search(text);
        }}
      />

      {/* Watchlist section — always visible */}
      <View style={styles.watchlistSection}>
        <ThemedText style={styles.sectionTitle}>Мой список</ThemedText>
        {watchlist.length === 0 ? (
          <ThemedText style={styles.emptyText}>Список пуст</ThemedText>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.watchlistRow}>
              {watchlist.map((movie) => (
                <View key={movie.id} style={styles.watchlistItem}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/movie/[id]", params: { id: movie.id } })}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: IMAGE_BASE + movie.poster_path }}
                      style={styles.watchlistPoster}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => toggleWatchlist(movie)}
                  >
                    <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.watchlistTitle} numberOfLines={2}>
                    {movie.title}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Search results */}
      {query.length > 0 && (
        <View style={styles.searchSection}>
          <View style={styles.searchHeader}>
            <ThemedText style={styles.sectionTitle}>Результаты</ThemedText>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === "grid" && styles.toggleButtonActive]}
                onPress={() => setViewMode("grid")}
              >
                <ThemedText style={styles.toggleIcon}>⊞</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
                onPress={() => setViewMode("list")}
              >
                <ThemedText style={styles.toggleIcon}>☰</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading && <ThemedText style={styles.statusText}>Загрузка...</ThemedText>}
          {error && <ThemedText style={styles.statusText}>{error}</ThemedText>}

          <FlatList
            data={movies}
            key={viewMode}
            keyExtractor={(item) => item.id.toString()}
            renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
            numColumns={viewMode === "grid" ? 4 : 1}
            columnWrapperStyle={viewMode === "grid" ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    width: "100%",
    marginBottom: 16,
    color: "#000",
  },

  // Watchlist
  watchlistSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
  },
  watchlistRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 4,
  },
  watchlistItem: {
    width: 100,
    position: "relative",
  },
  watchlistPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  watchlistTitle: {
    fontSize: 12,
    marginTop: 4,
  },

  // Search section
  searchSection: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  viewToggle: {
    flexDirection: "row",
    gap: 6,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#2ecc71",
  },
  toggleIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  statusText: {
    marginBottom: 8,
  },

  // List mode
  movieItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 10,
  },
  poster: {
    width: 44,
    height: 66,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  movieInfo: {
    flex: 1,
    gap: 3,
  },
  movieTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  movieOverview: {
    fontSize: 11,
    color: "#999",
    lineHeight: 15,
  },

  // Grid mode
  columnWrapper: {
    gap: 6,
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    alignItems: "center",
  },
  gridPosterWrap: {
    width: "100%",
    position: "relative",
  },
  gridPoster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  gridAddButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridAddButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 16,
  },
  gridTitle: {
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
    width: "100%",
  },

  // Shared
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonActive: {
    backgroundColor: "#2ecc71",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
  },
});
