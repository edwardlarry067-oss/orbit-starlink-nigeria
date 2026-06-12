import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header row */}
      <View style={s.topRow}>
        <View>
          <Text style={s.logo}>⬤ ORBIT<Text style={s.logoAccent}>FUTURE</Text></Text>
          <Text style={s.logoTagline}>Satellite Internet · Worldwide</Text>
        </View>
        <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate("Notifications")}>
          <Text style={s.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>🛰️  Now Available Worldwide · 100+ Countries</Text>
        </View>
        <Text style={s.heroTitle}>Internet{"\n"}<Text style={s.accent}>Anywhere.</Text></Text>
        <Text style={s.heroSub}>
          Fast satellite internet powered by Starlink technology.{"\n"}
          Installation support, secure checkout, and global coverage.
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate("Plans")}>
          <Text style={s.primaryBtnText}>⚡  Order Starlink Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate("Support")}>
          <Text style={s.secondaryBtnText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Trust indicators */}
      <View style={s.trustBar}>
        {["🔒 Secure Payments", "🛡️ SSL Protected", "📞 24/7 Support", "✅ Verified Checkout", "🌍 Global Coverage"].map(t => (
          <View key={t} style={s.trustChip}>
            <Text style={s.trustText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        {[["4M+", "Subscribers"], ["100+", "Countries"], ["1 Gbps", "Max Speed"], ["99.9%", "Uptime SLA"]].map(([v, l]) => (
          <View key={l} style={s.stat}>
            <Text style={s.statVal}>{v}</Text>
            <Text style={s.statLabel}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <Text style={s.sectionTitle}>Why ORBITFUTURE?</Text>
      {[
        { icon: "⚡", title: "Ultra-Fast Speeds", desc: "Up to 1 Gbps download with low latency for gaming, streaming, and video calls." },
        { icon: "🌍", title: "Global Coverage", desc: "Available in 100+ countries. Perfect for rural areas, maritime, and aviation." },
        { icon: "🛡️", title: "Always Reliable", desc: "99.9% uptime SLA with redundant satellite coverage ensures you stay connected." },
        { icon: "📦", title: "Hardware Included", desc: "Complete hardware kit with dish, router, and 15-minute setup guide included." },
        { icon: "🔧", title: "Installation Support", desc: "Our team guides you through setup step-by-step, remotely or on-site." },
        { icon: "📞", title: "24/7 Support", desc: "Reach our team anytime via WhatsApp, email, or in-app support tickets." },
      ].map(({ icon, title, desc }) => (
        <View key={title} style={s.featureCard}>
          <View style={s.featureIconWrap}><Text style={s.featureIcon}>{icon}</Text></View>
          <View style={s.featureBody}>
            <Text style={s.featureTitle}>{title}</Text>
            <Text style={s.featureDesc}>{desc}</Text>
          </View>
        </View>
      ))}

      {/* Testimonials */}
      <Text style={s.sectionTitle}>What Customers Say</Text>
      {[
        { name: "James O.", location: "Nigeria", rating: 5, text: "Finally have reliable internet in my rural community. Setup was incredibly easy and the team was very helpful." },
        { name: "Maria S.", location: "Brazil", rating: 5, text: "Been using ORBITFUTURE for 3 months — speeds are consistently great. Customer support responds within minutes!" },
        { name: "Ahmed K.", location: "Kenya", rating: 5, text: "The hardware kit arrived quickly and setup took under 20 minutes. Excellent service from start to finish." },
      ].map(({ name, location, rating, text }) => (
        <View key={name} style={s.testimonialCard}>
          <View style={s.testimonialHeader}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.testimonialName}>{name}</Text>
              <Text style={s.testimonialLocation}>📍 {location}</Text>
            </View>
            <Text style={s.stars}>{"★".repeat(rating)}</Text>
          </View>
          <Text style={s.testimonialText}>"{text}"</Text>
        </View>
      ))}

      {/* CTA */}
      <View style={s.ctaCard}>
        <Text style={s.ctaTitle}>Ready to Connect?</Text>
        <Text style={s.ctaSub}>Join 4 million+ subscribers worldwide</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate("Plans")}>
          <Text style={s.primaryBtnText}>View All Plans →</Text>
        </TouchableOpacity>
      </View>

      {/* WhatsApp */}
      <TouchableOpacity
        style={s.waBtn}
        onPress={() => Linking.openURL("https://wa.me/16206123994?text=Hi!%20I%27m%20interested%20in%20ORBITFUTURE.")}
      >
        <Text style={s.waBtnText}>💬  Chat on WhatsApp — Fastest Response</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.xl },
  logo: { fontSize: 18, fontWeight: "900", color: Colors.text, letterSpacing: 2 },
  logoAccent: { color: Colors.primary },
  logoTagline: { color: Colors.muted, fontSize: 10, marginTop: 2, letterSpacing: 1.5 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  notifIcon: { fontSize: 18 },
  hero: { alignItems: "center", paddingVertical: Spacing.xxl },
  heroBadge: { backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6, marginBottom: Spacing.lg },
  heroBadgeText: { color: Colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  heroTitle: { color: Colors.text, fontSize: 56, fontWeight: "900", textTransform: "uppercase", textAlign: "center", letterSpacing: -2, lineHeight: 58, marginBottom: Spacing.md },
  accent: { color: Colors.primary },
  heroSub: { color: Colors.muted, fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: Spacing.xxl, paddingHorizontal: 8 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center", marginBottom: Spacing.sm },
  primaryBtnText: { color: "#000", fontWeight: "900", fontSize: 14, letterSpacing: 1.5 },
  secondaryBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  secondaryBtnText: { color: Colors.muted, fontWeight: "700", fontSize: 13, letterSpacing: 1.5 },
  trustBar: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xxl, justifyContent: "center" },
  trustChip: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 5 },
  trustText: { color: Colors.muted, fontSize: 10, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 1, backgroundColor: Colors.border, borderRadius: Radius.lg, overflow: "hidden", marginBottom: Spacing.xxl },
  stat: { flex: 1, minWidth: "48%", alignItems: "center", paddingVertical: Spacing.lg, backgroundColor: Colors.card },
  statVal: { color: Colors.text, fontSize: 24, fontWeight: "900" },
  statLabel: { color: Colors.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: "900", textTransform: "uppercase", letterSpacing: -0.5, marginBottom: Spacing.lg, marginTop: Spacing.sm },
  featureCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, flexDirection: "row", alignItems: "flex-start", gap: Spacing.md, marginBottom: Spacing.sm },
  featureIconWrap: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder, alignItems: "center", justifyContent: "center" },
  featureIcon: { fontSize: 22 },
  featureBody: { flex: 1 },
  featureTitle: { color: Colors.text, fontWeight: "800", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  featureDesc: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  testimonialCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, marginBottom: Spacing.sm },
  testimonialHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.primary, fontWeight: "900", fontSize: 18 },
  testimonialName: { color: Colors.text, fontWeight: "800", fontSize: 14 },
  testimonialLocation: { color: Colors.muted, fontSize: 11 },
  stars: { color: "#fbbf24", fontSize: 14 },
  testimonialText: { color: Colors.mutedLight, fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  ctaCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primaryBorder, padding: Spacing.xxl, alignItems: "center", gap: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  ctaTitle: { color: Colors.text, fontSize: 22, fontWeight: "900", textTransform: "uppercase", textAlign: "center", letterSpacing: -0.5 },
  ctaSub: { color: Colors.muted, fontSize: 13, marginBottom: Spacing.sm },
  waBtn: { backgroundColor: "#25D36620", borderWidth: 1, borderColor: "#25D36640", borderRadius: Radius.lg, paddingVertical: 18, alignItems: "center" },
  waBtnText: { color: "#25D366", fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
});
