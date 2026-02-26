import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isGuest, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#121212" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (!user && !isGuest) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
          headerShown: !!user,
          headerRight: () =>
            user ? (
              <TouchableOpacity
                onPress={signOut}
                style={{ marginRight: 16, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: "#2a2a2a", borderRadius: 8 }}
              >
                <ThemedText style={{ fontSize: 13, color: "#aaa" }}>Выйти</ThemedText>
              </TouchableOpacity>
            ) : null,
          headerTitle: user?.email ?? "Главная",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#888",
          headerTitleStyle: { fontSize: 13 },
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: "Фильмы",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="film" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tv"
        options={{
          title: "Сериалы",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="tv" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
