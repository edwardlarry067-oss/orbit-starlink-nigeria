import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket, Search, Clock, CheckCircle, MessageSquare,
  AlertCircle, ChevronDown, Trash2, Send, X, Filter,
  MailOpen, RefreshCw
} from "lucide-react";
import { getAdminToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";

type TicketStatus = "open" | "replied" | "resolved" | "closed";
type Priority = "low" | "normal" | "high" | "urgent";

type SupportTicket = {
  id: number;
  ticketRef: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: Priority;
  adminReply: string | null;
  adminRepliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  open:     { label: "Open",     color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30",  icon: Clock },
  replied:  { label: "Replied",  color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30",    icon: MailOpen },
  resolved: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: CheckCircle },
  closed:   { label: "Closed",   color: "text-gray-500",    bg: "bg-gray-500/10",    border: "border-gray-500/30",    icon: X },
};

const PRIORITY_CFG: Record<Priority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "text-gray-400" },
  normal: { label: "Normal", color: "text-blue-400" },
  high:   { label: "High",   color: "text-amber-400" },
  urgent: { label: "Urgent", color: "text-red-400" },
};

const STATUSES: TicketStatus[] = ["open", "replied", "resolved", "closed"];

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CFG[priority];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ReplyModal({ ticket, onClose, onSave }: {
  ticket: SupportTicket;
  onClose: () => void;
  onSave: (reply: string, status: TicketStatus) => void;
}) {
  const [reply, setReply] = useState(ticket.adminReply ?? "");
  const [status, setStatus] = useState<TicketStatus>(ticket.status === "open" ? "replied" : ticket.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-white font-black text-sm uppercase tracking-widest">Reply to Ticket</span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5 pl-6.5">{ticket.ticketRef} · {ticket.customerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Customer Message</p>
            <p className="text-sm text-gray-300 leading-relaxed">{ticket.message}</p>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Your Reply *</label>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={6}
              placeholder="Type your reply to the customer..."
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Update Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                    status === s
                      ? `${STATUS_CFG[s].color} ${STATUS_CFG[s].bg} ${STATUS_CFG[s].border}`
                      : "text-muted-foreground border-border hover:border-white/20"
                  }`}
                >
                  {STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 h-10 rounded-lg text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={() => { onSave(reply, status); onClose(); }}
            disabled={!reply.trim()}
            className="px-6 h-10 rounded-lg text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send Reply & Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTickets() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery<{ tickets: SupportTicket[]; total: number }>({
    queryKey: ["admin-support-tickets", filterStatus],
    queryFn: async () => {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const r = await fetch(getApiUrl(`admin/support/tickets${params}`), {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!r.ok) throw new Error("Failed to fetch tickets");
      return r.json();
    },
    refetchInterval: 30000,
  });

  const tickets = data?.tickets ?? [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { status?: string; adminReply?: string } }) => {
      const r = await fetch(getApiUrl(`admin/support/tickets/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Failed to update ticket");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-support-tickets"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(getApiUrl(`admin/support/tickets/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!r.ok) throw new Error("Failed to delete ticket");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-support-tickets"] }),
  });

  const filtered = tickets.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.ticketRef.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    replied: tickets.filter(t => t.status === "replied").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  return (
    <AdminLayout>
      <style>{`
        .input-base { background: rgb(255 255 255 / 0.04); border: 1px solid rgb(255 255 255 / 0.1); border-radius: 8px; padding: 0 12px; height: 40px; color: white; font-size: 13px; outline: none; transition: border-color 0.15s; }
        .input-base::placeholder { color: rgb(75 85 99); }
        .input-base:focus { border-color: rgb(0 212 255 / 0.5); }
      `}</style>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Support Tickets</h1>
            {stats.open > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                {stats.open} open
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm pl-12">Customer support requests with email reply.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="h-9 w-9 rounded-lg border border-border hover:border-white/20 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Open", value: stats.open, color: "text-yellow-400" },
          { label: "Replied", value: stats.replied, color: "text-blue-400" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-xl bg-card p-5 text-center">
            <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, subject, or ref..."
            className="input-base w-full pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", ...STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === s
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-muted-foreground border border-border hover:border-white/20 hover:text-gray-300"
              }`}
            >
              {s === "all" ? "All" : STATUS_CFG[s].label}
              {s !== "all" && (
                <span className="ml-1.5 text-muted-foreground">
                  {tickets.filter(t => t.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 border border-border rounded-xl bg-card animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-card py-20 text-center">
          <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-white font-black text-sm uppercase tracking-widest mb-2">
            {tickets.length === 0 ? "No tickets yet" : "No results found"}
          </p>
          <p className="text-muted-foreground text-xs">
            {tickets.length === 0 ? "Customer tickets appear here when submitted." : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <div key={ticket.id} className="border border-border rounded-xl bg-card overflow-hidden hover:border-white/15 transition-colors">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer flex-wrap gap-y-2"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-muted-foreground font-mono">{ticket.ticketRef}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="text-white font-bold text-sm">{ticket.subject}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{ticket.customerName} · {ticket.customerEmail}</p>
                </div>

                <StatusBadge status={ticket.status} />

                <p className="text-muted-foreground text-xs min-w-[90px] text-right">
                  {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={e => { e.stopPropagation(); setReplyTicket(ticket); }}
                    className="h-8 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    Reply
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm("Delete this ticket?")) deleteMutation.mutate(ticket.id); }}
                    className="w-8 h-8 rounded-lg border border-border hover:border-red-500/40 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === ticket.id ? "rotate-180" : ""}`} />
                </div>
              </div>

              {expanded === ticket.id && (
                <div className="border-t border-border/50 px-5 py-4 space-y-4">
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Customer Message</p>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                  </div>

                  {ticket.adminReply && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-1.5">
                        <Send className="w-3 h-3" />
                        Your Reply
                        {ticket.adminRepliedAt && (
                          <span className="text-muted-foreground ml-auto normal-case tracking-normal font-normal text-[10px]">
                            {new Date(ticket.adminRepliedAt).toLocaleString("en-GB")}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.adminReply}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold self-center mr-2">Quick status:</p>
                    {STATUSES.filter(s => s !== ticket.status).map(s => (
                      <button
                        key={s}
                        onClick={() => updateMutation.mutate({ id: ticket.id, payload: { status: s } })}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${STATUS_CFG[s].color} ${STATUS_CFG[s].bg} ${STATUS_CFG[s].border} hover:opacity-80`}
                      >
                        Mark {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {replyTicket && (
        <ReplyModal
          ticket={replyTicket}
          onClose={() => setReplyTicket(null)}
          onSave={(reply, status) => {
            updateMutation.mutate({ id: replyTicket.id, payload: { adminReply: reply, status } });
          }}
        />
      )}
    </AdminLayout>
  );
}
