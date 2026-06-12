import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  subscription: "📡",
  payment: "💳",
  installation: "🔧",
  support: "💬",
  system: "ℹ️",
};

export default function NotificationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await apiRequest<Notification[]>("GET", "notifications");
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e: any) {
      if (e.message?.includes("404") || e.message?.includes("not found")) {
        setNotifications([]);
      } else {
        setError("Could not load notifications");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [user]);

  const markRead = async (id: number) => {
    try {
      await apiRequest("PATCH", `notifications/${id}`, { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // silent — not critical
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest("PATCH", "notifications/read-all", {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  if (!user) {
    return (
      <View style={s.container}>
        <EmptyState icon="🔔" title="Sign in to view notifications" actionLabel="Sign In" onAction={() => navigation.navigate("Profile")} />
      </View>
    );
  }

  if (loading) return <LoadingSpinner message="Loading notifications…" />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} tintColor={Colors.primary} />}
    >
      <View style={s.header}>
        <View>
          <Text style={s.title}>Notifications</Text>
          {unreadCount > 0 && <Text style={s.subtitle}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={s.markAllBtn} onPress={markAllRead}>
            <Text style={s.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          subtitle="You'll be notified about your subscription, payments, and installation updates here."
        />
      ) : (
        notifications.map(n => (
          <TouchableOpacity
            key={n.id}
            style={[s.card, !n.read && s.cardUnread]}
            onPress={() => markRead(n.id)}
            activeOpacity={0.8}
          >
            <View style={[s.iconWrap, !n.read && s.iconWrapUnread]}>
              <Text style={s.icon}>{TYPE_ICONS[n.type] ?? "📣"}</Text>
            </View>
            <View style={s.body}>
              <Text style={[s.message, !n.read && s.messageUnread]}>{n.message}</Text>
              <Text style={s.time}>{formatTime(n.createdAt)}</Text>
            </View>
            {!n.read && <View style={s.dot} />}
          </TouchableOpacity>
        ))
      )}

      {/* Static demo notifications when API is empty */}
      {notifications.length === 0 && !error && (
        <View style={s.demoSection}>
          <Text style={s.demoLabel}>Recent activity will appear here</Text>
          {[
            { icon: "📡", text: "Your Starlink subscription is active and ready" },
            { icon: "💳", text: "Payment of $120 received — thank you!" },
            { icon: "🔧", text: "Installation scheduled — our team will contact you" },
          ].map((item, i) => (
            <View key={i} style={[s.card, s.cardDemo]}>
              <View style={s.iconWrap}>
                <Text style={s.icon}>{item.icon}</Text>
              </View>
              <View style={s.body}>
                <Text style={s.message}>{item.text}</Text>
                <Text style={s.time}>Example notification</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing.xl },
  title: { color: Colors.text, fontSize: 24, fontWeight: "900", textTransform: "uppercase", letterSpacing: -0.5 },
  subtitle: { color: Colors.primary, fontSize: 12, fontWeight: "700", marginTop: 2 },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  markAllText: { color: Colors.muted, fontSize: 11, fontWeight: "600" },
  errorBanner: { backgroundColor: Colors.redDim, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  errorText: { color: Colors.red, fontSize: 12 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cardUnread: { borderColor: Colors.primaryBorder, backgroundColor: Colors.surface },
  cardDemo: { opacity: 0.4 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: "#ffffff08", alignItems: "center", justifyContent: "center" },
  iconWrapUnread: { backgroundColor: Colors.primaryDim },
  icon: { fontSize: 20 },
  body: { flex: 1, gap: 4 },
  message: { color: Colors.mutedLight, fontSize: 13, lineHeight: 20 },
  messageUnread: { color: Colors.text, fontWeight: "600" },
  time: { color: Colors.muted, fontSize: 11 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
  demoSection: { marginTop: Spacing.xl },
  demoLabel: { color: Colors.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: Spacing.md, textAlign: "center" },
});
