import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getApiBase } from "@workspace/api-client-react";
import { Satellite, Mail, Lock, MessageSquare, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

type AuthMode = "otp" | "password";
type OtpStep = "email" | "code";

export default function Login() {
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>("otp");
  const [isRegister, setIsRegister] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Password state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get("redirect") || "/dashboard";

  // Countdown timer for resend
  const startCountdown = (secs = 60) => {
    setResendCountdown(secs);
    const t = setInterval(() => {
      setResendCountdown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!otpEmail.trim()) { setError("Enter your email address"); return; }
    setError(""); setLoading(true);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP"); setLoading(false); return; }
      setOtpSent(true);
      setOtpStep("code");
      startCountdown(60);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        setSuccess(`Dev mode: your OTP is ${data.devOtp}`);
      } else {
        setSuccess("Code sent! Check your email.");
      }
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) { setError("Enter your 6-digit code"); return; }
    setError(""); setLoading(true);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim(), code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid code"); setLoading(false); return; }
      localStorage.setItem("starlink_token", data.token);
      localStorage.setItem("orbit_email", data.user.email);
      window.location.href = redirect;
    } catch { setError("Network error."); }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.07)_0%,transparent_70%)]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4">
            <Satellite className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-widest text-white">OrbitFuture</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Customer Portal</p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("otp"); setError(""); setSuccess(""); }}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all ${mode === "otp" ? "bg-primary text-black" : "text-muted-foreground hover:text-white"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            OTP Login
          </button>
          <button
            onClick={() => { setMode("password"); setError(""); setSuccess(""); }}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all ${mode === "password" ? "bg-primary text-black" : "text-muted-foreground hover:text-white"}`}
          >
            <Lock className="w-3.5 h-3.5" />
            Password
          </button>
        </div>

        <Card className="bg-background/80 backdrop-blur-xl border-border">
          <CardHeader className="text-center pt-8 pb-4 border-b border-border/50">
            {mode === "otp" ? (
              <>
                <CardTitle className="text-base font-bold uppercase tracking-widest text-white">
                  {otpStep === "email" ? "Sign In with Email" : "Enter Verification Code"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {otpStep === "email" ? "No password needed — we'll send a code to your email" : `Code sent to ${otpEmail}`}
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-base font-bold uppercase tracking-widest text-white">
                  {isRegister ? "Create Account" : "Sign In"}
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest">
                  {isRegister ? "Join OrbitFuture" : "Access your portal"}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-6 px-8 pb-8">
            {/* OTP mode */}
            {mode === "otp" && (
              <>
                {otpStep === "email" && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Your email address"
                        value={otpEmail}
                        onChange={e => setOtpEmail(e.target.value)}
                        className="h-12 bg-card pl-10"
                        required
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-destructive text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full h-12 uppercase tracking-widest font-bold" disabled={loading}>
                      {loading ? "Sending..." : (
                        <span className="flex items-center gap-2">Send Code <ArrowRight className="w-4 h-4" /></span>
                      )}
                    </Button>
                  </form>
                )}

                {otpStep === "code" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {success && (
                      <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-700/30 rounded-lg px-3 py-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <p className="text-xs text-emerald-400">{success}</p>
                      </div>
                    )}
                    <div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="h-14 bg-card text-center text-2xl font-mono font-bold tracking-[0.5em]"
                        required
                        maxLength={6}
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground text-center mt-2">Enter the 6-digit code from your email</p>
                    </div>
                    {error && <p className="text-destructive text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full h-12 uppercase tracking-widest font-bold" disabled={loading || otpCode.length < 6}>
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                    <div className="text-center">
                      {resendCountdown > 0 ? (
                        <p className="text-xs text-muted-foreground">Resend in {resendCountdown}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
                        >
                          <RefreshCw className="w-3 h-3" /> Resend code
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setOtpStep("email"); setOtpCode(""); setError(""); setSuccess(""); setDevOtp(""); }}
                        className="text-xs text-muted-foreground hover:text-white mt-2 block mx-auto"
                      >
                        ← Change email
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Password mode */}
            {mode === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {isRegister && (
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-12 bg-card"
                    required
                  />
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 bg-card pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 bg-card pl-10"
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full h-12 uppercase tracking-widest font-bold" disabled={loading}>
                  {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setError(""); }}
                    className="text-xs text-gray-500 hover:text-primary transition-colors"
                  >
                    {isRegister ? "Already have an account? Sign in" : "New here? Create an account"}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          orbitfuture.store · Secure satellite internet worldwide
        </p>
      </div>
    </div>
  );
}
