import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Search, Mail, Phone, MapPin, Calendar,
  Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  UserCheck, UserX, Shield, Download
} from "lucide-react";
import { getAdminToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";

type User = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptionCount: number;
  walletBalance: number;
};

type SortKey = "name" | "email" | "createdAt" | "subscriptionCount";
type SortDir = "asc" | "desc";

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="border border-border rounded-xl bg-card p-5 text-center">
      <p className={`text-2xl font-black tracking-tighter ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showEmails, setShowEmails] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const r = await fetch(getApiUrl("admin/users"), {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!r.ok) throw new Error("Failed to fetch users");
      return r.json();
    },
    refetchInterval: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(getApiUrl(`admin/users/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!r.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = users
    .filter(u => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q)
      );
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey] ?? "";
      let bv: string | number = b[sortKey] ?? "";
      if (typeof av === "string" && typeof bv === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const stats = {
    total: users.length,
    withSubs: users.filter(u => u.subscriptionCount > 0).length,
    noSubs: users.filter(u => u.subscriptionCount === 0).length,
    walletTotal: users.reduce((s, u) => s + u.walletBalance, 0),
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortDir === "asc"
        ? <ChevronUp className="w-3 h-3 inline ml-1" />
        : <ChevronDown className="w-3 h-3 inline ml-1" />
      : null;

  const exportCsv = () => {
    const rows = [
      ["ID", "Name", "Email", "Phone", "Address", "Subscriptions", "Wallet ($)", "Joined"],
      ...filtered.map(u => [
        u.id, u.name, u.email, u.phone ?? "", u.address ?? "",
        u.subscriptionCount, (u.walletBalance / 100).toFixed(2),
        new Date(u.createdAt).toLocaleDateString("en-GB"),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbitfuture-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <style>{`
        .input-base { background: rgb(255 255 255 / 0.04); border: 1px solid rgb(255 255 255 / 0.1); border-radius: 8px; padding: 0 12px; height: 40px; color: white; font-size: 13px; outline: none; transition: border-color 0.15s; }
        .input-base::placeholder { color: rgb(75 85 99); }
        .input-base:focus { border-color: rgb(0 212 255 / 0.5); }
        .th-btn { background: none; border: none; color: inherit; cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 0; display: inline-flex; align-items: center; gap: 2px; }
        .th-btn:hover { color: white; }
      `}</style>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Users</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-12">All registered ORBITFUTURE accounts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmails(e => !e)}
            className="h-10 px-4 rounded-lg border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:border-white/20 transition-colors flex items-center gap-2"
          >
            {showEmails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showEmails ? "Hide" : "Show"} Emails
          </button>
          <button
            onClick={exportCsv}
            className="h-10 px-4 rounded-lg bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.total} color="text-white" />
        <StatCard label="Subscribed" value={stats.withSubs} color="text-emerald-400" />
        <StatCard label="No Subscription" value={stats.noSubs} color="text-yellow-400" />
        <StatCard label="Wallet Funds" value={`$${(stats.walletTotal / 100).toFixed(0)}`} color="text-primary" />
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="input-base w-full pl-9"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/3 border-b border-border">
              <tr>
                <th className="px-5 py-3 text-left">
                  <button className="th-btn text-muted-foreground" onClick={() => toggleSort("name")}>
                    Name <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button className="th-btn text-muted-foreground" onClick={() => toggleSort("email")}>
                    Email <SortIcon col="email" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left hidden md:table-cell">
                  <span className="th-btn text-muted-foreground cursor-default">Phone</span>
                </th>
                <th className="px-5 py-3 text-center">
                  <button className="th-btn text-muted-foreground" onClick={() => toggleSort("subscriptionCount")}>
                    Subs <SortIcon col="subscriptionCount" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">
                  <button className="th-btn text-muted-foreground" onClick={() => toggleSort("createdAt")}>
                    Joined <SortIcon col="createdAt" />
                  </button>
                </th>
                <th className="px-5 py-3 text-right">
                  <span className="th-btn text-muted-foreground cursor-default">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-white font-black text-sm uppercase tracking-widest mb-1">
                      {users.length === 0 ? "No users yet" : "No results"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {users.length === 0 ? "Accounts appear here once someone registers." : "Try a different search."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <React.Fragment key={user.id}>
                    <tr
                      className={`border-b border-border/50 hover:bg-white/3 transition-colors cursor-pointer ${expandedId === user.id ? "bg-white/3" : ""}`}
                      onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-black text-primary uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-white font-bold text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        {showEmails ? (
                          <a href={`mailto:${user.email}`} className="text-primary hover:underline font-mono text-xs" onClick={e => e.stopPropagation()}>
                            {user.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">
                            {user.email.replace(/(.{2}).*(@.*)/, "$1••••$2")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground text-xs">
                        {user.phone ? (
                          <a href={`tel:${user.phone}`} className="hover:text-white transition-colors flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </a>
                        ) : (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          user.subscriptionCount > 0
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
                            : "text-muted-foreground bg-white/3 border-border"
                        }`}>
                          {user.subscriptionCount > 0
                            ? <><UserCheck className="w-3 h-3" />{user.subscriptionCount}</>
                            : <><UserX className="w-3 h-3" />0</>
                          }
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete ${user.name}'s account? This cannot be undone.`)) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          className="w-8 h-8 rounded-lg border border-border hover:border-red-500/40 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors ml-auto"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expandedId === user.id && (
                      <tr className="border-b border-border/50 bg-white/2">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Full Email</p>
                              <p className="text-white font-mono">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                              <p className="text-white">{user.phone || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Address
                              </p>
                              <p className="text-white">{user.address || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Wallet Balance
                              </p>
                              <p className="text-white font-black text-sm text-primary">
                                ${(user.walletBalance / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-white/2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-white font-bold">{filtered.length}</span> of <span className="text-white font-bold">{users.length}</span> users
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Click any row to expand details
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
