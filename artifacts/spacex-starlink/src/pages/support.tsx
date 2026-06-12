import React, { useState } from "react";
import { getApiBase } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  MessageCircle, Mail, Clock, BookOpen, Zap, Shield, Wifi,
  Send, Check, AlertCircle, Search, Ticket, ChevronRight, Loader2
} from "lucide-react";

const WHATSAPP_NUMBER = "16206123994";

const TOPICS = [
  { icon: Zap, title: "Getting Started", desc: "Setup guides, unboxing, and first-time configuration.", href: "/faq" },
  { icon: Wifi, title: "Connection Issues", desc: "Troubleshoot slow speeds, disconnections, or hardware problems.", href: "/faq" },
  { icon: Shield, title: "Billing & Payments", desc: "Invoices, payment methods, refunds, and subscription changes.", href: "/faq" },
  { icon: BookOpen, title: "Account & Dashboard", desc: "Login issues, profile updates, and subscription management.", href: "/faq" },
];

const SUBJECTS = [
  "Billing / Payment Issue",
  "Connection Problem",
  "Hardware / Delivery",
  "Account / Login Issue",
  "Plan Change Request",
  "General Enquiry",
  "Other",
];

type Tab = "contact" | "ticket" | "track";

type TicketState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "success"; ref: string; subject: string }
  | { phase: "error"; message: string };

type TrackedTicket = {
  id: number;
  ticketRef: string;
  subject: string;
  status: string;
  adminReply: string | null;
  adminRepliedAt: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  open:     { label: "Open — awaiting reply",  color: "text-yellow-400" },
  replied:  { label: "Replied by support",      color: "text-blue-400" },
  resolved: { label: "Resolved",               color: "text-emerald-400" },
  closed:   { label: "Closed",                 color: "text-gray-400" },
};

export default function Support() {
  const [activeTab, setActiveTab] = useState<Tab>("contact");

  // ── Ticket form state ──────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [ticketState, setTicketState] = useState<TicketState>({ phase: "idle" });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketState({ phase: "submitting" });
    try {
      const res = await fetch(`${getApiBase()}/api/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          subject: form.subject,
          message: form.message,
          priority: "normal",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit ticket");
      setTicketState({ phase: "success", ref: data.ticket.ticketRef, subject: data.ticket.subject });
      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    } catch (err: any) {
      setTicketState({ phase: "error", message: err.message ?? "Something went wrong. Please try again." });
    }
  };

  // ── Track ticket state ─────────────────────────────────────────────────────
  const [trackQuery, setTrackQuery] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackedTickets, setTrackedTickets] = useState<TrackedTicket[] | null>(null);
  const [trackError, setTrackError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackQuery.trim();
    if (!q) return;
    setTrackLoading(true);
    setTrackError("");
    setTrackedTickets(null);
    try {
      const isRef = /^ORB-/i.test(q);
      const param = isRef ? `ref=${encodeURIComponent(q.toUpperCase())}` : `email=${encodeURIComponent(q)}`;
      const res = await fetch(`${getApiBase()}/api/support/tickets?${param}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch tickets");
      setTrackedTickets(data.tickets ?? []);
    } catch (err: any) {
      setTrackError(err.message ?? "Something went wrong.");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Support <span className="text-primary">Center</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Get help fast — chat on WhatsApp, submit a ticket, or track an existing request.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-10 bg-white/4 border border-border rounded-xl p-1 max-w-md mx-auto">
            {[
              { id: "contact" as Tab, label: "Contact Us", icon: MessageCircle },
              { id: "ticket"  as Tab, label: "Open Ticket", icon: Ticket },
              { id: "track"   as Tab, label: "Track Ticket", icon: Search },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === id
                    ? "bg-primary text-black shadow"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Contact Us ─────────────────────────────────────────────── */}
          {activeTab === "contact" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need support with my OrbitFuture service.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border border-border rounded-2xl p-8 hover:border-[#25D366]/40 transition-colors group text-center"
                >
                  <MessageCircle className="w-10 h-10 text-[#25D366] mx-auto mb-4" />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">WhatsApp</h3>
                  <p className="text-gray-500 text-xs mb-4">Fastest response — typically under 5 minutes</p>
                  <span className="text-[#25D366] text-xs font-bold uppercase tracking-widest group-hover:underline">Start Chat →</span>
                </a>

                <a
                  href="mailto:support@orbitfuture.store?subject=OrbitFuture%20Support"
                  className="bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-colors group text-center"
                >
                  <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Email</h3>
                  <p className="text-gray-500 text-xs mb-4">Detailed inquiries — reply within 2 hours</p>
                  <span className="text-primary text-xs font-bold uppercase tracking-widest group-hover:underline">support@orbitfuture.store →</span>
                </a>

                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <Clock className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Support Hours</h3>
                  <p className="text-gray-500 text-xs mb-1">WhatsApp: 24 / 7</p>
                  <p className="text-gray-500 text-xs mb-1">Email: 24 / 7</p>
                  <p className="text-gray-500 text-xs">Average response: &lt; 5 min</p>
                </div>
              </div>

              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Browse by Topic</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                {TOPICS.map(({ icon: Icon, title, desc, href }) => (
                  <Link key={title} href={href}>
                    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors flex items-start gap-4 cursor-pointer">
                      <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center bg-card border border-border rounded-2xl p-10">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Prefer a formal ticket?</h3>
                <p className="text-gray-400 text-sm mb-6">Submit a support ticket and we'll track it from open to resolved.</p>
                <Button
                  onClick={() => setActiveTab("ticket")}
                  className="h-11 px-8 text-xs font-bold uppercase tracking-widest"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Open a Ticket
                </Button>
              </div>
            </>
          )}

          {/* ── Tab: Open Ticket ────────────────────────────────────────────── */}
          {activeTab === "ticket" && (
            <div className="max-w-xl mx-auto">
              {ticketState.phase === "success" ? (
                <div className="border border-emerald-400/20 bg-emerald-400/5 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-black text-xl uppercase tracking-tight mb-2">Ticket Submitted!</h3>
                  <p className="text-gray-400 text-sm mb-3">{ticketState.subject}</p>
                  <div className="inline-block bg-black/40 border border-white/10 rounded-xl px-6 py-3 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Your ticket reference</p>
                    <p className="text-primary font-black text-lg font-mono tracking-widest">{ticketState.ref}</p>
                  </div>
                  <p className="text-gray-500 text-xs mb-6">Save this reference. We'll reply to your email within 2 hours.<br />You can also track your ticket status above.</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setTicketState({ phase: "idle" })} className="border-white/15 text-xs uppercase tracking-widest">
                      Submit Another
                    </Button>
                    <Button size="sm" onClick={() => { setTrackQuery(ticketState.ref); setActiveTab("track"); }} className="text-xs uppercase tracking-widest">
                      <Search className="w-3.5 h-3.5 mr-1.5" />
                      Track This Ticket
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-white font-black uppercase tracking-tight text-xl">Open a Support Ticket</h2>
                    <p className="text-gray-500 text-xs mt-1">We'll reply to your email and track progress until resolved.</p>
                  </div>

                  {ticketState.phase === "error" && (
                    <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-400 text-xs">{ticketState.message}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Your Name", placeholder: "Full name", type: "text", required: true },
                      { key: "email", label: "Email Address", placeholder: "your@email.com", type: "email", required: true },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">{f.label}</label>
                        <input
                          type={f.type}
                          required={f.required}
                          placeholder={f.placeholder}
                          value={(form as any)[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    >
                      {SUBJECTS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe your issue in detail — include your subscription reference (#ORB-...) if relevant."
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-xs font-black uppercase tracking-widest"
                    disabled={ticketState.phase === "submitting"}
                  >
                    {ticketState.phase === "submitting" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Submit Ticket</>
                    )}
                  </Button>
                  <p className="text-[10px] text-gray-600 text-center">
                    You'll receive a confirmation reference you can use to track progress.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* ── Tab: Track Ticket ───────────────────────────────────────────── */}
          {activeTab === "track" && (
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-white font-black uppercase tracking-tight text-xl">Track Your Ticket</h2>
                <p className="text-gray-500 text-xs mt-1">Enter your ticket reference (e.g. ORB-AB12CD34) or email address.</p>
              </div>

              <form onSubmit={handleTrack} className="flex gap-2 mb-6">
                <input
                  value={trackQuery}
                  onChange={e => setTrackQuery(e.target.value)}
                  placeholder="ORB-XXXXXXXX or your@email.com"
                  className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <Button type="submit" disabled={trackLoading} className="h-11 px-5 text-xs font-black uppercase tracking-widest">
                  {trackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </form>

              {trackError && (
                <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl p-4 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-400 text-xs">{trackError}</p>
                </div>
              )}

              {trackedTickets !== null && trackedTickets.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <p className="text-white font-black text-sm uppercase tracking-widest mb-1">No tickets found</p>
                  <p className="text-gray-500 text-xs">No support tickets matched that reference or email address.</p>
                </div>
              )}

              {trackedTickets && trackedTickets.length > 0 && (
                <div className="space-y-4">
                  {trackedTickets.map(t => {
                    const sCfg = STATUS_LABEL[t.status] ?? { label: t.status, color: "text-gray-400" };
                    return (
                      <div key={t.id} className="border border-border rounded-xl bg-card overflow-hidden">
                        <div className="px-5 py-4 flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-black text-muted-foreground font-mono tracking-widest">{t.ticketRef}</span>
                            </div>
                            <p className="text-white font-bold text-sm mb-1">{t.subject}</p>
                            <p className={`text-xs font-bold ${sCfg.color}`}>{sCfg.label}</p>
                            <p className="text-muted-foreground text-xs mt-1">
                              Submitted {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        {t.adminReply && (
                          <div className="border-t border-border/50 bg-primary/3 px-5 py-4">
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-1.5">
                              <MessageCircle className="w-3 h-3" />
                              Support Reply
                              {t.adminRepliedAt && (
                                <span className="ml-auto text-gray-600 normal-case tracking-normal font-normal text-[10px]">
                                  {new Date(t.adminRepliedAt).toLocaleDateString("en-GB")}
                                </span>
                              )}
                            </p>
                            <p className="text-gray-300 text-sm leading-relaxed">{t.adminReply}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
