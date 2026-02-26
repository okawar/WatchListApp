import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2ecc71",
        tabBarInactiveTintColor: colors.icon,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#111" : "#fff",
          borderTopColor: colorScheme === "dark" ? "#222" : "#e0e0e0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: "Фильмы",
          tabBarIcon: ({ color }) => <Ionicons name="film" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tv"
        options={{
          title: "Сериалы",
          tabBarIcon: ({ color }) => <Ionicons name="tv" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
