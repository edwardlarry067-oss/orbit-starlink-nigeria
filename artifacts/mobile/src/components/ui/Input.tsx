import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from "react-native";
import { Colors, Radius, Spacing } from "../../theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
}

export function Input({ label, error, secureToggle, secureTextEntry, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={s.wrapper}>
      {label && <Text style={s.label}>{label}</Text>}
      <View style={[s.row, error ? s.rowError : null]}>
        <TextInput
          style={[s.input, style]}
          placeholderTextColor={Colors.muted}
          selectionColor={Colors.primary}
          secureTextEntry={secureToggle ? !showPassword : secureTextEntry}
          autoCorrect={false}
          spellCheck={false}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
            <Text style={s.eye}>{showPassword ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, color: Colors.mutedLight },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  rowError: { borderColor: Colors.red },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 14,
  },
  eyeBtn: { padding: Spacing.sm },
  eye: { fontSize: 16 },
  error: { fontSize: 11, color: Colors.red, marginTop: 2 },
});
