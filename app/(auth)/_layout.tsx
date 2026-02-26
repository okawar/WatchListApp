import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/auth-context";

export default function AuthLayout() {
  const { user, isGuest, isLoading } = useAuth();

  if (!isLoading && (user || isGuest)) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
