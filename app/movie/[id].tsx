import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWatchlist } from "@/context/watchlist-context";
import { getMovieCredits, getMovieDetails } from "@/services/movies";
import { CastMember, Credits, CrewMember, Movie } from "@/types/movie";

const IMAGE_BASE_LARGE = "https://image.tmdb.org/t/p/w500";
const IMAGE_BASE_SMALL = "https://image.tmdb.org/t/p/w185";

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [movieData, creditsData] = await Promise.all([
          getMovieDetails(Number(id)),
          getMovieCredits(Number(id)),
        ]);
        setMovie(movieData);
        setCredits(creditsData);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!movie) return null;

  const director = credits?.crew.find((p: CrewMember) => p.job === "Director");
  const cast = credits?.cast.slice(0, 6) ?? [];

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <Image
          source={{ uri: IMAGE_BASE_LARGE + movie.poster_path }}
          style={styles.poster}
        />

        <ThemedText type="title" style={styles.title}>
          {movie.title}
        </ThemedText>

        <View style={styles.ratingRow}>
          <ThemedText style={styles.rating}>
            ★ {movie.vote_average.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.year}>
            {movie.release_date?.slice(0, 4)}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.watchlistButton, isInWatchlist(movie.id) && styles.watchlistButtonActive]}
          onPress={() => toggleWatchlist(movie)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.watchlistButtonText}>
            {isInWatchlist(movie.id) ? "✓ В списке" : "+ В мой список"}
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.section}>О фильме</ThemedText>
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
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
  },
  poster: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#333",
  },
  title: {
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  watchlistButton: {
    backgroundColor: "#444",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  watchlistButtonActive: {
    backgroundColor: "#2ecc71",
  },
  watchlistButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  rating: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f5c518",
  },
  year: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  overview: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  directorName: {
    fontSize: 16,
  },
  castRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 8,
  },
  castItem: {
    width: 90,
  },
  avatarWrapper: {
    marginBottom: 6,
  },
  avatar: {
    width: 90,
    height: 120,
    borderRadius: 8,
  },
  avatarPlaceholder: {
    backgroundColor: "#444",
  },
  actorName: {
    fontSize: 13,
    fontWeight: "600",
  },
  character: {
    fontSize: 12,
    opacity: 0.6,
  },
});
