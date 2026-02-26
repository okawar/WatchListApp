import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import {
  getKinopoiskId,
  getMovieCredits,
  getMovieDetails,
  getMovieExternalIds,
  getMovieVideos,
  getTVCredits,
  getTVDetails,
  getTVExternalIds,
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
  const [isLoading, setIsLoading] = useState(true);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [kpId, setKpId] = useState<number | null>(null);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const numId = Number(id);
        const [detailData, creditsData, videosData, externalData] = await Promise.all([
          isTV ? getTVDetails(numId) : getMovieDetails(numId),
          isTV ? getTVCredits(numId) : getMovieCredits(numId),
          isTV ? getTVVideos(numId) : getMovieVideos(numId),
          isTV ? getTVExternalIds(numId) : getMovieExternalIds(numId),
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

        const imdb: string | null = externalData?.imdb_id ?? null;
        setImdbId(imdb);
        // Fetch KP ID asynchronously — не блокирует основной экран
        if (imdb) {
          getKinopoiskId(imdb).then((id) => {
            if (id) setKpId(id);
          });
        }
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
              style={styles.trailerWrap}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  `https://www.youtube.com/watch?v=${trailerKey}`,
                )
              }
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: `https://img.youtube.com/vi/${trailerKey}/hqdefault.jpg` }}
                style={styles.trailerThumb}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.trailerOverlay}>
                <View style={styles.playBtn}>
                  <ThemedText style={styles.playIcon}>▶</ThemedText>
                </View>
                <ThemedText style={styles.trailerLabel}>Смотреть трейлер</ThemedText>
              </View>
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

          <View style={styles.externalRow}>
            <TouchableOpacity
              style={styles.kpBtn}
              activeOpacity={0.8}
              onPress={() => {
                const url = kpId
                  ? `https://www.kinopoisk.ru/${isTV ? "series" : "film"}/${kpId}/`
                  : imdbId
                    ? `https://www.kinopoisk.ru/index.php?kp_query=${imdbId}`
                    : `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(movie.title)}`;
                WebBrowser.openBrowserAsync(url);
              }}
            >
              <ThemedText style={styles.kpBtnText}>КП</ThemedText>
            </TouchableOpacity>

            {kpId && (
              <TouchableOpacity
                style={styles.flicksBtn}
                activeOpacity={0.8}
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    `https://flcksbr.top/${isTV ? "series" : "film"}/${kpId}/`,
                  )
                }
              >
                <ThemedText style={styles.flicksBtnText}>▶ Смотреть онлайн</ThemedText>
              </TouchableOpacity>
            )}
          </View>

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

  trailerWrap: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#222",
  },
  trailerThumb: {
    width: "100%",
    height: 190,
  },
  trailerOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(229,57,53,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { fontSize: 22, color: "#fff", marginLeft: 3 },
  trailerLabel: { fontSize: 14, fontWeight: "600", color: "#fff" },

  title: { marginBottom: 8 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  rating: { fontSize: 18, fontWeight: "bold", color: "#f5c518" },
  year: { fontSize: 16, opacity: 0.6 },

  externalRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  kpBtn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#FF6600",
    alignItems: "center",
    justifyContent: "center",
  },
  kpBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  flicksBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#3a3aaa",
    alignItems: "center",
  },
  flicksBtnText: { fontSize: 14, fontWeight: "600", color: "#8888ff" },

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

});
