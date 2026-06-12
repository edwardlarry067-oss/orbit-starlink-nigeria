import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle, Plus, X, Check, Clock, Package, Truck,
  CheckCircle, XCircle, Edit2, Trash2, Phone, Mail,
  CreditCard, Banknote, Coins, ChevronDown, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";

type PaymentMethod = "paystack" | "wallet";
type PaymentStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  planName: string;
  planPrice: string;
  hardwarePrice?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30",  icon: Clock },
  paid:      { label: "Paid",      color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: Check },
  shipped:   { label: "Shipped",   color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30",    icon: Truck },
  delivered: { label: "Delivered", color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/30",     icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30",     icon: XCircle },
};

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; color: string; icon: React.ElementType }> = {
  paystack: { label: "Paystack",      color: "text-[#00c3f7]", icon: Banknote },
  wallet:   { label: "Orbit Wallet",  color: "text-amber-400", icon: Coins },
};

const ALL_PLANS = [
  "Residential", "Priority", "Business",
  "Roam", "Maritime Standard", "Maritime Priority",
  "Business Standard", "Business Priority", "Enterprise",
];

const EMPTY_FORM = {
  customerName: "", customerPhone: "", customerEmail: "",
  planName: "Residential", planPrice: "120", hardwarePrice: "599",
  paymentMethod: "paystack" as PaymentMethod,
  paymentStatus: "pending" as PaymentStatus,
  address: "", notes: "",
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const cfg = PAYMENT_CONFIG[method];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function OrderFormModal({
  open, onClose, initial, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<typeof EMPTY_FORM>;
  onSave: (data: typeof EMPTY_FORM) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span className="text-white font-black text-sm uppercase tracking-widest">
              {initial ? "Edit Order" : "Log New Order"}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer Name *" value={form.customerName} onChange={v => set("customerName", v)} placeholder="John Adeyemi" />
            <Field label="WhatsApp / Phone *" value={form.customerPhone} onChange={v => set("customerPhone", v)} placeholder="+234 800 000 0000" />
          </div>
          <Field label="Email" value={form.customerEmail} onChange={v => set("customerEmail", v)} placeholder="john@example.com" />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="field-label">Plan *</label>
              <select value={form.planName} onChange={e => set("planName", e.target.value)}
                className="select-input w-full">
                {ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Field label="Price/mo ($) *" value={form.planPrice} onChange={v => set("planPrice", v)} placeholder="120" type="number" />
            <Field label="Hardware ($)" value={form.hardwarePrice} onChange={v => set("hardwarePrice", v)} placeholder="599" type="number" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value as PaymentMethod)}
                className="select-input w-full">
                <option value="paystack">Paystack</option>
                <option value="wallet">Orbit Wallet</option>
              </select>
            </div>
            <div>
              <label className="field-label">Status</label>
              <select value={form.paymentStatus} onChange={e => set("paymentStatus", e.target.value as PaymentStatus)}
                className="select-input w-full">
                {(Object.keys(STATUS_CONFIG) as PaymentStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          <Field label="Delivery Address" value={form.address} onChange={v => set("address", v)} placeholder="Street, City, Country" />
          <div>
            <label className="field-label">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={2} placeholder="Any special notes or follow-up reminders..."
              className="input-base w-full resize-none" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-5 h-10 rounded-lg text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            disabled={!form.customerName || !form.customerPhone || !form.planName || !form.planPrice}
            className="px-6 h-10 rounded-lg text-xs font-black uppercase tracking-widest bg-[#25D366] hover:bg-[#20b858] text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {initial ? "Save Changes" : "Log Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base w-full" />
    </div>
  );
}

const STATUSES: PaymentStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">("all");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["whatsapp-orders"],
    queryFn: async () => {
      const r = await fetch(getApiUrl("admin/whatsapp-orders"));
      if (!r.ok) throw new Error("Failed to fetch orders");
      return r.json();
    },
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof EMPTY_FORM) => {
      const r = await fetch(getApiUrl("admin/whatsapp-orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          planPrice: parseFloat(data.planPrice),
          hardwarePrice: data.hardwarePrice ? parseFloat(data.hardwarePrice) : undefined,
        }),
      });
      if (!r.ok) throw new Error("Failed to create order");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-orders"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof EMPTY_FORM> }) => {
      const r = await fetch(getApiUrl(`admin/whatsapp-orders/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          planPrice: data.planPrice ? parseFloat(data.planPrice) : undefined,
          hardwarePrice: data.hardwarePrice ? parseFloat(data.hardwarePrice) : undefined,
        }),
      });
      if (!r.ok) throw new Error("Failed to update order");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(getApiUrl(`admin/whatsapp-orders/${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete order");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-orders"] }),
  });

  const quickStatus = (id: number, status: PaymentStatus) =>
    updateMutation.mutate({ id, data: { paymentStatus: status } });

  const filtered = orders.filter(o => {
    const matchesSearch = search === "" ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.planName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.paymentStatus === "pending").length,
    paid: orders.filter(o => o.paymentStatus === "paid").length,
    revenue: orders.filter(o => ["paid", "shipped", "delivered"].includes(o.paymentStatus))
      .reduce((sum, o) => sum + parseFloat(o.planPrice), 0),
  };

  return (
    <AdminLayout>
      <style>{`
        .field-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: rgb(107 114 128); margin-bottom: 6px; }
        .input-base { background: rgb(255 255 255 / 0.04); border: 1px solid rgb(255 255 255 / 0.1); border-radius: 8px; padding: 0 12px; height: 40px; color: white; font-size: 13px; outline: none; transition: border-color 0.15s; }
        .input-base::placeholder { color: rgb(75 85 99); }
        .input-base:focus { border-color: rgb(37 211 102 / 0.5); }
        .select-input { background: rgb(255 255 255 / 0.04); border: 1px solid rgb(255 255 255 / 0.1); border-radius: 8px; padding: 0 12px; height: 40px; color: white; font-size: 13px; outline: none; }
        .select-input option { background: #111; }
        textarea.input-base { height: auto; padding: 10px 12px; }
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#25D366]" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Order Tracker</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-12">Log and manage every WhatsApp order in one place.</p>
        </div>
        <Button
          onClick={() => { setEditOrder(null); setModalOpen(true); }}
          className="h-10 px-5 bg-[#25D366] hover:bg-[#20b858] text-black text-xs font-black uppercase tracking-widest gap-2"
        >
          <Plus className="w-4 h-4" />
          Log New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, color: "text-white" },
          { label: "Pending Payment", value: stats.pending, color: "text-yellow-400" },
          { label: "Paid / Active", value: stats.paid, color: "text-emerald-400" },
          { label: "Revenue Logged", value: `$${stats.revenue.toLocaleString()}`, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-xl bg-card p-5 text-center">
            <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, or plan..."
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
              {s === "all" ? "All" : STATUS_CONFIG[s].label}
              {s !== "all" && (
                <span className="ml-1.5 text-muted-foreground">
                  {orders.filter(o => o.paymentStatus === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 border border-border rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-card py-20 text-center">
          <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-white font-black text-sm uppercase tracking-widest mb-2">
            {orders.length === 0 ? "No orders yet" : "No results found"}
          </p>
          <p className="text-muted-foreground text-xs">
            {orders.length === 0
              ? "When a customer messages you on WhatsApp, log their order here."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              onEdit={() => { setEditOrder(order); setModalOpen(true); }}
              onDelete={() => deleteMutation.mutate(order.id)}
              onStatusChange={status => quickStatus(order.id, status)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <OrderFormModal
        open={modalOpen && !editOrder}
        onClose={() => setModalOpen(false)}
        onSave={data => createMutation.mutate(data)}
      />
      {editOrder && (
        <OrderFormModal
          open={modalOpen && !!editOrder}
          onClose={() => { setModalOpen(false); setEditOrder(null); }}
          initial={{
            customerName: editOrder.customerName,
            customerPhone: editOrder.customerPhone,
            customerEmail: editOrder.customerEmail || "",
            planName: editOrder.planName,
            planPrice: editOrder.planPrice,
            hardwarePrice: editOrder.hardwarePrice || "",
            paymentMethod: editOrder.paymentMethod,
            paymentStatus: editOrder.paymentStatus,
            address: editOrder.address || "",
            notes: editOrder.notes || "",
          }}
          onSave={data => updateMutation.mutate({ id: editOrder.id, data })}
        />
      )}
    </AdminLayout>
  );
}

function OrderRow({ order, onEdit, onDelete, onStatusChange }: {
  order: Order;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: PaymentStatus) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const total = parseFloat(order.planPrice) + (order.hardwarePrice ? parseFloat(order.hardwarePrice) : 0);
  const date = new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden hover:border-white/15 transition-colors">
      <div className="flex items-center gap-4 px-5 py-4 flex-wrap gap-y-3">

        {/* Customer info */}
        <div className="flex-1 min-w-[180px]">
          <p className="text-white font-black text-sm">{order.customerName}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#25D366] text-xs hover:underline">
              <Phone className="w-3 h-3" />
              {order.customerPhone}
            </a>
            {order.customerEmail && (
              <span className="flex items-center gap-1 text-gray-500 text-xs">
                <Mail className="w-3 h-3" />
                {order.customerEmail}
              </span>
            )}
          </div>
        </div>

        {/* Plan + amount */}
        <div className="min-w-[140px]">
          <p className="text-white font-bold text-sm">{order.planName}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            ${parseFloat(order.planPrice)}/mo
            {order.hardwarePrice && ` + $${parseFloat(order.hardwarePrice)} hw`}
          </p>
        </div>

        {/* Payment method */}
        <div className="min-w-[110px]">
          <PaymentBadge method={order.paymentMethod} />
        </div>

        {/* Status with quick-change dropdown */}
        <div className="relative">
          <button onClick={() => setShowStatusMenu(s => !s)} className="flex items-center gap-1.5">
            <StatusBadge status={order.paymentStatus} />
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
              {STATUSES.map(s => (
                <button key={s} onClick={() => { onStatusChange(s); setShowStatusMenu(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors ${STATUS_CONFIG[s].color}`}>
                  {React.createElement(STATUS_CONFIG[s].icon, { className: "w-3.5 h-3.5" })}
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <p className="text-muted-foreground text-xs min-w-[90px] text-right">{date}</p>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={onEdit}
            className="w-8 h-8 rounded-lg border border-border hover:border-white/20 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 rounded-lg border border-border hover:border-red-500/40 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {order.notes && (
        <div className="px-5 pb-3 -mt-1">
          <p className="text-[11px] text-gray-500 bg-white/2 border border-white/5 rounded-lg px-3 py-2">
            📝 {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}
