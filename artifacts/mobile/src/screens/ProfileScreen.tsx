import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import { Colors, Spacing, Radius } from "../theme";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
export default function ProfileScreen({ navigation }: any) {
  const { user, logout, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={{ color: Colors.text, fontSize: 20, fontWeight: "900", textTransform: "uppercase", textAlign: "center" }}>
          Sign In to View Profile
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
          Access your account details, manage your subscription, and top up your wallet.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15, paddingHorizontal: 40, marginTop: 8 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: "#000", fontWeight: "900", fontSize: 13, letterSpacing: 1.5 }}>SIGN IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: 13, paddingHorizontal: 40 }}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={{ color: Colors.mutedLight, fontWeight: "700", fontSize: 13 }}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Error", "Name cannot be empty."); return; }
    setSaving(true);
    try {
      await apiRequest("PATCH", "auth/me", { name: name.trim(), phone: phone.trim(), address: address.trim() });
      Alert.alert("Saved", "Your profile has been updated.");
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.pageTitle}>My <Text style={{ color: Colors.primary }}>Profile</Text></Text>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user.name[0]?.toUpperCase() ?? "U"}</Text>
          </View>
          <Text style={s.userName}>{user.name}</Text>
          <Text style={s.userEmail}>{user.email}</Text>
          <View style={s.statusBadge}>
            <Text style={s.statusDot}>●</Text>
            <Text style={s.statusText}>Active Account</Text>
          </View>
        </View>

        {/* Info card */}
        <Card style={s.infoCard}>
          <View style={s.infoHeader}>
            <Text style={s.infoTitle}>Account Details</Text>
            <TouchableOpacity onPress={() => { setName(user.name); setEditing(!editing); }}>
              <Text style={s.editBtn}>{editing ? "Cancel" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={s.formFields}>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Full Name</Text>
                <TextInput style={s.fieldInput} value={name} onChangeText={setName} placeholderTextColor={Colors.muted} autoCapitalize="words" />
              </View>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Phone (optional)</Text>
                <TextInput style={s.fieldInput} value={phone} onChangeText={setPhone} placeholderTextColor={Colors.muted} keyboardType="phone-pad" placeholder="e.g. +1 555 000 0000" />
              </View>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Address (optional)</Text>
                <TextInput style={s.fieldInput} value={address} onChangeText={setAddress} placeholderTextColor={Colors.muted} placeholder="Your installation address" multiline />
              </View>
              <Button label={saving ? "Saving…" : "Save Changes"} onPress={handleSave} loading={saving} fullWidth style={{ marginTop: Spacing.sm }} />
            </View>
          ) : (
            <>
              {[
                { label: "Full Name", value: user.name },
                { label: "Email Address", value: user.email },
                { label: "Account Status", value: "Active" },
                { label: "Member Since", value: "2025" },
              ].map(({ label, value }) => (
                <View key={label} style={s.infoRow}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoValue}>{value}</Text>
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Security */}
        <Card style={s.infoCard}>
          <Text style={s.infoTitle}>Security</Text>
          <TouchableOpacity
            style={s.secRow}
            onPress={() =>
              Alert.alert(
                "Change Password",
                "To reset your password, contact our support team via WhatsApp or email and we'll send you a secure reset link.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Contact Support", onPress: () => navigation.navigate("Support") },
                ]
              )
            }
          >
            <Text style={s.secRowText}>Change Password</Text>
            <Text style={s.secRowArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Help */}
        <Card style={s.infoCard}>
          <Text style={s.infoTitle}>Help</Text>
          <TouchableOpacity style={s.secRow} onPress={() => navigation.navigate("Support")}>
            <Text style={s.secRowText}>Contact Support</Text>
            <Text style={s.secRowArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secRow} onPress={() => navigation.navigate("Notifications")}>
            <Text style={s.secRowText}>Notifications</Text>
            <Text style={s.secRowArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={confirmLogout}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>ORBITFUTURE v1.0.0 · com.orbitfuture.app</Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 48, gap: Spacing.md },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: "900", textTransform: "uppercase", letterSpacing: -0.5, marginBottom: Spacing.sm },
  avatarWrap: { alignItems: "center", paddingVertical: Spacing.xl, gap: Spacing.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryDim, borderWidth: 2, borderColor: Colors.primaryBorder, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.primary, fontSize: 40, fontWeight: "900" },
  userName: { color: Colors.text, fontSize: 22, fontWeight: "800" },
  userEmail: { color: Colors.muted, fontSize: 13 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#10b98120", paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  statusDot: { color: Colors.green, fontSize: 8 },
  statusText: { color: Colors.green, fontSize: 11, fontWeight: "700" },
  infoCard: { padding: Spacing.lg, gap: Spacing.sm },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  infoTitle: { color: Colors.text, fontWeight: "800", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  editBtn: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { color: Colors.muted, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
  formFields: { gap: Spacing.md },
  field: { gap: Spacing.xs },
  fieldLabel: { color: Colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 },
  fieldInput: { backgroundColor: "#111", borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.lg, paddingVertical: 13, color: Colors.text, fontSize: 14 },
  secRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  secRowText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },
  secRowArrow: { color: Colors.primary, fontSize: 16 },
  signOutBtn: { alignItems: "center", paddingVertical: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.redBorder, backgroundColor: Colors.redDim },
  signOutText: { color: Colors.red, fontWeight: "700", fontSize: 13, letterSpacing: 1 },
  version: { color: Colors.muted, fontSize: 10, textAlign: "center", letterSpacing: 1 },
});
