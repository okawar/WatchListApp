import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getPersonCombinedCredits, getPersonDetails } from "@/services/movies";
import { Movie } from "@/types/movie";
import { TmdbPersonDetail } from "@/types/tmdb";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const IMAGE_PROFILE = "https://image.tmdb.org/t/p/w185";

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [person, setPerson] = useState<TmdbPersonDetail | null>(null);
  const [credits, setCredits] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const numId = Number(id);
        const [personData, creditsData] = await Promise.all([
          getPersonDetails(numId),
          getPersonCombinedCredits(numId),
        ]);
        setPerson(personData);

        const seen = new Set<number>();
        const sorted = [...(creditsData.cast ?? [])]
          .filter((item) => {
            if (seen.has(item.id) || !item.poster_path) return false;
            seen.add(item.id);
            return true;
          })
          .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
          .slice(0, 24);

        setCredits(
          sorted.map((item) => ({
            id: item.id,
            title: item.title ?? item.name ?? "",
            overview: item.overview ?? "",
            poster_path: item.poster_path,
            vote_average: item.vote_average ?? 0,
            release_date: item.release_date ?? item.first_air_date ?? "",
            media_type: item.media_type,
          })),
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.root}>
        <View style={styles.container}>
          <View style={styles.headerSkeleton}>
            <Skeleton width={100} height={140} borderRadius={10} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton height={24} width="80%" borderRadius={7} />
              <Skeleton height={14} width="50%" borderRadius={5} />
              <Skeleton height={14} width="40%" borderRadius={5} />
            </View>
          </View>
          <Skeleton height={16} borderRadius={5} style={{ marginBottom: 5 }} />
          <Skeleton height={16} borderRadius={5} style={{ marginBottom: 5 }} />
          <Skeleton height={16} width="70%" borderRadius={5} style={{ marginBottom: 20 }} />
        </View>
      </ThemedView>
    );
  }

  if (!person) return null;

  return (
    <ThemedView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={person.profile_path ? { uri: IMAGE_PROFILE + person.profile_path } : null}
            style={styles.photo}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.headerInfo}>
            <ThemedText style={styles.name}>{person.name}</ThemedText>
            {person.known_for_department ? (
              <ThemedText style={styles.dept}>{person.known_for_department}</ThemedText>
            ) : null}
            {person.birthday ? (
              <ThemedText style={styles.meta}>
                {new Date(person.birthday).getFullYear()}
                {person.place_of_birth ? `  ·  ${person.place_of_birth}` : ""}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {/* Bio */}
        {person.biography ? (
          <>
            <ThemedText style={styles.section}>Биография</ThemedText>
            <ThemedText style={styles.bio}>{person.biography}</ThemedText>
          </>
        ) : null}

        {/* Filmography */}
        {credits.length > 0 && (
          <>
            <ThemedText style={styles.section}>Фильмография</ThemedText>
            <FlatList
              data={credits}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({
                      pathname: "/movie/[id]",
                      params: { id: item.id, type: item.media_type ?? "movie" },
                    })
                  }
                >
                  <Image
                    source={item.poster_path ? { uri: IMAGE_BASE + item.poster_path } : null}
                    style={styles.poster}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                  <ThemedText style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  {item.release_date ? (
                    <ThemedText style={styles.cardYear}>
                      {item.release_date.slice(0, 4)}
                    </ThemedText>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 16, paddingTop: 12, paddingBottom: 40 },

  headerSkeleton: { flexDirection: "row", gap: 14, marginBottom: 20 },

  header: { flexDirection: "row", gap: 14, marginBottom: 20, alignItems: "flex-start" },
  photo: { width: 100, height: 140, borderRadius: 10, backgroundColor: "#333" },
  headerInfo: { flex: 1, paddingTop: 4, gap: 6 },
  name: { fontSize: 22, fontWeight: "700", lineHeight: 26 },
  dept: { fontSize: 13, color: "#2ecc71", fontWeight: "600" },
  meta: { fontSize: 12, color: "#666", lineHeight: 16 },

  section: { fontSize: 17, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  bio: { fontSize: 14, lineHeight: 21, opacity: 0.8, marginBottom: 20 },

  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1 },
  poster: { width: "100%", aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: "#333" },
  cardTitle: { fontSize: 11, marginTop: 4, lineHeight: 15 },
  cardYear: { fontSize: 10, color: "#888", marginTop: 1 },
});
