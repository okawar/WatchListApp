import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isWeb = Platform.OS === 'web';
const isSSG = isWeb && typeof window === 'undefined';

const customStorage = isSSG
  ? {
    getItem: (key: string) => Promise.resolve(null),
    setItem: (key: string, value: string) => Promise.resolve(),
    removeItem: (key: string) => Promise.resolve(),
  }
  : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
