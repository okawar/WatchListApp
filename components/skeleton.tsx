import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: "#3a3a3a", opacity }, style]}
    />
  );
}

export function MovieDetailSkeleton() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Skeleton height={380} borderRadius={12} style={{ marginBottom: 14 }} />
      <Skeleton height={26} width="65%" borderRadius={8} style={{ marginBottom: 8 }} />
      <Skeleton height={18} width="35%" borderRadius={6} style={{ marginBottom: 18 }} />
      <Skeleton height={46} borderRadius={10} style={{ marginBottom: 10 }} />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
        <Skeleton height={42} width={60} borderRadius={10} />
        <Skeleton height={42} borderRadius={10} style={{ flex: 1 }} />
      </View>
      <Skeleton height={18} width="45%" borderRadius={6} style={{ marginBottom: 10 }} />
      <Skeleton height={14} borderRadius={5} style={{ marginBottom: 5 }} />
      <Skeleton height={14} borderRadius={5} style={{ marginBottom: 5 }} />
      <Skeleton height={14} width="75%" borderRadius={5} style={{ marginBottom: 22 }} />
      <Skeleton height={18} width="30%" borderRadius={6} style={{ marginBottom: 10 }} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ width: 90 }}>
            <Skeleton height={120} width={90} borderRadius={8} style={{ marginBottom: 5 }} />
            <Skeleton height={12} borderRadius={4} style={{ marginBottom: 3 }} />
            <Skeleton height={11} width={60} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
