import { FlatList, StyleSheet, TargetedEvent, TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTrending } from "@/hooks/use-trending";
import { useState } from "react";
import { useSearch } from "@/hooks/use-search";

export default function HomeScreen() {
  const [query, setQuery] = useState<string>('')

  const trending = useTrending()
  const searchResult = useSearch()

  const isSearching = query.length > 0

  const {movies, error, isLoading} = isSearching ? searchResult : trending

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">WatchList</ThemedText>
      <TextInput
        style={{backgroundColor: "#fff"}}
        value={query}
        onChangeText={(text) => {
          setQuery(text)
          if (text.length > 0) searchResult.search(text)
        }}
      ></TextInput>
      <ThemedText>{isLoading ? "Загрузка..." : ""}</ThemedText>
      <ThemedText>{error}</ThemedText>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ThemedText>{item.title}</ThemedText>}
      />
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
