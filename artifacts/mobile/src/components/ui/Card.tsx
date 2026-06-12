import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors, Radius, Spacing } from "../../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  highlight?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, style, highlight, padding = "md" }: CardProps) {
  return (
    <View style={[
      s.card,
      highlight && s.highlight,
      padding === "sm" && s.padSm,
      padding === "md" && s.padMd,
      padding === "lg" && s.padLg,
      style,
    ]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlight: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.surface,
  },
  padSm: { padding: Spacing.md },
  padMd: { padding: Spacing.lg },
  padLg: { padding: Spacing.xxl },
});
