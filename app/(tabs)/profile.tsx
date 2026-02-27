import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useWatchlist } from "@/context/watchlist-context";

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const router = useRouter();

  const movieCount = watchlist.filter((m) => (m.media_type ?? "movie") === "movie").length;
  const tvCount = watchlist.filter((m) => m.media_type === "tv").length;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  if (!user) return null;

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.email ?? "?")}</Text>
          </View>
          <ThemedText style={styles.email}>{user.email}</ThemedText>
          <ThemedText style={styles.since}>
            В сервисе с {formatDate(user.created_at)}
          </ThemedText>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{watchlist.length}</Text>
            <ThemedText style={styles.statLabel}>Всего</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{movieCount}</Text>
            <ThemedText style={styles.statLabel}>Фильмов</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{tvCount}</Text>
            <ThemedText style={styles.statLabel}>Сериалов</ThemedText>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Аккаунт</ThemedText>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue} numberOfLines={1}>
                {user.email}
              </ThemedText>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>ID</ThemedText>
              <ThemedText style={styles.infoValueMono} numberOfLines={1}>
                {user.id.slice(0, 8)}…
              </ThemedText>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Подтверждён</ThemedText>
              <ThemedText
                style={[
                  styles.infoValue,
                  { color: user.email_confirmed_at ? "#2ecc71" : "#e05555" },
                ]}
              >
                {user.email_confirmed_at ? "Да" : "Нет"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Действия</ThemedText>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 40 },

  avatarWrap: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2ecc71",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  email: { fontSize: 17, fontWeight: "600", marginBottom: 4 },
  since: { fontSize: 13, color: "#666" },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  statNum: { fontSize: 26, fontWeight: "800", color: "#2ecc71", lineHeight: 30 },
  statLabel: { fontSize: 12, color: "#888", marginTop: 4 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: "#666", fontWeight: "600", marginBottom: 10, letterSpacing: 0.5 },

  infoCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  separator: { height: 1, backgroundColor: "#2a2a2a", marginHorizontal: 16 },
  infoLabel: { fontSize: 14, color: "#888" },
  infoValue: { fontSize: 14, color: "#ccc", maxWidth: "65%", textAlign: "right" },
  infoValueMono: { fontSize: 13, color: "#888", fontVariant: ["tabular-nums"] },

  signOutBtn: {
    backgroundColor: "#2a1a1a",
    borderWidth: 1,
    borderColor: "#6b2020",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  signOutText: { fontSize: 15, fontWeight: "600", color: "#e05555" },
});
