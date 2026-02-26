import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import {
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getTVCredits,
  getTVDetails,
  getTVVideos,
} from "@/services/movies";
import { CastMember, Credits, CrewMember, Movie } from "@/types/movie";

const IMAGE_BASE_LARGE = "https://image.tmdb.org/t/p/w500";
const IMAGE_BASE_SMALL = "https://image.tmdb.org/t/p/w185";

export default function MovieScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const isTV = type === "tv";

  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const numId = Number(id);
        const [detailData, creditsData, videosData] = await Promise.all([
          isTV ? getTVDetails(numId) : getMovieDetails(numId),
          isTV ? getTVCredits(numId) : getMovieCredits(numId),
          isTV ? getTVVideos(numId) : getMovieVideos(numId),
        ]);

        if (isTV) {
          setMovie({
            id: detailData.id,
            title: detailData.name ?? detailData.title ?? "",
            overview: detailData.overview ?? "",
            poster_path: detailData.poster_path ?? "",
            vote_average: detailData.vote_average ?? 0,
            release_date: detailData.first_air_date ?? "",
            media_type: "tv",
          });
        } else {
          setMovie({ ...detailData, media_type: "movie" });
        }

        setCredits(creditsData ?? null);

        const videos: any[] = videosData?.results ?? [];
        const trailer =
          videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
          videos.find((v) => v.site === "YouTube");
        if (trailer) setTrailerKey(trailer.key);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isTV]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!movie) return null;

  const director = credits?.crew?.find((p: CrewMember) => p.job === "Director");
  const cast = credits?.cast?.slice(0, 6) ?? [];

  return (
    <>
      <ScrollView>
        <ThemedView style={styles.container}>
          <Image
            source={{ uri: IMAGE_BASE_LARGE + movie.poster_path }}
            style={styles.poster}
            contentFit="cover"
            transition={300}
          />

          {trailerKey && (
            <TouchableOpacity
              style={styles.trailerBtn}
              onPress={() => setShowTrailer(true)}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.trailerBtnText}>▶  Смотреть трейлер</ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText type="title" style={styles.title}>
            {movie.title}
          </ThemedText>

          <View style={styles.ratingRow}>
            <ThemedText style={styles.rating}>
              ★ {(movie.vote_average ?? 0).toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.year}>{movie.release_date?.slice(0, 4)}</ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.watchlistBtn, isInWatchlist(movie.id) && styles.watchlistBtnActive]}
            onPress={() => toggleWatchlist(movie)}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.watchlistBtnText}>
              {isInWatchlist(movie.id) ? "✓ В списке" : "+ В мой список"}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.section}>О {isTV ? "сериале" : "фильме"}</ThemedText>
          <ThemedText style={styles.overview}>{movie.overview}</ThemedText>

          {director && (
            <>
              <ThemedText style={styles.section}>Режиссёр</ThemedText>
              <ThemedText style={styles.directorName}>{director.name}</ThemedText>
            </>
          )}

          {cast.length > 0 && (
            <>
              <ThemedText style={styles.section}>В ролях</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.castRow}>
                  {cast.map((actor: CastMember) => (
                    <View key={actor.id} style={styles.castItem}>
                      <View style={styles.avatarWrapper}>
                        {actor.profile_path ? (
                          <Image
                            source={{ uri: IMAGE_BASE_SMALL + actor.profile_path }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                          />
                        ) : (
                          <View style={[styles.avatar, styles.avatarPlaceholder]} />
                        )}
                      </View>
                      <ThemedText style={styles.actorName} numberOfLines={2}>
                        {actor.name}
                      </ThemedText>
                      <ThemedText style={styles.character} numberOfLines={2}>
                        {actor.character}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </ThemedView>
      </ScrollView>

      {/* Trailer modal */}
      <Modal
        visible={showTrailer}
        animationType="slide"
        onRequestClose={() => setShowTrailer(false)}
        statusBarTranslucent
      >
        <View style={styles.trailerModal}>
          <TouchableOpacity
            style={styles.trailerCloseBtn}
            onPress={() => setShowTrailer(false)}
          >
            <Text style={styles.trailerCloseBtnText}>✕  Закрыть</Text>
          </TouchableOpacity>
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&playsinline=1`,
            }}
            style={{ flex: 1, backgroundColor: "#000" }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 16, paddingBottom: 40 },

  poster: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#333",
  },

  trailerBtn: {
    backgroundColor: "#e53935",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    marginBottom: 14,
  },
  trailerBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  title: { marginBottom: 8 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  rating: { fontSize: 18, fontWeight: "bold", color: "#f5c518" },
  year: { fontSize: 16, opacity: 0.6 },

  watchlistBtn: {
    backgroundColor: "#444",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  watchlistBtnActive: { backgroundColor: "#2ecc71" },
  watchlistBtnText: { fontSize: 16, fontWeight: "600" },

  section: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  overview: { fontSize: 15, lineHeight: 22, opacity: 0.85 },
  directorName: { fontSize: 16 },

  castRow: { flexDirection: "row", gap: 12, paddingBottom: 8 },
  castItem: { width: 90 },
  avatarWrapper: { marginBottom: 6 },
  avatar: { width: 90, height: 120, borderRadius: 8 },
  avatarPlaceholder: { backgroundColor: "#444" },
  actorName: { fontSize: 13, fontWeight: "600" },
  character: { fontSize: 12, opacity: 0.6 },

  // Trailer modal
  trailerModal: { flex: 1, backgroundColor: "#000" },
  trailerCloseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#111",
  },
  trailerCloseBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
