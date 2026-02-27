import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      if (animRef.current) animRef.current.stop();
      setMessage(msg);
      opacity.setValue(0);
      animRef.current = Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.delay(1600),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]);
      animRef.current.start();
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 90,
    left: 24,
    right: 24,
    backgroundColor: "rgba(20,20,20,0.93)",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    zIndex: 9999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
