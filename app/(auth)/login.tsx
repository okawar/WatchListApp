import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/auth-context";

type Mode = "login" | "register";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setInfo(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password.trim()) {
      setError("Заполните email и пароль");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsLoading(true);
    try {
      const err =
        mode === "login"
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password);

      if (err) {
        setError(err);
      } else if (mode === "register") {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setMode("login");
        setInfo("Подтвердите email — письмо отправлено на почту.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.logo}>🎬</Text>
        <Text style={styles.appName}>WatchList</Text>
        <Text style={styles.tagline}>Твой личный список фильмов и сериалов</Text>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "login" && styles.modeBtnActive]}
            onPress={() => switchMode("login")}
          >
            <Text style={[styles.modeBtnText, mode === "login" && styles.modeBtnTextActive]}>
              Войти
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "register" && styles.modeBtnActive]}
            onPress={() => switchMode("register")}
          >
            <Text style={[styles.modeBtnText, mode === "register" && styles.modeBtnTextActive]}>
              Регистрация
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {mode === "register" && (
          <TextInput
            style={styles.input}
            placeholder="Подтвердите пароль"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}

        {/* Feedback */}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {info && <Text style={styles.infoText}>{info}</Text>}

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#121212" },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    paddingBottom: 32,
  },
  logo: { fontSize: 52, textAlign: "center", marginBottom: 8 },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
  },

  modeRow: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: "#2ecc71" },
  modeBtnText: { fontSize: 14, fontWeight: "600", color: "#888" },
  modeBtnTextActive: { color: "#fff" },

  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },

  errorText: { fontSize: 13, color: "#e05555", marginBottom: 10, textAlign: "center" },
  infoText: { fontSize: 13, color: "#2ecc71", marginBottom: 10, textAlign: "center" },

  submitBtn: {
    backgroundColor: "#2ecc71",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
