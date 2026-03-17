"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema, passwordSchema, verifyOtpSchema } from "@/lib/validators";
import { Mail, ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequestCode() {
    setError(null);
    setMessage(null);

    const parsed = aubEmailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid email");
      return;
    }

    try {
      setLoading(true);
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("A reset code has been sent to your email if the account exists.");
      setStep("reset");
    } catch (e: any) {
      setError(e.message || "Failed to request reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError(null);
    setMessage(null);

    const emailCheck = aubEmailSchema.safeParse(email);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0]?.message || "Invalid email");
      return;
    }

    const otpCheck = verifyOtpSchema.safeParse({ email, otp });
    if (!otpCheck.success) {
      setError(otpCheck.error.issues[0]?.message || "Invalid code");
      return;
    }

    const passwordCheck = passwordSchema.safeParse(newPassword);
    if (!passwordCheck.success) {
      setError(passwordCheck.error.issues[0]?.message || "Invalid password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        }),
      });
      setMessage("Password reset successful! Redirecting to sign in...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (e: any) {
      setError(e.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute left-[10%] top-[20%] w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(197,107,255,0.10) 0%, transparent 70%)" }}
        />
        <div
          className="absolute right-[10%] bottom-[15%] w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(91,200,255,0.06) 0%, transparent 70%)" }}
        />
      </div>

      <div
        className="w-full max-w-[460px] rounded-[2rem] overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 0 80px rgba(197,107,255,0.06), 0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Step 1: Request reset code ── */}
        {step === "request" && (
          <div className="p-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(197,107,255,0.08)", border: "1px solid rgba(197,107,255,0.15)" }}
            >
              <Mail style={{ color: "var(--neon-purple)" }} size={30} />
            </div>

            <h1
              className="text-2xl font-black mb-2 display-font"
              style={{ color: "var(--text-primary)" }}
            >
              Forgot <span className="accent-phrase">password?</span>
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              Enter your email and we&apos;ll send you a 6-digit reset code.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); handleRequestCode(); }}
              className="w-full space-y-4"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abc00@mail.aub.edu"
                disabled={loading}
                className="auth-field w-full p-4 rounded-xl outline-none transition-colors duration-200"
              />

              {error && (
                <p
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,80,80,0.08)", color: "#ff6b6b", border: "1px solid rgba(255,80,80,0.15)" }}
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "rgba(105,242,140,0.08)", color: "var(--neon-green)", border: "1px solid rgba(105,242,140,0.15)" }}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "white",
                  color: "var(--text-on-light)",
                  boxShadow: "0 4px 24px rgba(197,107,255,0.10)",
                }}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>

            <Link
              href="/"
              className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-tight transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neon-purple)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        )}

        {/* ── Step 2: Enter code + new password ── */}
        {step === "reset" && (
          <div className="p-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(91,200,255,0.08)", border: "1px solid rgba(91,200,255,0.15)" }}
            >
              <ShieldCheck style={{ color: "var(--neon-blue)" }} size={30} />
            </div>

            <h1
              className="text-2xl font-black mb-2 display-font"
              style={{ color: "var(--text-primary)" }}
            >
              Reset <span className="accent-phrase-blue">password</span>
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              Code sent to <b style={{ color: "var(--text-secondary)" }}>{email}</b>
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}
              className="w-full space-y-4"
            >
              {/* OTP input */}
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                disabled={loading}
                className="w-full rounded-xl py-4 text-center text-2xl font-black tracking-[0.25em] outline-none transition-colors duration-200"
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  caretColor: "var(--neon-blue)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(91,200,255,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              />

              {/* New password */}
              <div className="relative w-full">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  disabled={loading}
                  className="auth-field w-full p-4 pr-12 rounded-xl outline-none transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neon-purple)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative w-full">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  className="auth-field w-full p-4 pr-12 rounded-xl outline-none transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neon-purple)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,80,80,0.08)", color: "#ff6b6b", border: "1px solid rgba(255,80,80,0.15)" }}
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "rgba(105,242,140,0.08)", color: "var(--neon-green)", border: "1px solid rgba(105,242,140,0.15)" }}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "white",
                  color: "var(--text-on-light)",
                  boxShadow: "0 4px 24px rgba(91,200,255,0.10)",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-5">
              <button
                onClick={() => {
                  setStep("request");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                  setMessage(null);
                }}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight transition-colors"
                style={{ color: "var(--text-muted)", background: "none", border: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neon-blue)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <Link
                href="/"
                className="text-xs font-bold uppercase tracking-tight transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neon-purple)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
