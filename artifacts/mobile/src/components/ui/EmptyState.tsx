import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing } from "../../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "📭", title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={s.container}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="md" style={s.btn} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  icon: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: { marginTop: Spacing.sm },
});
