import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Radius } from "../../theme";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "neutral";

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryDim, text: Colors.primary },
  success: { bg: Colors.greenDim, text: Colors.green },
  warning: { bg: "#f59e0b20", text: Colors.amber },
  error: { bg: Colors.redDim, text: Colors.red },
  neutral: { bg: "#ffffff10", text: Colors.muted },
};

const STATUS_MAP: Record<string, BadgeVariant> = {
  active: "success",
  pending: "primary",
  processing: "warning",
  scheduled: "primary",
  installed: "success",
  completed: "success",
  cancelled: "error",
  failed: "error",
  paid: "success",
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  status?: string;
}

export function Badge({ label, variant, status }: BadgeProps) {
  const resolvedVariant = variant ?? (status ? STATUS_MAP[status.toLowerCase()] ?? "neutral" : "neutral");
  const { bg, text } = VARIANT_COLORS[resolvedVariant];

  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
