import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Colors } from "../theme";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.content, { opacity, transform: [{ scale }] }]}>
        <View style={s.iconRing}>
          <Text style={s.iconEmoji}>🛰️</Text>
        </View>
        <Text style={s.brandMain}>ORBIT<Text style={s.brandAccent}>FUTURE</Text></Text>
        <Text style={s.tagline}>Satellite Internet · Everywhere</Text>
        <View style={s.dots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[s.dot, i === 1 && s.dotActive]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { alignItems: "center", gap: 16 },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconEmoji: { fontSize: 48 },
  brandMain: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  brandAccent: { color: Colors.primary },
  tagline: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dots: { flexDirection: "row", gap: 6, marginTop: 24 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 16 },
});
