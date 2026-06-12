import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const SAMPLE_MESSAGE = `🛰️ *STARLINK — ORDER REQUEST*

Hello! I'd like to place an order for the following plan:

━━━━━━━━━━━━━━━━━━━━━
📦 *Plan:* OrbitFuture Residential
💰 *Monthly Cost:* $120/mo
🔧 *Hardware Kit:* $599 (one-time fee)
⚡ *Speed:* 100-200 Mbps

✅ *What's Included:*
• Unlimited data
• 24/7 priority support

━━━━━━━━━━━━━━━━━━━━━
💳 *Preferred Payment Method:*
Stripe (Visa / Mastercard / Apple Pay / Google Pay)

Please confirm my order and send payment instructions.

Thank you! 🌐`;

const WEBHOOK_PATH = "/webhook/whatsapp";

const STEPS = [
  {
    num: 1,
    title: "Create a Twilio account",
    body: (
      <>
        Go to{" "}
        <a href="https://twilio.com" target="_blank" rel="noopener noreferrer"
          className="text-cyan-400 underline underline-offset-2">
          twilio.com
        </a>{" "}
        and sign up. Then activate the <strong>WhatsApp Sandbox</strong> under
        Messaging → Try it out → Send a WhatsApp message, or use a verified
        business number.
      </>
    ),
  },
  {
    num: 2,
    title: "Copy your Twilio credentials",
    body: "In your Twilio Console, copy the Account SID and Auth Token. Add them as environment secrets: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
  },
  {
    num: 3,
    title: "Set the webhook URL in Twilio",
    body: (
      <>
        In your Twilio WhatsApp Sandbox (or phone number settings), paste the
        webhook URL shown below into the <strong>"When a message comes in"</strong>{" "}
        field and set the method to <strong>HTTP POST</strong>.
      </>
    ),
  },
  {
    num: 4,
    title: "Set your WhatsApp number in Replit env",
    body: 'Add TWILIO_WHATSAPP_FROM as an environment secret — this is your Twilio WhatsApp number in the format "whatsapp:+16206123994".',
  },
];

interface ParseResult {
  isOrderRequest: boolean;
  customerName: string | null;
  customerPhone: string;
  planName: string | null;
  planPrice: string | null;
  hardwarePrice: string | null;
  paymentMethod: string;
}

export default function WhatsAppBot() {
  const qc = useQueryClient();
  const [testBody, setTestBody] = useState(SAMPLE_MESSAGE);
  const [testFrom, setTestFrom] = useState("whatsapp:+15550001234");
  const [testName, setTestName] = useState("Jane Doe");
  const [testResult, setTestResult] = useState<ParseResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [createOrder, setCreateOrder] = useState(false);

  const apiBase = (() => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${base}`;
  })();

  const webhookUrl = `${apiBase}${WEBHOOK_PATH}`;

  async function runTest() {
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    try {
      const r = await fetch(getApiUrl("admin/whatsapp-webhook/test-parse"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: testBody, from: testFrom, profileName: testName }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setTestResult(data);
      if (createOrder && data.isOrderRequest && data.planName) {
        await fetch(getApiUrl("admin/whatsapp-orders"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            planName: data.planName,
            planPrice: data.planPrice ?? 0,
            hardwarePrice: data.hardwarePrice,
            paymentMethod: data.paymentMethod,
            paymentStatus: "pending",
            notes: "Test order created from WhatsApp Bot admin panel.",
          }),
        });
        qc.invalidateQueries({ queryKey: ["whatsapp-orders"] });
      }
    } catch (e: unknown) {
      setTestError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setTestLoading(false);
    }
  }

  const pmColor = (pm: string) =>
    pm === "stripe" ? "bg-violet-500/20 text-violet-300" :
    pm === "paystack" ? "bg-emerald-500/20 text-emerald-300" :
    "bg-yellow-500/20 text-yellow-300";

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Order Capture Bot</h1>
          <p className="text-gray-400 mt-1">
            Auto-detects incoming "Order Request" messages and saves them to the Order Tracker — no manual entry needed.
          </p>
        </div>

        {/* Webhook URL card */}
        <section className="bg-[#0b1120] border border-cyan-500/30 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            🔗 Your Webhook URL
          </h2>
          <p className="text-sm text-gray-400">Paste this into Twilio's "When a message comes in" field:</p>
          <div className="flex items-center gap-3 bg-[#060d1a] border border-gray-700 rounded-lg px-4 py-3">
            <code className="flex-1 text-sm text-green-400 break-all">{webhookUrl}</code>
            <button
              onClick={() => navigator.clipboard.writeText(webhookUrl)}
              className="shrink-0 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500">HTTP Method: <span className="text-white font-mono">POST</span></p>
        </section>

        {/* Setup steps */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Setup Guide</h2>
          <div className="space-y-3">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-4 bg-[#0b1120] border border-gray-800 rounded-xl p-5">
                <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold flex items-center justify-center">
                  {step.num}
                </div>
                <div>
                  <p className="text-white font-medium">{step.title}</p>
                  <p className="text-gray-400 text-sm mt-1">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#0b1120] border border-gray-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">How it works</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-cyan-400">→</span>
              Customer clicks "Order via WhatsApp" on your site — a pre-filled message opens.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">→</span>
              They send it to your WhatsApp business number.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">→</span>
              Twilio receives the message and forwards it to your webhook.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">→</span>
              The bot parses the plan, price, payment method, and customer phone, then saves the order automatically.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">→</span>
              The customer instantly receives a confirmation reply with their Order ID.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">→</span>
              The order appears in the Order Tracker — ready for you to update status and send payment links.
            </li>
          </ul>
        </section>

        {/* Parser tester */}
        <section className="bg-[#0b1120] border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Parser Tester</h2>
          <p className="text-sm text-gray-400">
            Simulate an incoming WhatsApp message to verify the parser extracts order details correctly — without needing Twilio set up.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-widest">From (phone)</label>
                <input
                  value={testFrom}
                  onChange={e => setTestFrom(e.target.value)}
                  className="w-full bg-[#060d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-widest">Profile Name</label>
                <input
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  className="w-full bg-[#060d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Message Body</label>
              <textarea
                value={testBody}
                onChange={e => setTestBody(e.target.value)}
                rows={12}
                className="w-full bg-[#060d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 resize-y"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createOrder}
                  onChange={e => setCreateOrder(e.target.checked)}
                  className="accent-cyan-500"
                />
                <span className="text-sm text-gray-400">Also create order in tracker if parse succeeds</span>
              </label>
            </div>

            <Button
              onClick={runTest}
              disabled={testLoading}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6"
            >
              {testLoading ? "Parsing…" : "Run Parser Test"}
            </Button>
          </div>

          {testError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-sm text-red-300">
              {testError}
            </div>
          )}

          {testResult && (
            <div className="bg-[#060d1a] border border-gray-700 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">Parse Result</h3>
                {testResult.isOrderRequest ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Order Detected</Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Not an Order</Badge>
                )}
              </div>

              {testResult.isOrderRequest ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Customer Phone", value: testResult.customerPhone },
                    { label: "Customer Name", value: testResult.customerName ?? "—" },
                    { label: "Plan", value: testResult.planName ?? "—" },
                    { label: "Monthly Price", value: testResult.planPrice ? `$${testResult.planPrice}/mo` : "—" },
                    { label: "Hardware", value: testResult.hardwarePrice ? `$${testResult.hardwarePrice}` : "None" },
                  ].map(row => (
                    <div key={row.label} className="bg-[#0b1120] rounded-lg px-4 py-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{row.label}</p>
                      <p className="text-white font-medium mt-0.5">{row.value}</p>
                    </div>
                  ))}
                  <div className="bg-[#0b1120] rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                    <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded ${pmColor(testResult.paymentMethod)}`}>
                      {testResult.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  This message doesn't match the OrbitFuture order format. The bot will send a helpful reply directing the customer to your plans page.
                </p>
              )}

              {createOrder && testResult.isOrderRequest && (
                <div className="text-sm text-green-400">
                  ✓ Order created in the tracker — check the Order Tracker page.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Env variables */}
        <section className="bg-[#0b1120] border border-gray-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Required Environment Secrets</h2>
          <div className="space-y-2 text-sm font-mono">
            {[
              { key: "TWILIO_ACCOUNT_SID", note: "From Twilio Console → Account Info" },
              { key: "TWILIO_AUTH_TOKEN", note: "From Twilio Console → Account Info" },
              { key: "TWILIO_WHATSAPP_FROM", note: 'Your Twilio WhatsApp number e.g. "whatsapp:+16206123994"' },
            ].map(v => (
              <div key={v.key} className="flex items-start gap-4 bg-[#060d1a] border border-gray-700 rounded-lg px-4 py-3">
                <code className="text-cyan-400 shrink-0">{v.key}</code>
                <span className="text-gray-500 text-xs pt-0.5">{v.note}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}
