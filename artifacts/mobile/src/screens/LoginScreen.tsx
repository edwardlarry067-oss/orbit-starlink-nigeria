import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

const COLORS = { bg: "#000", card: "#0d0d0d", border: "#1a1a1a", primary: "#00D4FF", text: "#fff", muted: "#6b7280" };

export default function LoginScreen({ navigation }: any) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { Alert.alert("Error", "Please fill in all required fields."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name) { Alert.alert("Error", "Please enter your name."); setLoading(false); return; }
        await register(name, email, password);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>⬤ OrbitFuture</Text>
        <Text style={s.title}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
        <Text style={s.subtitle}>{mode === "login" ? "Access your portal" : "Get started today"}</Text>

        <View style={s.card}>
          {mode === "register" && (
            <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={COLORS.muted}
              value={name} onChangeText={setName} autoCapitalize="words" />
          )}
          <TextInput style={s.input} placeholder="your@email.com" placeholderTextColor={COLORS.muted}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor={COLORS.muted}
            value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : (
              <Text style={s.btnText}>{mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")} style={s.switchBtn}>
            <Text style={s.switchText}>
              {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.trustRow}>
          {["🔒 Secure", "🌍 Global", "📡 24/7"].map(t => (
            <Text key={t} style={s.trustItem}>{t}</Text>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: { color: COLORS.primary, fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2, marginBottom: 32, textAlign: "center" },
  title: { color: COLORS.text, fontSize: 32, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: -1 },
  subtitle: { color: COLORS.muted, fontSize: 12, textAlign: "center", marginBottom: 32, textTransform: "uppercase", letterSpacing: 2 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 24, gap: 12 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.text, fontSize: 14 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  btnText: { color: "#000", fontWeight: "900", fontSize: 13, letterSpacing: 2 },
  switchBtn: { alignItems: "center", paddingTop: 8 },
  switchText: { color: COLORS.muted, fontSize: 12 },
  trustRow: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 28 },
  trustItem: { color: COLORS.muted, fontSize: 11, fontWeight: "600" },
});
