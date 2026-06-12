import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, TextInput, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator
} from "react-native";
import { apiRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Colors, Spacing, Radius } from "../theme";

export default function SupportScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing fields", "Please fill in both subject and message.");
      return;
    }
    if (!email.trim() || !name.trim()) {
      Alert.alert("Missing fields", "Please enter your name and email.");
      return;
    }
    setSending(true);
    try {
      const res = await apiRequest<{ ticket?: { referenceNumber?: string; id?: number } }>(
        "POST",
        "support/tickets",
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          category: "general",
        }
      );
      setTicketRef(res?.ticket?.referenceNumber ?? null);
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (e: any) {
      // Fallback: open WhatsApp with the ticket content
      const waText = encodeURIComponent(
        `Hi! I need support.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\n\n${message.trim()}`
      );
      Alert.alert(
        "Sending via WhatsApp",
        "We couldn't reach the support server directly. Opening WhatsApp instead.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open WhatsApp",
            onPress: () => Linking.openURL(`https://wa.me/16206123994?text=${waText}`),
          },
        ]
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
          <Text style={s.title}>Support <Text style={{ color: Colors.primary }}>Center</Text></Text>
          <Text style={s.subtitle}>We're here 24/7. Average response under 5 minutes.</Text>

          {/* WhatsApp */}
          <TouchableOpacity
            style={[s.card, { borderColor: "#25D36640" }]}
            onPress={() => Linking.openURL("https://wa.me/16206123994?text=Hi!%20I%20need%20support%20with%20my%20ORBITFUTURE%20service.")}
          >
            <View style={[s.iconWrap, { backgroundColor: "#25D36620" }]}>
              <Text style={s.cardIcon}>💬</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>WhatsApp</Text>
              <Text style={s.cardDesc}>Fastest — typically under 5 minutes</Text>
              <Text style={[s.cardLink, { color: "#25D366" }]}>+1 (620) 612-3994 →</Text>
            </View>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={s.card}
            onPress={() => Linking.openURL("mailto:support@orbitfuture.com?subject=ORBITFUTURE%20Support%20Request")}
          >
            <View style={[s.iconWrap, { backgroundColor: Colors.primaryDim }]}>
              <Text style={s.cardIcon}>📧</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>Email Support</Text>
              <Text style={s.cardDesc}>Detailed inquiries — reply within 2 hours</Text>
              <Text style={[s.cardLink, { color: Colors.primary }]}>support@orbitfuture.com →</Text>
            </View>
          </TouchableOpacity>

          {/* Hours */}
          <View style={[s.card, { borderColor: Colors.border }]}>
            <View style={[s.iconWrap, { backgroundColor: "#ffffff08" }]}>
              <Text style={s.cardIcon}>🕐</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>Support Hours</Text>
              <Text style={s.cardDesc}>WhatsApp: 24 / 7</Text>
              <Text style={s.cardDesc}>Email: 24 / 7</Text>
              <Text style={s.cardDesc}>Average response: {"<"} 5 minutes</Text>
            </View>
          </View>

          {/* Ticket form */}
          <View style={s.ticketSection}>
            <Text style={s.sectionTitle}>Submit a Ticket</Text>
            <Text style={s.sectionSub}>Our team will reply to your email address within 2 hours</Text>

            {sent ? (
              <View style={s.successCard}>
                <Text style={s.successIcon}>✅</Text>
                <Text style={s.successTitle}>Ticket Submitted!</Text>
                {ticketRef && (
                  <View style={s.refPill}>
                    <Text style={s.refText}>Ref: {ticketRef}</Text>
                  </View>
                )}
                <Text style={s.successText}>
                  Our team will respond within 2 hours. Check your email for updates.
                </Text>
                <TouchableOpacity onPress={() => { setSent(false); setTicketRef(null); }} style={s.newTicketBtn}>
                  <Text style={s.newTicketText}>Submit Another Ticket</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.formCard}>
                {!user && (
                  <>
                    <View style={s.formField}>
                      <Text style={s.formLabel}>Your Name *</Text>
                      <TextInput
                        style={s.formInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Full name"
                        placeholderTextColor={Colors.muted}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={s.formField}>
                      <Text style={s.formLabel}>Email Address *</Text>
                      <TextInput
                        style={s.formInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        placeholderTextColor={Colors.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </>
                )}
                <View style={s.formField}>
                  <Text style={s.formLabel}>Subject *</Text>
                  <TextInput
                    style={s.formInput}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="e.g. Connection issue, billing question…"
                    placeholderTextColor={Colors.muted}
                  />
                </View>
                <View style={s.formField}>
                  <Text style={s.formLabel}>Message *</Text>
                  <TextInput
                    style={[s.formInput, s.formTextarea]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Describe your issue in detail…"
                    placeholderTextColor={Colors.muted}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  style={[s.submitBtn, sending && s.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={sending}
                >
                  {sending
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={s.submitText}>Send Ticket</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick help */}
          <Text style={s.sectionTitle}>Quick Help Topics</Text>
          {[
            { icon: "⚡", topic: "Getting Started", hint: "Setup guides and first-time configuration" },
            { icon: "📡", topic: "Connection Issues", hint: "Troubleshoot speed or connectivity problems" },
            { icon: "💳", topic: "Billing & Payments", hint: "Invoices, refunds, and subscription changes" },
            { icon: "👤", topic: "Account & Dashboard", hint: "Login, profile, and subscription management" },
            { icon: "📦", topic: "Hardware & Shipping", hint: "Track your kit or report missing items" },
            { icon: "🔧", topic: "Installation Help", hint: "Step-by-step setup assistance from our team" },
          ].map(({ icon, topic, hint }) => (
            <TouchableOpacity
              key={topic}
              style={s.topicRow}
              onPress={() => { setSubject(topic); setMessage(`I need help with: ${topic}\n\n`); }}
            >
              <Text style={s.topicIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.topicTitle}>{topic}</Text>
                <Text style={s.topicHint}>{hint}</Text>
              </View>
              <Text style={{ color: Colors.muted, fontSize: 14 }}>→</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  title: { color: Colors.text, fontSize: 26, fontWeight: "900", textTransform: "uppercase", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { color: Colors.muted, fontSize: 13, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.sm, alignItems: "flex-start" },
  iconWrap: { width: 44, height: 44, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  cardIcon: { fontSize: 22 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { color: Colors.text, fontWeight: "800", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 },
  cardDesc: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  cardLink: { fontWeight: "700", fontSize: 12, marginTop: 4 },
  ticketSection: { marginTop: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { color: Colors.text, fontWeight: "900", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  sectionSub: { color: Colors.muted, fontSize: 12, marginBottom: Spacing.lg },
  successCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primaryBorder, padding: Spacing.xxl, alignItems: "center", gap: Spacing.md },
  successIcon: { fontSize: 48 },
  successTitle: { color: Colors.text, fontSize: 18, fontWeight: "900", textTransform: "uppercase" },
  refPill: { backgroundColor: Colors.primaryDim, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: Colors.primaryBorder },
  refText: { color: Colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  successText: { color: Colors.muted, fontSize: 13, textAlign: "center", lineHeight: 20 },
  newTicketBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  newTicketText: { color: Colors.muted, fontSize: 12, fontWeight: "600" },
  formCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md },
  formField: { gap: Spacing.xs },
  formLabel: { color: Colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 },
  formInput: { backgroundColor: "#111", borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.lg, paddingVertical: 14, color: Colors.text, fontSize: 14 },
  formTextarea: { height: 120, paddingTop: 14 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#000", fontWeight: "900", fontSize: 13, letterSpacing: 1.5 },
  topicRow: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.sm, alignItems: "center" },
  topicIcon: { fontSize: 22, width: 32, textAlign: "center" },
  topicTitle: { color: Colors.text, fontWeight: "700", fontSize: 13 },
  topicHint: { color: Colors.muted, fontSize: 11, marginTop: 2 },
});
