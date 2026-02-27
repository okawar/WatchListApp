import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import { useSearch } from "@/hooks/use-search";
import { Movie } from "@/types/movie";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

type ViewMode = "grid" | "list";

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { movies, error, isLoading, search, reset } = useSearch();
  const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist();

  const renderListItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => router.push({ pathname: "/movie/[id]", params: { id: item.id, type: item.media_type ?? "movie" } })}
      activeOpacity={0.7}
    >
      <Image
        source={item.poster_path ? { uri: IMAGE_BASE + item.poster_path } : null}
        style={styles.poster}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
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
      onPress={() => router.push({ pathname: "/movie/[id]", params: { id: item.id, type: item.media_type ?? "movie" } })}
      activeOpacity={0.7}
    >
      <View style={styles.gridPosterWrap}>
        <Image
          source={item.poster_path ? { uri: IMAGE_BASE + item.poster_path } : null}
          style={styles.gridPoster}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
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
        Главная
      </ThemedText>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={query}
          placeholder="Поиск фильмов и сериалов..."
          placeholderTextColor="#999"
          onChangeText={(text) => {
            setQuery(text);
            if (text.length > 0) search(text);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setQuery("");
              reset();
            }}
          >
            <ThemedText style={styles.clearBtnText}>✕</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {query.length === 0 ? (
        // ── Watchlist ──
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.sectionTitle}>Мой список</ThemedText>
          {watchlist.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Список пуст. Добавляй фильмы и сериалы во вкладках ниже.
            </ThemedText>
          ) : (
            <View style={styles.watchlistGrid}>
              {watchlist.map((movie) => (
                <TouchableOpacity
                  key={movie.id}
                  style={styles.watchlistCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({ pathname: "/movie/[id]", params: { id: movie.id, type: movie.media_type ?? "movie" } })
                  }
                >
                  <View style={styles.watchlistPosterWrap}>
                    <Image
                      source={movie.poster_path ? { uri: IMAGE_BASE + movie.poster_path } : null}
                      style={styles.watchlistPoster}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => toggleWatchlist(movie)}
                    >
                      <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.kpButton}
                      onPress={() =>
                        WebBrowser.openBrowserAsync(
                          `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(movie.title)}`,
                        )
                      }
                    >
                      <ThemedText style={styles.kpButtonText}>КП</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.watchlistTitle} numberOfLines={2}>
                    {movie.title}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        // ── Search results ──
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
  inputWrap: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 40,
    fontSize: 16,
    color: "#000",
  },
  clearBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "bold",
  },

  // Watchlist grid
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    lineHeight: 20,
  },
  watchlistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  watchlistCard: {
    width: "47%",
  },
  watchlistPosterWrap: {
    position: "relative",
  },
  watchlistPoster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  watchlistTitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  kpButton: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255,102,0,0.88)",
  },
  kpButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 14,
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
