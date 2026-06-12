import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useGetPlan } from "@workspace/api-client-react";
import { getGetPlanQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertCircle, ShieldCheck, CheckCircle2, Lock,
  ArrowRight, RefreshCw, Zap, Package, Wifi, CreditCard, ExternalLink, Shield
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getApiBase } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics";
import { findPlanByDbId } from "@/data/plans";
import { getFirstPayment, formatNaira } from "@/utils/pricing";
import { PricingDebugPanel } from "@/components/PricingDebugPanel";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  street: z.string().min(5, "Enter your street address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state or LGA"),
  postal: z.string().optional(),
  notes: z.string().optional(),
});

function CheckoutProgress({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { label: "Your Details", num: 1 },
    { label: "Secure Payment", num: 2 },
    { label: "Confirmation", num: 3 },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
              step > s.num
                ? "bg-primary border-primary text-black"
                : step === s.num
                ? "bg-primary/10 border-primary text-primary"
                : "bg-transparent border-white/20 text-gray-600"
            }`}>
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${
              step >= s.num ? "text-primary" : "text-gray-600"
            }`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all ${
              step > s.num ? "bg-primary" : "bg-white/10"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Checkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const planIdParam = urlParams.get("planId");
  const planId = planIdParam ? parseInt(planIdParam, 10) : 0;

  const { user, token } = useAuth();
  const [, navigate] = useLocation();

  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: apiPlan, isLoading: isLoadingPlan } = useGetPlan(planId, {
    query: { enabled: !!planId, queryKey: getGetPlanQueryKey(planId) }
  });

  const staticPlan = findPlanByDbId(planId);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", email: "", phone: "", street: "", city: "", state: "", postal: "", notes: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name);
      form.setValue("email", user.email);
      if (user.phone) form.setValue("phone", user.phone);
      if (user.address) form.setValue("street", user.address);
    }
  }, [user, form]);

  const fetchWallet = useCallback(async (email: string) => {
    if (!email || !email.includes("@") || !token) return;
    setWalletLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/wallet/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
      }
    } catch {}
    setWalletLoading(false);
  }, [token]);

  const emailValue = form.watch("email");
  useEffect(() => {
    if (emailValue && emailValue.includes("@")) fetchWallet(emailValue);
  }, [emailValue, fetchWallet]);

  useEffect(() => {
    if (staticPlan) {
      trackInitiateCheckout({
        planName: staticPlan.name,
        planId,
        price: staticPlan.usdMonthly + staticPlan.usdHardware,
      });
    }
  }, [planId]);

  if (!planId) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Alert variant="destructive" className="max-w-md mx-auto text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Plan Selected</AlertTitle>
            <AlertDescription>Please go back and select a plan first.</AlertDescription>
          </Alert>
          <Button className="mt-8 uppercase tracking-widest font-bold" onClick={() => navigate("/plans")}>
            View Plans
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!isLoadingPlan && !apiPlan) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Alert variant="destructive" className="max-w-md mx-auto text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plan Not Found</AlertTitle>
            <AlertDescription>The selected plan could not be found. Please choose another.</AlertDescription>
          </Alert>
          <Button className="mt-8 uppercase tracking-widest font-bold" onClick={() => navigate("/plans")}>
            View Plans
          </Button>
        </div>
      </MainLayout>
    );
  }

  const firstPayment = staticPlan ? getFirstPayment(staticPlan) : 0;
  const priceTokens = staticPlan ? Math.ceil(staticPlan.usdMonthly + staticPlan.usdHardware) : 0;
  const hasSufficientTokens = walletBalance !== null && walletBalance >= priceTokens;

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    if (!apiPlan) return;
    setError("");
    setPaying(true);

    const fullAddress = [data.street, data.city, data.state, data.postal].filter(Boolean).join(", ");

    try {
      if (paymentMethod === "paystack") {
        const res = await fetch(`${getApiBase()}/api/paystack-plan-pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: apiPlan.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            address: fullAddress,
            notes: data.notes,
            currency: "NGN",
          }),
        });
        const json = await res.json();
        if (json.paymentLink) {
          localStorage.setItem("orbit_name", data.name);
          localStorage.setItem("orbit_email", data.email);
          window.location.href = json.paymentLink;
        } else {
          setError(json.error || "Failed to create checkout session. Please try again.");
        }
      } else {
        const res = await fetch(`${getApiBase()}/api/checkout/wallet-pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: apiPlan.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            address: fullAddress,
            notes: data.notes,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (res.status === 402) {
            setError(`You need ${json.required} tokens but only have ${json.available}. Please top up your wallet.`);
          } else {
            setError(json.error || "Payment failed. Please try again.");
          }
        } else {
          setSuccess(true);
          trackPurchase({
            orderId: `wallet-${Date.now()}`,
            planName: staticPlan?.name ?? "Starlink Plan",
            planId,
            value: staticPlan ? staticPlan.usdMonthly + staticPlan.usdHardware : 0,
          });
          setTimeout(() => navigate("/dashboard"), 2500);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setPaying(false);
  };

  if (success) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center bg-black">
          <div className="text-center max-w-md px-6">
            <div className="w-24 h-24 bg-emerald-400/10 border border-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-ping" />
            </div>
            <CheckoutProgress step={3} />
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-3">Subscription Active!</h2>
            <p className="text-gray-400 mb-2">Your {staticPlan?.name} plan is now live.</p>
            <p className="text-gray-500 text-sm mb-6">A confirmation email will be sent to your inbox shortly.</p>
            <div className="flex items-center justify-center gap-2 text-primary text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Redirecting to your dashboard…
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const planName = staticPlan?.name ?? (apiPlan as any)?.name ?? "Starlink Plan";
  const planSpeed = staticPlan?.speed ?? (apiPlan as any)?.speed ?? "";
  const planCategory = staticPlan?.category ?? (apiPlan as any)?.category ?? "";
  const planFeatures = staticPlan?.features ?? (apiPlan as any)?.features ?? [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Checkout
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Complete Your Order</h1>
          <p className="text-muted-foreground">Everything included — no hidden fees</p>
        </div>

        <CheckoutProgress step={paying ? 2 : 1} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Shield, label: "Paystack Secured" },
            { icon: Lock, label: "SSL Encrypted" },
            { icon: CheckCircle2, label: "No Hidden Fees" },
            { icon: ShieldCheck, label: "Cancel Anytime" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/2 border border-white/8 rounded-lg px-3 py-2.5">
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-7 space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>
                  {error}
                  {error.includes("top up") && (
                    <a href="/wallet" className="block mt-2 text-primary font-bold hover:underline">→ Top up your wallet now</a>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Payment method selector */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paystack")}
                  className={`rounded-xl border p-4 flex flex-col gap-2 text-left transition-all ${
                    paymentMethod === "paystack"
                      ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(0,212,255,0.08)]"
                      : "border-white/10 bg-card hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${paymentMethod === "paystack" ? "text-primary" : "text-gray-500"}`} />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Card / Paystack</span>
                    <span className="text-[9px] font-black bg-green-500/15 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">NGN</span>
                    {paymentMethod === "paystack" && <span className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Card, Bank Transfer, USSD, Mobile Money — in ₦ Naira
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`rounded-xl border p-4 flex flex-col gap-2 text-left transition-all ${
                    paymentMethod === "wallet"
                      ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(0,212,255,0.08)]"
                      : "border-white/10 bg-card hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${paymentMethod === "wallet" ? "text-primary" : "text-gray-500"}`}>🪙</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white">Orbit Wallet</span>
                    {paymentMethod === "wallet" && <span className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {walletBalance !== null ? `Balance: ${walletBalance.toLocaleString()} tokens` : "Use your token balance"}
                  </p>
                </button>
              </div>
            </div>

            {/* Wallet status */}
            {paymentMethod === "wallet" && (
              <div className={`rounded-xl border p-4 flex items-center gap-4 ${
                hasSufficientTokens
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : walletBalance !== null && walletBalance > 0
                  ? "border-orange-500/20 bg-orange-500/5"
                  : "border-white/10 bg-white/2"
              }`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-white">
                      {walletLoading ? "Checking balance…" : "Orbit Wallet Balance"}
                    </p>
                    {walletLoading && <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-2xl font-black ${
                      hasSufficientTokens ? "text-emerald-400" : walletBalance === null ? "text-gray-600" : "text-orange-400"
                    }`}>
                      {walletBalance !== null ? walletBalance.toLocaleString() : "—"}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">TOKENS</span>
                    {hasSufficientTokens && (
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-0.5">✓ Ready</span>
                    )}
                  </div>
                  {!hasSufficientTokens && walletBalance !== null && priceTokens > 0 && (
                    <p className="text-xs text-orange-400 mt-1">
                      Need {(priceTokens - walletBalance).toLocaleString()} more tokens.{" "}
                      <a href="/wallet" className="font-bold underline">Top up now →</a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Details form */}
            <Card className="bg-background border-border">
              <CardHeader className="border-b border-border bg-card/50">
                <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Delivery & Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {/* Row: Full Name + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" className="bg-card h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+234 800 000 0000" className="bg-card h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Email */}
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="bg-card h-12"
                            {...field}
                            onChange={e => { field.onChange(e); if (e.target.value.includes("@")) fetchWallet(e.target.value); }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Street address */}
                    <FormField control={form.control} name="street" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="House number & street name" className="bg-card h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Row: City + State/LGA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Lagos" className="bg-card h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">State / LGA</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Lagos State" className="bg-card h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Postal code (optional) */}
                    <FormField control={form.control} name="postal" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                          Postal / ZIP Code <span className="text-gray-600 normal-case font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 100001" className="bg-card h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Delivery notes (optional) */}
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                          Delivery Notes <span className="text-gray-600 normal-case font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Gate code, landmark, best time to call…" className="bg-card h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </form>
                </Form>
              </CardContent>
            </Card>

            {!user && (
              <div className="border border-primary/20 rounded-xl bg-primary/3 p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">Sign in for faster checkout</p>
                  <p className="text-[11px] text-gray-500">
                    <a href="/login?redirect=/checkout" className="text-primary hover:underline font-bold">Create an account</a>{" "}
                    to auto-fill your details instantly and track your order.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-5">
            <Card className="bg-card/50 border-primary/20 sticky top-24">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg uppercase tracking-wider">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isLoadingPlan && !staticPlan ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : staticPlan ? (
                  <>
                    <div>
                      <h3 className="font-bold text-base uppercase tracking-wide text-white">{planName}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{planCategory} · {planSpeed}</p>
                    </div>

                    {/* Line items — all values from plans.ts via pricing.ts */}
                    <div className="space-y-2.5 border-t border-border/50 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-3.5 h-3.5 text-primary" />
                          <span className="text-gray-400">Monthly service</span>
                        </div>
                        <span className="font-bold text-white">{formatNaira(staticPlan.monthlyPrice)}/mo</span>
                      </div>

                      {staticPlan.hardwareFee > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-gray-400">Hardware kit</span>
                            <span className="text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-1.5 py-0.5 uppercase font-bold">One-time</span>
                          </div>
                          <span className="font-bold text-amber-400">{formatNaira(staticPlan.hardwareFee)}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Shipping</span>
                        <span className="font-bold text-emerald-500">Free</span>
                      </div>

                      <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wider text-white">
                          {staticPlan.hardwareFee > 0 ? "First Month Total" : "Monthly Total"}
                        </span>
                        <span className="text-2xl font-black text-white">{formatNaira(firstPayment)}</span>
                      </div>

                      {staticPlan.hardwareFee > 0 && (
                        <p className="text-[10px] text-gray-600">
                          Then {formatNaira(staticPlan.monthlyPrice)}/mo from month 2. Hardware is a one-time fee.
                        </p>
                      )}

                      {/* Charge confirmation */}
                      <div className="mt-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5">
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          <span className="font-black text-white">
                            You will be charged exactly {formatNaira(firstPayment)} today.
                          </span>
                          {staticPlan.hardwareFee > 0 && (
                            <span className="text-gray-400"> Then {formatNaira(staticPlan.monthlyPrice)}/mo from month 2.</span>
                          )}
                          {" "}<span className="text-gray-500">No additional fees unless you select optional add-ons.</span>
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    {planFeatures.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">What's Included</p>
                        {(planFeatures as string[]).slice(0, 5).map((f: string) => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-gray-400">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* What happens next */}
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">After You Order</p>
                      <div className="space-y-2.5">
                        {[
                          { num: "1", text: "Order confirmation email within 5 minutes" },
                          { num: "2", text: "Our team contacts you within 2 hours" },
                          { num: "3", text: "Hardware ships to your address" },
                          { num: "4", text: "We activate your service remotely" },
                        ].map(({ num, text }) => (
                          <div key={num} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[8px] font-black text-primary">{num}</span>
                            </div>
                            <span className="text-[11px] text-gray-400 leading-tight">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order protection */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Order Protection</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          14-day return on unopened hardware. Cancel anytime before your next billing date. Your card details are never stored on our servers.
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>

              <CardFooter className="flex-col pt-2 pb-6 border-t border-border bg-background/50">
                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full h-14 text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,212,255,0.15)] mt-4"
                  disabled={
                    isLoadingPlan ||
                    paying ||
                    !staticPlan ||
                    (paymentMethod === "wallet" && walletBalance !== null && !hasSufficientTokens)
                  }
                >
                  {paying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {paymentMethod === "paystack" ? "Opening Secure Payment…" : "Processing…"}
                    </span>
                  ) : paymentMethod === "paystack" ? (
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Pay Securely — {staticPlan ? formatNaira(firstPayment) : "…"}
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  ) : !hasSufficientTokens && walletBalance !== null ? (
                    <span className="flex items-center gap-2">
                      <span>🪙</span>
                      Insufficient Tokens
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Activate with {priceTokens} Tokens
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  {["Paystack Secured", "No hidden fees", "Cancel anytime"].map(t => (
                    <span key={t} className="flex items-center gap-1 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-[10px] text-gray-700 text-center mt-3 leading-relaxed px-2">
                  By placing your order you agree to our{" "}
                  <a href="/faq#terms" className="text-gray-500 hover:text-gray-300 underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/faq#refund" className="text-gray-500 hover:text-gray-300 underline">Refund Policy</a>.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Dev-only pricing debug panel */}
      <PricingDebugPanel dbPlanId={planId} />
    </MainLayout>
  );
}
