import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Linking, KeyboardAvoidingView, Platform
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";

interface Props {
  planId?: string;
  planName?: string;
  price?: string;
  navigation: { goBack: () => void };
}

export default function CheckoutScreen({ planId, planName, price, navigation }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing fields", "Please enter your name and email.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ paymentLink: string; sessionId: string }>(
        "POST",
        "stripe-plan-pay",
        { planId: planId ? parseInt(planId) : undefined, email: email.trim(), name: name.trim(), address: address.trim() }
      );
      const url = res.paymentLink ?? (res as any).url;
      if (!url) {
        Alert.alert("Error", "Could not create checkout session. Please try WhatsApp instead.");
        return;
      }
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: "cancel",
        toolbarColor: "#000",
        controlsColor: Colors.primary,
      });
      if (result.type === "dismiss" || result.type === "cancel") {
        // User closed the browser, refresh if needed
      }
    } catch (e: any) {
      // Fall back to WhatsApp
      const msg = encodeURIComponent(
        `Hi! I'd like to order the ${planName} plan at $${price}/mo.`
      );
      Linking.openURL(`https://wa.me/16206123994?text=${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I'd like to order the ${planName} plan at $${price}/mo.\n\nName: ${name || "N/A"}\nEmail: ${email || "N/A"}`
    );
    Linking.openURL(`https://wa.me/16206123994?text=${msg}`);
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Order summary */}
        <Text style={s.sectionLabel}>Order Summary</Text>
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Plan</Text>
            <Text style={s.summaryValue}>{planName ?? "Selected Plan"}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Monthly Price</Text>
            <Text style={[s.summaryValue, { color: Colors.primary, fontWeight: "900", fontSize: 20 }]}>
              ${price ?? "—"}<Text style={{ fontSize: 12, color: Colors.muted }}>/mo</Text>
            </Text>
          </View>
          <View style={s.divider} />
          <View style={s.includedList}>
            {["📦 Hardware Kit Included", "🔧 Free Setup Guide", "📞 24/7 Support", "🌍 Global Coverage"].map(item => (
              <Text key={item} style={s.includedItem}>{item}</Text>
            ))}
          </View>
        </View>

        {/* Billing details */}
        <Text style={s.sectionLabel}>Your Details</Text>
        <View style={s.formCard}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Full Name *</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
            />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Email Address *</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Delivery Address (optional)</Text>
            <TextInput
              style={[s.input, { height: 80 }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Where to ship the hardware kit"
              placeholderTextColor={Colors.muted}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* CTA buttons */}
        <TouchableOpacity
          style={[s.stripeBtn, loading && s.btnDisabled]}
          onPress={handleStripeCheckout}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : (
              <View style={s.stripeBtnInner}>
                <Text style={s.stripeBtnText}>Pay Securely with Stripe</Text>
                <Text style={s.stripeBtnSub}>🔒 Encrypted checkout</Text>
              </View>
            )
          }
        </TouchableOpacity>

        <View style={s.orRow}>
          <View style={s.orLine} />
          <Text style={s.orText}>or</Text>
          <View style={s.orLine} />
        </View>

        <TouchableOpacity style={s.waBtn} onPress={handleWhatsApp}>
          <Text style={s.waBtnText}>💬  Order via WhatsApp</Text>
          <Text style={s.waBtnSub}>Response under 5 minutes</Text>
        </TouchableOpacity>

        <Text style={s.notice}>
          By proceeding you agree to ORBITFUTURE's Terms of Service. All payments are processed securely by Stripe. Your hardware kit will be shipped after confirmation.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 48, gap: Spacing.lg },
  sectionLabel: { color: Colors.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 },
  summaryCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primaryBorder, padding: Spacing.lg, gap: Spacing.md },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { color: Colors.muted, fontSize: 13 },
  summaryValue: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  divider: { height: 1, backgroundColor: Colors.border },
  includedList: { gap: Spacing.xs },
  includedItem: { color: Colors.mutedLight, fontSize: 12 },
  formCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md },
  field: { gap: Spacing.xs },
  fieldLabel: { color: Colors.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.lg, paddingVertical: 14, color: Colors.text, fontSize: 14 },
  stripeBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 18, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  stripeBtnInner: { alignItems: "center", gap: 2 },
  stripeBtnText: { color: "#000", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  stripeBtnSub: { color: "#000", fontSize: 11, opacity: 0.6 },
  orRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { color: Colors.muted, fontSize: 12 },
  waBtn: { borderWidth: 1, borderColor: "#25D36640", borderRadius: Radius.md, paddingVertical: 16, alignItems: "center", backgroundColor: "#25D36610", gap: 4 },
  waBtnText: { color: "#25D366", fontWeight: "800", fontSize: 14 },
  waBtnSub: { color: "#25D36699", fontSize: 11 },
  notice: { color: Colors.muted, fontSize: 10, textAlign: "center", lineHeight: 16 },
});
