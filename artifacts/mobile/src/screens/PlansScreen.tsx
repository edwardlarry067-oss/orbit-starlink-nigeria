import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

interface Plan {
  id: number;
  name: string;
  description: string;
  priceMonthly: string;
  hardwarePrice: string | null;
  speed: string;
  category: string;
  features: string[] | null;
  popular: boolean;
  active: boolean;
}

export default function PlansScreen({ navigation }: any) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      const data = await apiRequest<Plan[]>("GET", "plans");
      setPlans(Array.isArray(data) ? data.filter(p => p.active) : []);
      setError(null);
    } catch (e: any) {
      setError("Could not load plans. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleOrder = (plan: Plan) => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to order a plan.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => navigation.navigate("Profile") },
      ]);
      return;
    }
    const hw = parseFloat(plan.hardwarePrice ?? "0");
    const msg = encodeURIComponent(
      `Hi! I'd like to order the ${plan.name} plan at $${plan.priceMonthly}/mo` +
      (hw > 0 ? ` + $${hw} hardware kit.` : ".")
    );
    Linking.openURL(`https://wa.me/16206123994?text=${msg}`);
  };

  const handleStripeOrder = async (plan: Plan) => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to proceed to checkout.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => navigation.navigate("Profile") },
      ]);
      return;
    }
    try {
      const res = await apiRequest<{ paymentLink: string; sessionId: string }>(
        "POST",
        "stripe-plan-pay",
        { planId: plan.id, email: user.email, name: user.name }
      );
      const url = res.paymentLink ?? (res as any).url;
      if (url) {
        await WebBrowser.openBrowserAsync(url, {
          toolbarColor: "#000",
          controlsColor: Colors.primary,
          dismissButtonStyle: "cancel",
        });
      } else {
        handleOrder(plan);
      }
    } catch {
      handleOrder(plan);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={s.loadingText}>Loading plans…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.errorIcon}>📡</Text>
        <Text style={s.errorTitle}>Could not load plans</Text>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => { setLoading(true); loadPlans(); }}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPlans(); }} tintColor={Colors.primary} />}
    >
      <Text style={s.pageTitle}>Service <Text style={{ color: Colors.primary }}>Plans</Text></Text>
      <Text style={s.pageSubtitle}>No contracts · Cancel anytime · Global coverage</Text>

      {/* What's included banner */}
      <Card style={s.includedBanner}>
        <Text style={s.includedTitle}>Every Plan Includes</Text>
        <View style={s.includedGrid}>
          {["📦 Hardware Kit", "🔧 Setup Guide", "📞 24/7 Support", "✅ Account Activation", "🌍 Global Coverage", "🛡️ Secure Checkout"].map(item => (
            <Text key={item} style={s.includedItem}>{item}</Text>
          ))}
        </View>
      </Card>

      {plans.length === 0 ? (
        <View style={s.center}>
          <Text style={s.errorIcon}>📡</Text>
          <Text style={s.errorTitle}>No plans available</Text>
          <Text style={s.errorText}>Check back soon — we're adding new plans!</Text>
        </View>
      ) : (
        plans.map((plan) => {
          const monthly = parseFloat(plan.priceMonthly);
          const hw = parseFloat(plan.hardwarePrice ?? "0");
          const features: string[] = Array.isArray(plan.features) ? plan.features : [];

          return (
            <Card key={plan.id} highlight={plan.popular} style={s.planCard}>
              {plan.popular && (
                <View style={s.popularBadge}>
                  <Text style={s.popularText}>⭐ Most Popular</Text>
                </View>
              )}
              <View style={s.planHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.planCategory}>{plan.category}</Text>
                  <Text style={s.planName}>{plan.name}</Text>
                </View>
                <View style={s.priceBlock}>
                  <Text style={s.price}>${monthly}</Text>
                  <Text style={s.priceSuffix}>/mo</Text>
                </View>
              </View>

              {plan.speed && (
                <View style={s.speedRow}>
                  <Text style={s.speedIcon}>⚡</Text>
                  <Text style={s.speedText}>{plan.speed}</Text>
                </View>
              )}

              <Text style={s.planDesc}>{plan.description}</Text>

              {hw > 0 && (
                <View style={s.hwRow}>
                  <Text style={s.hwText}>📦 Hardware kit: <Text style={{ color: Colors.text }}>${hw}</Text> one-time</Text>
                </View>
              )}

              {features.length > 0 && (
                <View style={s.featureList}>
                  {features.slice(0, 5).map((f) => (
                    <View key={f} style={s.featureRow}>
                      <Text style={s.featureCheck}>✓</Text>
                      <Text style={s.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={[s.orderBtn, plan.popular && s.orderBtnPopular]} onPress={() => handleStripeOrder(plan)}>
                <Text style={s.orderBtnText}>Order This Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.waOrderBtn} onPress={() => handleOrder(plan)}>
                <Text style={s.waOrderBtnText}>💬  Order via WhatsApp</Text>
              </TouchableOpacity>
            </Card>
          );
        })
      )}

      <View style={s.footer}>
        <Text style={s.footerText}>🔒 Secure checkout · 🌍 Delivered worldwide · 📞 24/7 support</Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", padding: Spacing.xxl, gap: Spacing.md },
  loadingText: { color: Colors.muted, fontSize: 13, marginTop: Spacing.sm },
  errorIcon: { fontSize: 48 },
  errorTitle: { color: Colors.text, fontSize: 18, fontWeight: "800", textAlign: "center" },
  errorText: { color: Colors.muted, fontSize: 13, textAlign: "center" },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 12, paddingHorizontal: 28 },
  retryText: { color: "#000", fontWeight: "800", fontSize: 13 },
  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: "900", textTransform: "uppercase", letterSpacing: -1 },
  pageSubtitle: { color: Colors.muted, fontSize: 12, marginBottom: Spacing.xl, letterSpacing: 0.5 },
  includedBanner: { padding: Spacing.lg, marginBottom: Spacing.xl, backgroundColor: Colors.surface, borderColor: Colors.primaryBorder },
  includedTitle: { color: Colors.primary, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2, marginBottom: Spacing.md },
  includedGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  includedItem: { color: Colors.mutedLight, fontSize: 12, fontWeight: "600", minWidth: "45%" },
  planCard: { marginBottom: Spacing.lg, overflow: "hidden" },
  popularBadge: { backgroundColor: Colors.primaryDim, borderBottomWidth: 1, borderBottomColor: Colors.primaryBorder, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, marginHorizontal: -1, marginTop: -1, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  popularText: { color: Colors.primary, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.5 },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  planCategory: { color: Colors.primary, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 },
  planName: { color: Colors.text, fontWeight: "900", fontSize: 18 },
  priceBlock: { alignItems: "flex-end" },
  price: { color: Colors.primary, fontSize: 36, fontWeight: "900", lineHeight: 38 },
  priceSuffix: { color: Colors.muted, fontSize: 13 },
  speedRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  speedIcon: { fontSize: 14 },
  speedText: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
  planDesc: { color: Colors.muted, fontSize: 13, lineHeight: 20, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  hwRow: { backgroundColor: Colors.primaryDim, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  hwText: { color: Colors.muted, fontSize: 12 },
  featureList: { paddingHorizontal: Spacing.lg, gap: Spacing.xs, marginBottom: Spacing.md },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  featureCheck: { color: Colors.green, fontWeight: "900", fontSize: 13, width: 16 },
  featureText: { color: Colors.mutedLight, fontSize: 13, flex: 1, lineHeight: 20 },
  orderBtn: { backgroundColor: Colors.primary, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, borderRadius: Radius.md, paddingVertical: 15, alignItems: "center" },
  orderBtnPopular: { backgroundColor: Colors.primary },
  orderBtnText: { color: "#000", fontWeight: "900", fontSize: 14, letterSpacing: 1.5 },
  waOrderBtn: { borderWidth: 1, borderColor: "#25D36640", borderRadius: Radius.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, paddingVertical: 13, alignItems: "center", backgroundColor: "#25D36610" },
  waOrderBtnText: { color: "#25D366", fontWeight: "700", fontSize: 13, letterSpacing: 0.5 },
  footer: { alignItems: "center", paddingTop: Spacing.lg },
  footerText: { color: Colors.muted, fontSize: 11, textAlign: "center", lineHeight: 18 },
});
