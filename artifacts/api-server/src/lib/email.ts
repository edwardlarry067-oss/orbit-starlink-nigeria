import { logger } from "./logger";

interface SubscriptionConfirmationData {
  customerName: string;
  customerEmail: string;
  planName: string;
  planCategory: string;
  planSpeed: string;
  priceMonthly: number;
  hardwareFee?: number;
  currency?: string;
  address?: string;
  phone?: string;
  features: string[];
  subscriptionId: number;
}

interface CancellationData {
  customerName: string;
  customerEmail: string;
  planName: string;
  priceMonthly: number;
}

interface WelcomeEmailData {
  customerName: string;
  customerEmail: string;
}

interface PaymentReceiptData {
  customerName: string;
  customerEmail: string;
  planName: string;
  amountPaid: number;
  currency: string;
  transactionId: string;
  date: string;
}

interface PasswordResetData {
  customerName: string;
  customerEmail: string;
  resetToken: string;
  resetUrl: string;
}

interface SupportReplyData {
  customerName: string;
  customerEmail: string;
  ticketId: string;
  subject: string;
  message: string;
  agentName: string;
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require("resend");
  return new Resend(key);
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? "ORBITFUTURE <noreply@orbitfuture.store>";
const BRAND_NAME = "ORBITFUTURE";
const BRAND_COLOR = "#00D4FF";
const SUPPORT_EMAIL = "support@orbitfuture.store";
const APP_URL = process.env.APP_URL ?? "https://orbitfuture.store";

const baseStyles = `
  body{margin:0;padding:0;background:#050D1A;font-family:'Helvetica Neue',Arial,sans-serif;}
  @media only screen and (max-width:600px){
    .email-wrapper{padding:20px 12px!important;}
    .email-card{padding:28px 20px!important;}
    .hero-title{font-size:26px!important;}
  }
`;

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>${baseStyles}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background:#050D1A;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header / Logo -->
        <tr><td style="padding-bottom:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <a href="${APP_URL}" style="text-decoration:none;">
                  <span style="font-size:20px;font-weight:900;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">
                    ORBIT<span style="color:${BRAND_COLOR};">FUTURE</span>
                  </span>
                </a>
              </td>
              <td align="right">
                <span style="font-size:10px;color:#4a5568;text-transform:uppercase;letter-spacing:2px;">Satellite Internet</span>
              </td>
            </tr>
          </table>
        </td></tr>

        ${content}

        <!-- Footer -->
        <tr><td style="padding-top:40px;border-top:1px solid rgba(255,255,255,0.06);margin-top:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding-bottom:16px;">
                <a href="${APP_URL}" style="font-size:16px;font-weight:900;letter-spacing:3px;color:#ffffff;text-decoration:none;text-transform:uppercase;">
                  ORBIT<span style="color:${BRAND_COLOR};">FUTURE</span>
                </a>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;padding-bottom:8px;">
                <a href="${APP_URL}/plans" style="font-size:12px;color:#4a5568;text-decoration:none;margin:0 12px;">Plans</a>
                <a href="${APP_URL}/support" style="font-size:12px;color:#4a5568;text-decoration:none;margin:0 12px;">Support</a>
                <a href="${APP_URL}/faq" style="font-size:12px;color:#4a5568;text-decoration:none;margin:0 12px;">FAQ</a>
                <a href="mailto:${SUPPORT_EMAIL}" style="font-size:12px;color:#4a5568;text-decoration:none;margin:0 12px;">Contact</a>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <p style="margin:8px 0 0;font-size:11px;color:#2d3748;">Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a></p>
                <p style="margin:6px 0 0;font-size:11px;color:#2d3748;">© ${new Date().getFullYear()} ORBITFUTURE Ltd. All rights reserved.</p>
                <p style="margin:6px 0 0;font-size:10px;color:#1e293b;">High-Speed Global Satellite Internet · orbitfuture.com</p>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function confirmationHtml(data: SubscriptionConfirmationData): string {
  const cur = data.currency ?? "NGN";
  const monthly = data.priceMonthly;
  const hardware = data.hardwareFee ?? 0;
  const total = monthly + hardware;

  const featuresHtml = data.features
    .map((f) => `<tr><td style="padding:6px 0;color:#a0aec0;font-size:14px;"><span style="color:${BRAND_COLOR};margin-right:8px;">✦</span>${f}</td></tr>`)
    .join("");

  const lineItem = (label: string, value: string, valueColor = "#ffffff", badge = "") => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;">${label}</span>
        ${badge ? `<span style="display:inline-block;margin-left:8px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background:rgba(251,191,36,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.25);border-radius:4px;padding:1px 6px;">${badge}</span>` : ""}
        <span style="float:right;font-size:14px;color:${valueColor};font-weight:700;">${value}</span>
      </td>
    </tr>`;

  const deliverySection = data.address ? `
    <!-- Delivery Address -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr><td style="padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;">📦 Delivery Details</p>
        </td></tr>
        <tr><td style="padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Ship To</span>
                <span style="font-size:14px;color:#e2e8f0;font-weight:600;">${data.customerName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Address</span>
                <span style="font-size:14px;color:#e2e8f0;">${data.address}</span>
              </td>
            </tr>
            ${data.phone ? `<tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Phone</span>
                <span style="font-size:14px;color:#e2e8f0;">${data.phone}</span>
              </td>
            </tr>` : ""}
          </table>
        </td></tr>
      </table>
    </td></tr>` : "";

  return emailWrapper(`
    <!-- Hero -->
    <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:40px;" class="email-card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;color:${BRAND_COLOR};text-transform:uppercase;">✅ Order Confirmed</p>
      <h1 class="hero-title" style="margin:0 0 16px;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">You're connected<br/>to the future.</h1>
      <p style="margin:0;font-size:16px;color:#a0aec0;line-height:1.6;">
        Hi <strong style="color:#ffffff;">${data.customerName}</strong> — your <strong style="color:#ffffff;">${data.planName}</strong> order is confirmed and your hardware is being prepared for shipment.
      </p>
    </td></tr>

    <!-- Order Receipt -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr><td style="padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;">🧾 Order Receipt</p>
          <p style="margin:6px 0 0;font-size:18px;font-weight:900;color:#ffffff;">${data.planName}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#a0aec0;text-transform:capitalize;">${data.planCategory} · ${data.planSpeed}</p>
        </td></tr>
        <tr><td style="padding-top:4px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${lineItem("Monthly Service", `${cur} ${monthly.toLocaleString()}/mo`)}
            ${hardware > 0 ? lineItem("Hardware Kit", `${cur} ${hardware.toLocaleString()}`, "#fbbf24", "One-Time") : ""}
            <tr>
              <td style="padding:14px 0 0;">
                <span style="font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;">${hardware > 0 ? "First Payment Total" : "Due Today"}</span>
                <span style="float:right;font-size:20px;color:#10b981;font-weight:900;">${cur} ${total.toLocaleString()}</span>
              </td>
            </tr>
            ${hardware > 0 ? `<tr><td><p style="margin:6px 0 0;font-size:11px;color:#4a5568;text-align:right;">Then ${cur} ${monthly.toLocaleString()}/mo from month 2. Hardware is a one-time charge.</p></td></tr>` : ""}
          </table>
        </td></tr>
      </table>
    </td></tr>

    ${deliverySection}

    <!-- Plan Features -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr><td style="padding-bottom:16px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;">What's Included</p>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">${featuresHtml}</table>
        </td></tr>
      </table>
    </td></tr>

    <!-- What Happens Next -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr><td style="padding-bottom:16px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;">What Happens Next</p>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              { n: "1", text: "Hardware kit prepared & dispatched within 3–5 business days" },
              { n: "2", text: "Shipping confirmation sent to this email with live tracking" },
              { n: "3", text: "Kit arrives — plug in, point at the sky, connect in minutes" },
              { n: "4", text: "24/7 ORBITFUTURE support available for installation help" },
            ].map(({ n, text }) => `
              <tr>
                <td style="padding:8px 0;">
                  <span style="display:inline-block;background:rgba(0,212,255,0.1);color:${BRAND_COLOR};font-size:12px;font-weight:700;border-radius:50%;width:24px;height:24px;line-height:24px;text-align:center;margin-right:12px;">${n}</span>
                  <span style="font-size:14px;color:#e2e8f0;">${text}</span>
                </td>
              </tr>
            `).join("")}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- Reference + CTA -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.15);border-radius:8px;padding:16px 20px;">
        <tr>
          <td>
            <p style="margin:0;font-size:12px;color:#a0aec0;">
              Order ID: <span style="color:${BRAND_COLOR};font-family:monospace;font-weight:700;">#ORB-${String(data.subscriptionId).padStart(6, "0")}</span>
              &nbsp;·&nbsp; Keep this for your records
            </p>
          </td>
          <td align="right">
            <a href="${APP_URL}/dashboard" style="font-size:12px;color:${BRAND_COLOR};text-decoration:none;font-weight:700;">Track Order →</a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Support CTA -->
    <tr><td style="padding-top:28px;text-align:center;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:13px;font-weight:900;letter-spacing:2px;text-decoration:none;padding:14px 36px;border-radius:6px;text-transform:uppercase;">
        View Your Order →
      </a>
      <p style="margin:16px 0 0;font-size:12px;color:#4a5568;">
        Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a>
      </p>
    </td></tr>
  `);
}

function welcomeHtml(data: WelcomeEmailData): string {
  return emailWrapper(`
    <!-- Hero -->
    <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:40px;" class="email-card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;color:${BRAND_COLOR};text-transform:uppercase;">🚀 Welcome Aboard</p>
      <h1 class="hero-title" style="margin:0 0 16px;font-size:32px;font-weight:900;color:#ffffff;">Welcome to<br/>ORBITFUTURE</h1>
      <p style="margin:0;font-size:16px;color:#a0aec0;line-height:1.6;">
        Hi <strong style="color:#ffffff;">${data.customerName}</strong>, your account has been created successfully.
        You now have access to the fastest global satellite internet service.
      </p>
    </td></tr>

    <!-- Get Started -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr><td style="padding-bottom:20px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;">Get Started</p>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              { icon: "🛰️", title: "Browse Plans", desc: "Choose from Residential, Business, Roam, Maritime, and Aviation plans." },
              { icon: "🪙", title: "Orbit Wallet", desc: "Load your wallet with tokens for instant plan activations." },
              { icon: "📊", title: "Dashboard", desc: "Track your subscriptions, usage, and installation status." },
              { icon: "💬", title: "24/7 Support", desc: "Our team is always available via WhatsApp or email." },
            ].map(({ icon, title, desc }) => `
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="font-size:20px;margin-right:12px;">${icon}</span>
                  <strong style="color:#ffffff;font-size:14px;">${title}</strong>
                  <p style="margin:4px 0 0 32px;font-size:13px;color:#a0aec0;">${desc}</p>
                </td>
              </tr>
            `).join("")}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding-top:28px;text-align:center;">
      <a href="${APP_URL}/plans" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:13px;font-weight:900;letter-spacing:2px;text-decoration:none;padding:14px 36px;border-radius:6px;text-transform:uppercase;">
        Browse Plans →
      </a>
    </td></tr>
  `);
}

function paymentReceiptHtml(data: PaymentReceiptData): string {
  return emailWrapper(`
    <!-- Hero -->
    <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:40px;" class="email-card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;color:#10b981;text-transform:uppercase;">✅ Payment Received</p>
      <h1 class="hero-title" style="margin:0 0 16px;font-size:32px;font-weight:900;color:#ffffff;">Payment<br/>Confirmed</h1>
      <p style="margin:0;font-size:16px;color:#a0aec0;line-height:1.6;">
        Hi <strong style="color:#ffffff;">${data.customerName}</strong>, we've received your payment of
        <strong style="color:#ffffff;">${data.currency} ${data.amountPaid.toFixed(2)}</strong> for <strong style="color:#ffffff;">${data.planName}</strong>.
      </p>
    </td></tr>

    <!-- Receipt Details -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr><td style="padding-bottom:20px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;">Receipt Details</p>
        </td></tr>
        ${[
          ["Plan", data.planName],
          ["Amount Paid", `${data.currency} ${data.amountPaid.toFixed(2)}`],
          ["Date", data.date],
          ["Transaction ID", data.transactionId],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <span style="font-size:12px;color:#718096;text-transform:uppercase;letter-spacing:1px;">${label}</span>
              <span style="float:right;font-size:14px;color:#ffffff;font-weight:700;">${value}</span>
            </td>
          </tr>
        `).join("")}
      </table>
    </td></tr>

    <!-- Dashboard Link -->
    <tr><td style="padding-top:28px;text-align:center;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:13px;font-weight:900;letter-spacing:2px;text-decoration:none;padding:14px 36px;border-radius:6px;text-transform:uppercase;">
        View Dashboard →
      </a>
    </td></tr>
  `);
}

function passwordResetHtml(data: PasswordResetData): string {
  return emailWrapper(`
    <!-- Hero -->
    <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:40px;" class="email-card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;color:#f59e0b;text-transform:uppercase;">🔐 Password Reset</p>
      <h1 class="hero-title" style="margin:0 0 16px;font-size:32px;font-weight:900;color:#ffffff;">Reset Your<br/>Password</h1>
      <p style="margin:0;font-size:16px;color:#a0aec0;line-height:1.6;">
        Hi <strong style="color:#ffffff;">${data.customerName}</strong>, we received a request to reset your ORBITFUTURE account password.
        Click the button below to set a new password.
      </p>
    </td></tr>

    <!-- Reset Button -->
    <tr><td style="padding-top:32px;text-align:center;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background:${BRAND_COLOR};border-radius:6px;">
            <a href="${data.resetUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:900;letter-spacing:2px;text-decoration:none;padding:16px 40px;border-radius:6px;text-transform:uppercase;">
              Reset Password →
            </a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Security Notice -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:16px 20px;">
        <tr>
          <td>
            <p style="margin:0;font-size:13px;color:#a0aec0;line-height:1.6;">
              ⚠️ This link expires in <strong style="color:#ffffff;">1 hour</strong>. If you didn't request a password reset, please ignore this email or contact
              <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a> immediately.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  `);
}

function supportReplyHtml(data: SupportReplyData): string {
  return emailWrapper(`
    <!-- Hero -->
    <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:40px;" class="email-card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;color:${BRAND_COLOR};text-transform:uppercase;">💬 Support Reply</p>
      <h1 class="hero-title" style="margin:0 0 16px;font-size:28px;font-weight:900;color:#ffffff;">We've responded<br/>to your ticket</h1>
      <p style="margin:0;font-size:16px;color:#a0aec0;line-height:1.6;">
        Hi <strong style="color:#ffffff;">${data.customerName}</strong>, ${data.agentName} from ORBITFUTURE Support has replied to your ticket.
      </p>
    </td></tr>

    <!-- Ticket Info -->
    <tr><td style="padding-top:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;" class="email-card">
        <tr>
          <td style="padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:1px;">Ticket #${data.ticketId} · ${data.subject}</p>
          </td>
        </tr>
        <tr>
          <td style="padding-top:20px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;color:${BRAND_COLOR};text-transform:uppercase;">Reply from ${data.agentName}</p>
            <p style="margin:0;font-size:15px;color:#e2e8f0;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Reply CTA -->
    <tr><td style="padding-top:28px;text-align:center;">
      <a href="mailto:${SUPPORT_EMAIL}?subject=Re: Ticket #${data.ticketId} - ${data.subject}" style="display:inline-block;border:1px solid ${BRAND_COLOR};color:${BRAND_COLOR};font-size:13px;font-weight:700;letter-spacing:2px;text-decoration:none;padding:14px 36px;border-radius:6px;text-transform:uppercase;">
        Reply to Support →
      </a>
    </td></tr>
  `);
}

function cancellationHtml(data: CancellationData): string {
  return emailWrapper(`
    <!-- Hero -->
    <tr><td style="background:#0a1628;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:40px;" class="email-card">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:3px;color:#a0aec0;text-transform:uppercase;">Subscription Cancelled</p>
      <h1 class="hero-title" style="margin:0 0 16px;font-size:28px;font-weight:900;color:#ffffff;">We're sorry to see you go</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#a0aec0;line-height:1.6;">
        Hi <strong style="color:#ffffff;">${data.customerName}</strong>, your <strong style="color:#ffffff;">${data.planName}</strong>
        subscription ($${data.priceMonthly}/mo) has been cancelled successfully.
        You'll retain access until the end of your current billing period.
      </p>
      <p style="margin:0;font-size:14px;color:#a0aec0;">
        If you cancelled by mistake or want to reactivate, visit our website or contact support at
        <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a>.
      </p>
    </td></tr>

    <!-- Reactivate CTA -->
    <tr><td style="padding-top:24px;text-align:center;">
      <a href="${APP_URL}/plans" style="display:inline-block;border:1px solid ${BRAND_COLOR};color:${BRAND_COLOR};font-size:13px;font-weight:700;letter-spacing:2px;text-decoration:none;padding:14px 36px;border-radius:6px;text-transform:uppercase;">
        View Plans Again →
      </a>
    </td></tr>
  `);
}

export async function sendSubscriptionConfirmation(data: SubscriptionConfirmationData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info({ email: data.customerEmail }, "Email skipped — RESEND_API_KEY not configured");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Welcome to ORBITFUTURE — Your ${data.planName} is Active`,
      html: confirmationHtml(data),
    });
    logger.info({ email: data.customerEmail, planName: data.planName }, "Subscription confirmation email sent");
  } catch (err) {
    logger.error({ err, email: data.customerEmail }, "Failed to send confirmation email");
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info({ email: data.customerEmail }, "Welcome email skipped — RESEND_API_KEY not configured");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Welcome to ORBITFUTURE — Your Account is Ready`,
      html: welcomeHtml(data),
    });
    logger.info({ email: data.customerEmail }, "Welcome email sent");
  } catch (err) {
    logger.error({ err, email: data.customerEmail }, "Failed to send welcome email");
  }
}

export async function sendPaymentReceipt(data: PaymentReceiptData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info({ email: data.customerEmail }, "Payment receipt email skipped — RESEND_API_KEY not configured");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `ORBITFUTURE Payment Receipt — ${data.currency} ${data.amountPaid.toFixed(2)}`,
      html: paymentReceiptHtml(data),
    });
    logger.info({ email: data.customerEmail }, "Payment receipt email sent");
  } catch (err) {
    logger.error({ err, email: data.customerEmail }, "Failed to send payment receipt email");
  }
}

export async function sendPasswordReset(data: PasswordResetData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info({ email: data.customerEmail }, "Password reset email skipped — RESEND_API_KEY not configured");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `ORBITFUTURE — Reset Your Password`,
      html: passwordResetHtml(data),
    });
    logger.info({ email: data.customerEmail }, "Password reset email sent");
  } catch (err) {
    logger.error({ err, email: data.customerEmail }, "Failed to send password reset email");
  }
}

export async function sendSupportReply(data: SupportReplyData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info({ email: data.customerEmail }, "Support reply email skipped — RESEND_API_KEY not configured");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Re: [Ticket #${data.ticketId}] ${data.subject} — ORBITFUTURE Support`,
      html: supportReplyHtml(data),
    });
    logger.info({ email: data.customerEmail, ticketId: data.ticketId }, "Support reply email sent");
  } catch (err) {
    logger.error({ err, email: data.customerEmail }, "Failed to send support reply email");
  }
}

interface AdminPaymentAlertData {
  type: "plan" | "token";
  customerName: string;
  customerEmail: string;
  item: string;
  amountPaid: number;
  currency: string;
  transactionId: string;
}

function adminPaymentAlertHtml(data: AdminPaymentAlertData): string {
  const typeLabel = data.type === "plan" ? "Plan Subscription" : "Token Bundle";
  const icon = data.type === "plan" ? "🛰️" : "🪙";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td style="background:#0d1f3c;border:1px solid rgba(0,212,255,0.25);border-radius:10px;padding:28px 32px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;color:#00D4FF;text-transform:uppercase;">
            ${icon} New Payment — ${typeLabel}
          </p>
          <h2 style="margin:8px 0 24px;font-size:22px;font-weight:900;color:#ffffff;">
            ${data.currency} ${data.amountPaid.toFixed(2)} received
          </h2>

          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              ["Customer", data.customerName],
              ["Email", data.customerEmail],
              ["Item", data.item],
              ["Amount", `${data.currency} ${data.amountPaid.toFixed(2)}`],
              ["Transaction ID", data.transactionId],
              ["Time", new Date().toUTCString()],
            ].map(([label, value]) => `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:1px;display:inline-block;width:120px;">${label}</span>
                  <span style="font-size:13px;color:#e2e8f0;font-weight:600;">${value}</span>
                </td>
              </tr>
            `).join("")}
          </table>

          <p style="margin:20px 0 0;font-size:11px;color:#2d3748;text-align:center;">
            ORBITFUTURE Admin Alert · ${APP_URL}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAdminPaymentAlert(data: AdminPaymentAlertData): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const rawFrom = process.env.EMAIL_FROM ?? "";
  const adminEmail = (process.env.ADMIN_EMAIL
    ?? (rawFrom.includes("<") ? rawFrom.match(/<(.+)>/)?.[1] ?? rawFrom : rawFrom))
    || "admin@orbitfuture.com";

  const typeLabel = data.type === "plan" ? "Plan Subscription" : "Token Bundle";
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `💳 New Payment: ${data.currency} ${data.amountPaid.toFixed(2)} — ${typeLabel}`,
      html: adminPaymentAlertHtml(data),
    });
    logger.info({ adminEmail, transactionId: data.transactionId }, "Admin payment alert sent");
  } catch (err) {
    logger.error({ err }, "Failed to send admin payment alert");
  }
}

export async function sendCancellationEmail(data: CancellationData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info({ email: data.customerEmail }, "Email skipped — RESEND_API_KEY not configured");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your ORBITFUTURE Subscription Has Been Cancelled`,
      html: cancellationHtml(data),
    });
    logger.info({ email: data.customerEmail }, "Cancellation email sent");
  } catch (err) {
    logger.error({ err, email: data.customerEmail }, "Failed to send cancellation email");
  }
}
