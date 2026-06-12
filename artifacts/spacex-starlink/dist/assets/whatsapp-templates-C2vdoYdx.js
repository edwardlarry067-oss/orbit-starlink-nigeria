import{N as f,ac as m,a6 as e,m as u,Z as b,d as N,C as w}from"./index-BdqjqQnK.js";import{A as k}from"./AdminLayout-D_heFTkI.js";import{C as y}from"./check-DDIMUD9F.js";import"./users-B60a__5z.js";import"./ticket-rpkvf5Ns.js";/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],v=f("copy",g),E="+1 (620) 612-3994",i="OrbitFuture";function t(a){return`Hello! 👋 Thank you for your interest in *${i}*.

✅ Great news — we've received your order request for the *${a.name} Plan* and are ready to process it!

━━━━━━━━━━━━━━━━━━━━━
📦 *Your Order Summary*

🌐 Plan: ${a.name}
💰 Monthly Service: *${a.price}/month*
🔧 Hardware Kit: *${a.hardware}* (one-time, shipped to you)
⚡ Speed: ${a.speed}

✅ What's included:
${a.features.map(r=>`  • ${r}`).join(`
`)}

━━━━━━━━━━━━━━━━━━━━━
💳 *Choose Your Payment Method*

We accept the following — just let us know which you prefer and we'll send you a direct payment link:

1️⃣ *Paystack* (Africa & Global — Card, Bank Transfer, USSD, Mobile Money)
   👉 [Paystack Payment Link — paste here]

2️⃣ *Orbit Wallet* (Instant token activation — no card needed)
   👉 Reply "WALLET" and we'll activate your plan immediately.

━━━━━━━━━━━━━━━━━━━━━
📦 *Next Steps*

1. Reply with your preferred payment method above
2. We'll send you the payment link within minutes
3. Once payment is confirmed, your kit ships within 1–3 business days
4. Setup takes just 15 minutes — no technician needed!

Questions? We're here 24/7. Just reply to this message. 🙌

*${i}*
📞 ${E}`}const c=[{id:"residential",label:"Residential",category:"Residential",price:"$120",hardware:"$599",speed:"50–200 Mbps",body:t({name:"Residential",price:"$120",hardware:"$599",speed:"50–200 Mbps",features:["Unlimited data","50–200 Mbps download speed","Best-effort uptime","24/7 customer support","Fixed location use","WiFi 6 router included"]})},{id:"priority",label:"Priority",category:"Residential",price:"$250",hardware:"$599",speed:"40–220 Mbps",body:t({name:"Priority",price:"$250",hardware:"$599",speed:"40–220 Mbps",features:["1 TB priority data/month","40–220 Mbps download","Priority network access","Portable use included","No throttling on priority data","24/7 support"]})},{id:"business-residential",label:"Business (Residential)",category:"Residential",price:"$500",hardware:"$2,500",speed:"100–350 Mbps",body:t({name:"Business",price:"$500",hardware:"$2,500",speed:"100–350 Mbps",features:["Priority commercial network","Multi-device support","SLA uptime guarantee","Dedicated account manager","Commercial-grade hardware","Advanced network monitoring"]})},{id:"roam",label:"Roam",category:"Roam & Maritime",price:"$150",hardware:"$599",speed:"5–50 Mbps",body:t({name:"Roam",price:"$150",hardware:"$599",speed:"5–50 Mbps",features:["Full mobility on land","Works while moving","Pause/resume anytime","Global land coverage","No fixed address needed","App-based management"]})},{id:"maritime-standard",label:"Maritime Standard",category:"Roam & Maritime",price:"$250",hardware:"$2,500",speed:"40–220 Mbps",body:t({name:"Maritime Standard",price:"$250",hardware:"$2,500",speed:"40–220 Mbps",features:["Full ocean coverage","Works at sea in motion","40–220 Mbps offshore","Priority maritime data","Weather-resistant hardware","24/7 maritime support"]})},{id:"maritime-priority",label:"Maritime Priority",category:"Roam & Maritime",price:"$1,000",hardware:"$2,500",speed:"100–350 Mbps",body:t({name:"Maritime Priority",price:"$1,000",hardware:"$2,500",speed:"100–350 Mbps",features:["1 TB priority maritime data/mo","Fleet management tools","Dedicated bandwidth lanes","SLA guaranteed uptime","Multi-antenna support","Commercial vessel rating"]})},{id:"business-standard",label:"Business Standard",category:"Business",price:"$500",hardware:"$2,500",speed:"100–350 Mbps",body:t({name:"Business Standard",price:"$500",hardware:"$2,500",speed:"100–350 Mbps",features:["Priority commercial data","Up to 350 Mbps download","Business SLA guarantee","Commercial hardware kit","Multi-site management","Dedicated support line"]})},{id:"business-priority",label:"Business Priority",category:"Business",price:"$1,500",hardware:"$2,500",speed:"100–500 Mbps",body:t({name:"Business Priority",price:"$1,500",hardware:"$2,500",speed:"100–500 Mbps",features:["5 TB priority data/month","Up to 500 Mbps download","Best-effort SLA uptime","Dedicated account team","Custom deployment support","Advanced analytics dashboard"]})},{id:"enterprise",label:"Enterprise",category:"Business",price:"$5,000",hardware:"$10,000",speed:"Custom (up to 1 Gbps)",body:t({name:"Enterprise",price:"$5,000",hardware:"$10,000",speed:"Custom (up to 1 Gbps)",features:["Custom data allocation","Up to 1 Gbps speeds","Guaranteed SLA & uptime","Multi-location deployment","White-glove installation","Executive support tier"]})}],d=[{id:"payment-received",label:"Payment Received ✅",body:`Hello! 👋

Great news — we've confirmed your payment! 🎉

✅ *Payment Status: Confirmed*
📦 Your OrbitFuture kit is being prepared for shipment.
🚚 Expected delivery: *7–14 business days*

Once your kit arrives, setup takes just 15 minutes using the OrbitFuture app. We'll also send you a tracking number as soon as it ships.

Thank you for choosing *${i}*! We're excited to get you connected. 🌐

Any questions? We're here 24/7 — just reply to this message.`},{id:"kit-shipped",label:"Kit Shipped 🚚",body:`Hello! 👋

Exciting update — your OrbitFuture kit has been *shipped!* 📦🚀

🚚 *Tracking Number:* [Paste tracking number here]
📅 *Estimated Delivery:* [Insert date]

*What to expect in your kit:*
  • Satellite dish & mounting base
  • WiFi 6 router
  • Power supply & cables

*Next Steps:*
1. Download the *OrbitFuture app* (iOS / Android)
2. When your kit arrives, open the app and follow the guided setup
3. Setup takes about 15 minutes — no technician needed!

We're here if you need any help. Welcome to fast satellite internet! 🌐

*${i}*`},{id:"follow-up",label:"Follow-Up 👋",body:`Hello! 👋 This is a follow-up from *${i}*.

We noticed you reached out about OrbitFuture satellite internet and wanted to check in — are you still interested? We'd love to help you get connected!

🌐 *Our plans start at just $120/month* with no contracts.
⚡ Speeds from 50 Mbps up to 1 Gbps
📦 Hardware kit ships directly to your door
🔧 15-minute self-setup — no technician needed

Just reply to this message and we'll walk you through everything, including a payment link to get started today.

Looking forward to hearing from you! 🙌`},{id:"payment-reminder",label:"Payment Reminder 🔔",body:`Hello! 👋 A quick reminder from *${i}*.

Your OrbitFuture order is still pending payment. We're holding your spot — but availability is limited in your area!

💳 To complete your order, simply:
1. Choose your payment method (Paystack or Orbit Wallet)
2. Reply here and we'll send your payment link immediately
3. Payment is confirmed instantly — your kit ships within 7–14 business days

Need help or have questions? Just reply to this message — we respond within minutes.

Don't miss out on fast satellite internet! 🌐`},{id:"support",label:"Support Response 🛠️",body:`Hello! 👋 Thank you for reaching out to *${i}* support.

We've received your message and our team is looking into this for you right now. We aim to resolve all support requests within *30 minutes* during business hours.

In the meantime, here are some quick tips that resolve most issues:

🔧 *Connection Issues:*
  • Ensure the dish has a clear view of the sky (no obstructions)
  • Restart the router by unplugging for 30 seconds
  • Check the OrbitFuture app for outage alerts in your area

📱 *App Issues:*
  • Update the OrbitFuture app to the latest version
  • Ensure Bluetooth is enabled during setup

If the issue persists, please describe it in more detail and we'll resolve it promptly.

Thank you for your patience! 🙏`}];function h({template:a,isQuick:r=!1}){const[n,p]=m.useState(!1),[o,s]=m.useState(!1),l=async()=>{await navigator.clipboard.writeText(a.body),p(!0),setTimeout(()=>p(!1),2500)};return e.jsxDEV("div",{className:"border border-border rounded-xl bg-card overflow-hidden transition-all",children:[e.jsxDEV("div",{className:"flex items-center justify-between px-5 py-4 gap-4",children:[e.jsxDEV("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsxDEV("div",{className:`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r?"bg-primary/10":"bg-[#25D366]/10"}`,children:r?e.jsxDEV(b,{className:"w-4 h-4 text-primary"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:256,columnNumber:24},this):e.jsxDEV(u,{className:"w-4 h-4 text-[#25D366]"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:256,columnNumber:67},this)},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:255,columnNumber:11},this),e.jsxDEV("div",{className:"min-w-0",children:[e.jsxDEV("p",{className:"text-white font-bold text-sm",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:259,columnNumber:13},this),!r&&a.price&&e.jsxDEV("p",{className:"text-muted-foreground text-xs mt-0.5",children:[a.price,"/mo · Hardware ",a.hardware," · ",a.speed]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:261,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:258,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:254,columnNumber:9},this),e.jsxDEV("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsxDEV("button",{onClick:()=>s(x=>!x),className:"h-8 px-3 rounded-md text-xs font-bold text-muted-foreground hover:text-white border border-border hover:border-white/20 transition-colors flex items-center gap-1.5",children:[o?e.jsxDEV(N,{className:"w-3.5 h-3.5"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:272,columnNumber:25},this):e.jsxDEV(w,{className:"w-3.5 h-3.5"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:272,columnNumber:65},this),o?"Hide":"Preview"]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:268,columnNumber:11},this),e.jsxDEV("button",{onClick:l,className:`h-8 px-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${n?"bg-emerald-500/15 text-emerald-400 border border-emerald-500/30":"bg-[#25D366] text-black hover:bg-[#20b858]"}`,children:[n?e.jsxDEV(y,{className:"w-3.5 h-3.5"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:283,columnNumber:23},this):e.jsxDEV(v,{className:"w-3.5 h-3.5"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:283,columnNumber:59},this),n?"Copied!":"Copy"]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:275,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:267,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:253,columnNumber:7},this),o&&e.jsxDEV("div",{className:"border-t border-border px-5 py-4 bg-black/30",children:e.jsxDEV("pre",{className:"text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono",children:a.body},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:291,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:290,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:252,columnNumber:5},this)}const D=["Residential","Roam & Maritime","Business"];function S(){const[a,r]=m.useState("Residential"),[n,p]=m.useState(""),o=c.filter(s=>s.category===a&&(n===""||s.label.toLowerCase().includes(n.toLowerCase())));return e.jsxDEV(k,{children:[e.jsxDEV("div",{className:"flex items-start justify-between mb-8 gap-4",children:[e.jsxDEV("div",{children:[e.jsxDEV("div",{className:"flex items-center gap-3 mb-2",children:[e.jsxDEV("div",{className:"w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center",children:e.jsxDEV(u,{className:"w-5 h-5 text-[#25D366]"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:316,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:315,columnNumber:13},this),e.jsxDEV("h1",{className:"text-2xl font-black uppercase tracking-widest text-white",children:"WhatsApp Templates"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:318,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:314,columnNumber:11},this),e.jsxDEV("p",{className:"text-muted-foreground text-sm",children:["Copy a template, paste it into WhatsApp, and replace the ",e.jsxDEV("span",{className:"text-white font-bold",children:"[payment link]"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:321,columnNumber:70},this)," placeholder before sending."]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:320,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:313,columnNumber:9},this),e.jsxDEV("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsxDEV("span",{className:"w-2 h-2 bg-[#25D366] rounded-full animate-pulse"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:325,columnNumber:11},this),e.jsxDEV("span",{className:"text-[#25D366] text-xs font-bold uppercase tracking-widest",children:[c.length+d.length," Templates Ready"]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:326,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:324,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:312,columnNumber:7},this),e.jsxDEV("div",{className:"border border-primary/20 bg-primary/5 rounded-xl p-5 mb-8",children:[e.jsxDEV("p",{className:"text-xs font-black uppercase tracking-widest text-primary mb-3",children:"How to Use"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:332,columnNumber:9},this),e.jsxDEV("ol",{className:"space-y-1.5",children:["A customer sends you an order via WhatsApp (from your website).","Find the matching plan template below and click Copy.","Paste it into WhatsApp and fill in the [payment link] placeholder.","Send! The customer receives a professional reply with all details."].map((s,l)=>e.jsxDEV("li",{className:"flex items-start gap-2.5 text-sm text-gray-300",children:[e.jsxDEV("span",{className:"w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5",children:l+1},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:341,columnNumber:15},this),s]},l,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:340,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:333,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:331,columnNumber:7},this),e.jsxDEV("section",{className:"mb-10",children:[e.jsxDEV("div",{className:"flex items-center gap-3 mb-5",children:[e.jsxDEV(u,{className:"w-4 h-4 text-[#25D366]"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:351,columnNumber:11},this),e.jsxDEV("h2",{className:"text-sm font-black uppercase tracking-widest text-white",children:"Order Reply Templates"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:352,columnNumber:11},this),e.jsxDEV("div",{className:"flex-1 h-px bg-border"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:353,columnNumber:11},this),e.jsxDEV("span",{className:"text-[10px] text-muted-foreground uppercase tracking-widest",children:[c.length," templates"]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:354,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:350,columnNumber:9},this),e.jsxDEV("div",{className:"flex gap-1 mb-5 border-b border-border pb-0",children:D.map(s=>e.jsxDEV("button",{onClick:()=>r(s),className:`px-5 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all -mb-px ${a===s?"text-white border-[#25D366]":"text-muted-foreground border-transparent hover:text-gray-300"}`,children:s},s,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:360,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:358,columnNumber:9},this),e.jsxDEV("div",{className:"space-y-3",children:o.map(s=>e.jsxDEV(h,{template:s},s.id,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:376,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:374,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:349,columnNumber:7},this),e.jsxDEV("section",{children:[e.jsxDEV("div",{className:"flex items-center gap-3 mb-5",children:[e.jsxDEV(b,{className:"w-4 h-4 text-primary"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:384,columnNumber:11},this),e.jsxDEV("h2",{className:"text-sm font-black uppercase tracking-widest text-white",children:"Quick Reply Templates"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:385,columnNumber:11},this),e.jsxDEV("div",{className:"flex-1 h-px bg-border"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:386,columnNumber:11},this),e.jsxDEV("span",{className:"text-[10px] text-muted-foreground uppercase tracking-widest",children:[d.length," templates"]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:387,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:383,columnNumber:9},this),e.jsxDEV("div",{className:"grid grid-cols-1 gap-3",children:d.map(s=>e.jsxDEV(h,{template:s,isQuick:!0},s.id,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:392,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:390,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:382,columnNumber:7},this),e.jsxDEV("div",{className:"mt-10 border border-border rounded-xl p-5 bg-card text-center",children:e.jsxDEV("p",{className:"text-xs text-muted-foreground",children:["💡 ",e.jsxDEV("strong",{className:"text-white",children:"Pro tip:"},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:400,columnNumber:14},this)," Pin this page in your browser for instant access when orders come in. Each template is fully formatted and ready to paste — just add the payment link."]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:399,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:398,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/artifacts/spacex-starlink/src/pages/admin/whatsapp-templates.tsx",lineNumber:310,columnNumber:5},this)}export{S as default};
