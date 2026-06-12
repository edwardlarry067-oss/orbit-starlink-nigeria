import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Radius, Spacing } from "../theme";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert("Missing field", "Please enter your full name."); return; }
    if (!email.trim()) { Alert.alert("Missing field", "Please enter your email address."); return; }
    if (!password) { Alert.alert("Missing field", "Please enter a password."); return; }
    if (password.length < 8) { Alert.alert("Weak password", "Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { Alert.alert("Password mismatch", "Passwords do not match."); return; }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert("Registration failed", e.message ?? "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={s.brand}>
          <Text style={s.brandDot}>⬤</Text>
          <Text style={s.brandName}>ORBITFUTURE</Text>
        </View>

        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Join thousands of global subscribers</Text>

        {/* Form */}
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Full Name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Email Address</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Password</Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors.muted}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Text style={s.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Confirm Password</Text>
            <TextInput
              style={s.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor={Colors.muted}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
            />
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={s.btnText}>CREATE ACCOUNT</Text>
            }
          </TouchableOpacity>

          <View style={s.terms}>
            <Text style={s.termsText}>
              By creating an account you agree to our{" "}
              <Text style={{ color: Colors.primary }}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={{ color: Colors.primary }}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>

        {/* Switch to login */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={s.switchBtn}>
          <Text style={s.switchText}>
            Already have an account? <Text style={{ color: Colors.primary }}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        {/* Trust signals */}
        <View style={s.trustRow}>
          {["🔒 Secure", "🌍 Global", "📡 24/7 Support"].map(t => (
            <Text key={t} style={s.trustItem}>{t}</Text>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xl, paddingTop: 60 },
  brand: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: Spacing.xxl },
  brandDot: { color: Colors.primary, fontSize: 10 },
  brandName: { color: Colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 3 },
  title: { color: Colors.text, fontSize: 30, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: -0.5 },
  subtitle: { color: Colors.muted, fontSize: 12, textAlign: "center", marginBottom: Spacing.xxl, marginTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, gap: Spacing.md },
  field: { gap: Spacing.xs },
  fieldLabel: { color: Colors.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 14, color: Colors.text, fontSize: 14 },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 14 },
  eyeText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: "center", marginTop: Spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#000", fontWeight: "900", fontSize: 13, letterSpacing: 2 },
  terms: { paddingHorizontal: Spacing.sm },
  termsText: { color: Colors.muted, fontSize: 11, textAlign: "center", lineHeight: 18 },
  switchBtn: { alignItems: "center", paddingVertical: Spacing.lg },
  switchText: { color: Colors.muted, fontSize: 13 },
  trustRow: { flexDirection: "row", justifyContent: "center", gap: Spacing.xl, paddingBottom: Spacing.xl },
  trustItem: { color: Colors.muted, fontSize: 11, fontWeight: "600" },
});
