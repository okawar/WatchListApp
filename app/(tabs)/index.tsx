import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTrending } from "@/hooks/use-trending";

export default function HomeScreen() {
  const { movies, error, isLoading } = useTrending();
  return (
    <ThemedView style={styles.container}>
      <ThemedText>{isLoading ? "Загрузка" : ""}</ThemedText>
      <ThemedText>{error}</ThemedText>
      <ThemedText type="title">WatchList</ThemedText>
      {/* <ThemedText>{movies[1]?.title}</ThemedText>
       */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
