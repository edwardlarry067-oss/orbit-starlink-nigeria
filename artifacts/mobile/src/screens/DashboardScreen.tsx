import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";

interface Subscription {
  id: number;
  planName: string;
  planCategory: string;
  priceMonthly: number;
  status: string;
  createdAt: string;
  cancelledAt: string | null;
  address: string | null;
}

interface Wallet {
  balance: number;
}

// Map subscription/installation statuses to display labels
const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  processing: "Processing",
  scheduled: "Scheduled",
  installed: "Installed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const [subsRes, walletRes] = await Promise.allSettled([
      apiRequest<{ subscriptions?: Subscription[]; data?: Subscription[] } | Subscription[]>("GET", `subscriptions?email=${encodeURIComponent(user.email)}`),
      apiRequest<Wallet>("GET", `wallet/${encodeURIComponent(user.email)}`),
    ]);
    if (subsRes.status === "fulfilled") {
      const v = subsRes.value as any;
      const list = Array.isArray(v) ? v : (v?.subscriptions ?? v?.data ?? []);
      setSubs(list);
    }
    if (walletRes.status === "fulfilled") {
      setWallet(walletRes.value as Wallet);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const confirmLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <View style={s.container}>
        <EmptyState icon="📊" title="Sign in to view your dashboard" actionLabel="Sign In" onAction={() => navigation.navigate("Profile")} />
      </View>
    );
  }

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  const activeSub = subs.find(s => s.status === "active");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      {/* Greeting */}
      <View style={s.greetRow}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user.name?.[0]?.toUpperCase() ?? "U"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>Welcome back,</Text>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.email}>{user.email}</Text>
        </View>
        <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate("Notifications")}>
          <Text style={s.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Active plan banner */}
      {activeSub && (
        <Card highlight style={s.activePlanCard}>
          <View style={s.activePlanTop}>
            <View>
              <Text style={s.activePlanLabel}>🛰️ Active Plan</Text>
              <Text style={s.activePlanName}>{activeSub.planName}</Text>
            </View>
            <Badge label="Active" status="active" />
          </View>
          <View style={s.divider} />
          <View style={s.activePlanRow}>
            <Text style={s.activePlanMeta}>Since {new Date(activeSub.createdAt).toLocaleDateString()}</Text>
            <Text style={s.activePlanPrice}>${activeSub.priceMonthly}/mo</Text>
          </View>
        </Card>
      )}

      {/* Wallet card */}
      <Card style={s.walletCard}>
        <View style={s.walletRow}>
          <View>
            <Text style={s.walletLabel}>🪙 Orbit Wallet</Text>
            <Text style={s.walletBal}>{wallet?.balance?.toLocaleString() ?? "0"} <Text style={s.walletUnit}>tokens</Text></Text>
          </View>
          <TouchableOpacity style={s.topUpBtn} onPress={() => navigation.navigate("Wallet")}>
            <Text style={s.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Subscriptions */}
      <Text style={s.sectionTitle}>All Subscriptions</Text>
      {subs.length === 0 ? (
        <EmptyState
          icon="📡"
          title="No subscriptions yet"
          subtitle="Browse our plans to get connected with satellite internet."
          actionLabel="View Plans"
          onAction={() => navigation.navigate("Plans")}
        />
      ) : (
        subs.map((sub) => (
          <View key={sub.id} style={s.subCard}>
            <View style={s.subCardHeader}>
              <Text style={s.subPlanName}>{sub.planName}</Text>
              <Badge label={STATUS_LABEL[sub.status] ?? sub.status} status={sub.status} />
            </View>
            {sub.planCategory && (
              <Text style={s.subCategory}>{sub.planCategory}</Text>
            )}
            <View style={s.subMeta}>
              <Text style={s.subMetaText}>Started {new Date(sub.createdAt).toLocaleDateString()}</Text>
              <Text style={s.subPrice}>${sub.priceMonthly}/mo</Text>
            </View>
            {sub.address && <Text style={s.subAddress}>📍 {sub.address}</Text>}

            {/* Installation status steps */}
            {sub.status !== "cancelled" && (
              <View style={s.statusBar}>
                {["Pending", "Processing", "Scheduled", "Installed", "Completed"].map((step, i) => {
                  const stepStatus = step.toLowerCase();
                  const statusOrder = ["pending", "processing", "scheduled", "installed", "completed"];
                  const currentIdx = statusOrder.indexOf(sub.status.toLowerCase());
                  const stepIdx = statusOrder.indexOf(stepStatus);
                  const isDone = stepIdx <= currentIdx;
                  const isCurrent = stepIdx === currentIdx;
                  return (
                    <View key={step} style={s.statusStep}>
                      <View style={[s.statusDot, isDone && s.statusDotDone, isCurrent && s.statusDotCurrent]} />
                      <Text style={[s.statusStepLabel, isDone && s.statusStepLabelDone]}>{step}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))
      )}

      {/* Quick actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.quickGrid}>
        {[
          { icon: "📡", label: "New Plan", action: () => navigation.navigate("Plans") },
          { icon: "🪙", label: "Buy Tokens", action: () => navigation.navigate("Wallet") },
          { icon: "💬", label: "Support", action: () => navigation.navigate("Support") },
          { icon: "🔔", label: "Notifications", action: () => navigation.navigate("Notifications") },
        ].map(({ icon, label, action }) => (
          <TouchableOpacity key={label} style={s.quickBtn} onPress={action}>
            <Text style={s.quickIcon}>{icon}</Text>
            <Text style={s.quickLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.signOutBtn} onPress={confirmLogout}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  greetRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.xxl },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryDim, borderWidth: 2, borderColor: Colors.primaryBorder, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.primary, fontSize: 24, fontWeight: "900" },
  greeting: { color: Colors.muted, fontSize: 12, marginBottom: 1 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  email: { color: Colors.muted, fontSize: 12 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  notifIcon: { fontSize: 18 },
  activePlanCard: { marginBottom: Spacing.md, padding: Spacing.xl },
  activePlanTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing.md },
  activePlanLabel: { color: Colors.primary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  activePlanName: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
  activePlanRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activePlanMeta: { color: Colors.muted, fontSize: 12 },
  activePlanPrice: { color: Colors.primary, fontWeight: "900", fontSize: 18 },
  walletCard: { marginBottom: Spacing.xl, padding: Spacing.xl },
  walletRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  walletLabel: { color: Colors.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  walletBal: { color: Colors.text, fontSize: 26, fontWeight: "900" },
  walletUnit: { color: Colors.muted, fontSize: 14, fontWeight: "400" },
  topUpBtn: { backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder, borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 16 },
  topUpText: { color: Colors.primary, fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  sectionTitle: { color: Colors.text, fontWeight: "900", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: Spacing.md, marginTop: Spacing.sm },
  subCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, marginBottom: Spacing.sm },
  subCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  subPlanName: { color: Colors.text, fontWeight: "800", fontSize: 16, flex: 1, paddingRight: Spacing.sm },
  subCategory: { color: Colors.muted, fontSize: 12, textTransform: "capitalize", marginBottom: Spacing.sm },
  subMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.xs },
  subMetaText: { color: Colors.muted, fontSize: 12 },
  subPrice: { color: Colors.primary, fontWeight: "800", fontSize: 14 },
  subAddress: { color: Colors.muted, fontSize: 11, marginBottom: Spacing.sm },
  statusBar: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  statusStep: { alignItems: "center", flex: 1, gap: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  statusDotDone: { backgroundColor: Colors.green },
  statusDotCurrent: { backgroundColor: Colors.primary, width: 10, height: 10, borderRadius: 5 },
  statusStepLabel: { color: Colors.muted, fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" },
  statusStepLabelDone: { color: Colors.green },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  quickBtn: { flex: 1, minWidth: "45%", backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, alignItems: "center", gap: Spacing.xs },
  quickIcon: { fontSize: 28 },
  quickLabel: { color: Colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  signOutBtn: { alignItems: "center", paddingVertical: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.redBorder, backgroundColor: Colors.redDim },
  signOutText: { color: Colors.red, fontWeight: "700", fontSize: 13, letterSpacing: 1 },
});
