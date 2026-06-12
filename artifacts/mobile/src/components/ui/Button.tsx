import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { Colors, Radius } from "../../theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({ label, onPress, variant = "primary", size = "md", loading, disabled, style, fullWidth }: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    s.base,
    size === "sm" && s.sm,
    size === "md" && s.md,
    size === "lg" && s.lg,
    variant === "primary" && s.primary,
    variant === "outline" && s.outline,
    variant === "ghost" && s.ghost,
    variant === "danger" && s.danger,
    fullWidth && s.fullWidth,
    isDisabled && s.disabled,
    style,
  ];

  const textStyle = [
    s.text,
    size === "sm" && s.textSm,
    size === "md" && s.textMd,
    size === "lg" && s.textLg,
    variant === "primary" && s.textPrimary,
    variant === "outline" && s.textOutline,
    variant === "ghost" && s.textGhost,
    variant === "danger" && s.textDanger,
  ];

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} disabled={isDisabled} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={variant === "primary" ? "#000" : Colors.primary} size="small" />
        : <Text style={textStyle}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", borderRadius: Radius.md },
  sm: { paddingVertical: 10, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
  primary: { backgroundColor: Colors.primary },
  outline: { borderWidth: 1, borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryDim },
  ghost: { backgroundColor: "transparent" },
  danger: { borderWidth: 1, borderColor: Colors.redBorder, backgroundColor: Colors.redDim },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.5 },
  text: { fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 12 },
  textLg: { fontSize: 13 },
  textPrimary: { color: "#000" },
  textOutline: { color: Colors.primary },
  textGhost: { color: Colors.muted },
  textDanger: { color: Colors.red },
});
