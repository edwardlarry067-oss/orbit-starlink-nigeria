import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";

const C = Colors;

// Must match backend bundleMapper.ts bundle IDs exactly
const BUNDLES = [
  { id: "starter",    name: "Starter",    tokens: 100,  price: 5,   badge: undefined },
  { id: "basic",      name: "Basic",      tokens: 250,  price: 10,  badge: undefined },
  { id: "standard",   name: "Standard",   tokens: 700,  price: 25,  badge: "Best Value" },
  { id: "premium",    name: "Premium",    tokens: 1500, price: 50,  badge: "Popular" },
  { id: "enterprise", name: "Enterprise", tokens: 3500, price: 100, badge: "Most Tokens" },
] as const;

interface Transaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

export default function WalletScreen({ navigation }: any) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [walletRes, txRes] = await Promise.allSettled([
        apiRequest<{ balance: number }>("GET", `wallet/${encodeURIComponent(user.email)}`),
        apiRequest<{ transactions: Transaction[] } | Transaction[]>("GET", `wallet/${encodeURIComponent(user.email)}/transactions`),
      ]);
      if (walletRes.status === "fulfilled") setBalance((walletRes.value as any).balance ?? 0);
      if (txRes.status === "fulfilled") {
        const txData = txRes.value as any;
        setTransactions(Array.isArray(txData) ? txData : (txData.transactions ?? []));
      }
    } catch (e) {
      // partial load is fine
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleBuy = async (bundle: typeof BUNDLES[number]) => {
    if (!user) { Alert.alert("Sign in required", "Please sign in to buy tokens."); return; }
    setBuying(bundle.id);
    try {
      const res = await apiRequest<{ paymentLink: string; sessionId: string }>(
        "POST",
        "stripe-token-buy",
        { bundleId: bundle.id }
      );
      const url = res.paymentLink ?? (res as any).url;
      if (url) {
        await WebBrowser.openBrowserAsync(url, {
          toolbarColor: "#000",
          controlsColor: Colors.primary,
          dismissButtonStyle: "cancel",
        });
        // Refresh balance after payment attempt
        load();
      } else {
        Alert.alert("Error", "No checkout URL returned. Please try again.");
      }
    } catch (e: any) {
      Alert.alert("Purchase failed", e.message ?? "Could not start purchase. Please try again.");
    } finally {
      setBuying(null);
    }
  };

  if (!user) {
    return (
      <View style={s.container}>
        <EmptyState icon="🪙" title="Sign in to use your wallet" actionLabel="Sign In" onAction={() => navigation.navigate("Profile")} />
      </View>
    );
  }

  if (loading) return <LoadingSpinner message="Loading wallet…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
    >
      <Text style={s.title}>Orbit <Text style={{ color: C.primary }}>Wallet</Text></Text>

      {/* Balance card */}
      <Card highlight style={s.balCard}>
        <Text style={s.balLabel}>🪙 Current Balance</Text>
        <Text style={s.balVal}>{balance?.toLocaleString() ?? "0"}</Text>
        <Text style={s.balSub}>tokens</Text>
        <Text style={s.balHint}>Use tokens to activate or renew satellite plans instantly</Text>
      </Card>

      {/* Buy bundles */}
      <Text style={s.sectionTitle}>Top Up Wallet</Text>
      <Text style={s.sectionSub}>All payments secured by Stripe. Tokens credited instantly.</Text>

      {BUNDLES.map((bundle) => (
        <View key={bundle.id} style={s.bundleCard}>
          <View style={s.bundleLeft}>
            {bundle.badge && (
              <View style={s.badgePill}>
                <Text style={s.badgeText}>{bundle.badge}</Text>
              </View>
            )}
            <Text style={s.bundleName}>{bundle.name}</Text>
            <Text style={s.bundleTokens}>{bundle.tokens.toLocaleString()} tokens</Text>
          </View>
          <TouchableOpacity
            style={[s.buyBtn, buying === bundle.id && s.buyBtnDisabled]}
            onPress={() => handleBuy(bundle)}
            disabled={buying !== null}
          >
            <Text style={s.buyBtnText}>${bundle.price}</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: Spacing.xl }]}>Transaction History</Text>
          {transactions.slice(0, 10).map((tx) => (
            <View key={tx.id} style={s.txRow}>
              <View style={[s.txIcon, { backgroundColor: tx.type === "credit" ? C.greenDim : "#ef444420" }]}>
                <Text style={s.txIconText}>{tx.type === "credit" ? "+" : "−"}</Text>
              </View>
              <View style={s.txBody}>
                <Text style={s.txDesc} numberOfLines={1}>{tx.description}</Text>
                <Text style={s.txTime}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={[s.txAmount, { color: tx.type === "credit" ? C.green : C.red }]}>
                {tx.type === "credit" ? "+" : "−"}{Math.abs(tx.amount).toLocaleString()} tkn
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={s.notice}>
        <Text style={s.noticeText}>
          🔒 Payments processed securely via Stripe. Tokens never expire.
          Need help? Contact support via the Support tab.
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  title: { color: C.text, fontSize: 28, fontWeight: "900", textTransform: "uppercase", letterSpacing: -1, marginBottom: Spacing.xl },
  balCard: { alignItems: "center", paddingVertical: Spacing.xxxl, marginBottom: Spacing.xxl },
  balLabel: { color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: Spacing.sm },
  balVal: { color: C.primary, fontSize: 60, fontWeight: "900", lineHeight: 64 },
  balSub: { color: C.muted, fontSize: 14, marginBottom: Spacing.sm },
  balHint: { color: C.muted, fontSize: 11, textAlign: "center", paddingHorizontal: Spacing.lg, lineHeight: 16 },
  sectionTitle: { color: C.text, fontWeight: "900", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.xs },
  sectionSub: { color: C.muted, fontSize: 12, marginBottom: Spacing.lg },
  bundleCard: {
    backgroundColor: C.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  bundleLeft: { gap: 3 },
  badgePill: { backgroundColor: C.primaryDim, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 2 },
  badgeText: { color: C.primary, fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  bundleName: { color: C.mutedLight, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  bundleTokens: { color: C.text, fontWeight: "900", fontSize: 20 },
  buyBtn: { backgroundColor: C.primary, borderRadius: Radius.md, paddingVertical: 13, paddingHorizontal: Spacing.xl },
  buyBtnDisabled: { opacity: 0.5 },
  buyBtnText: { color: "#000", fontWeight: "900", fontSize: 15 },
  txRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: C.border },
  txIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  txIconText: { color: C.text, fontWeight: "900", fontSize: 16 },
  txBody: { flex: 1, gap: 2 },
  txDesc: { color: C.textSecondary, fontSize: 13, fontWeight: "500" },
  txTime: { color: C.muted, fontSize: 11 },
  txAmount: { fontWeight: "800", fontSize: 13 },
  notice: { backgroundColor: "#ffffff06", borderRadius: Radius.md, borderWidth: 1, borderColor: C.borderLight, padding: Spacing.lg, marginTop: Spacing.xl },
  noticeText: { color: C.muted, fontSize: 11, textAlign: "center", lineHeight: 18 },
});
