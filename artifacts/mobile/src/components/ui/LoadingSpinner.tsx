import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Colors } from "../../theme";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = true }: LoadingSpinnerProps) {
  return (
    <View style={[s.container, fullScreen && s.fullScreen]}>
      <ActivityIndicator color={Colors.primary} size="large" />
      {message && <Text style={s.message}>{message}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  message: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
});
