"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema, passwordSchema, verifyOtpSchema } from "@/lib/validators";

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top, #f5f1e8, #e7edf6 45%, #f7fafc)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          borderRadius: 18,
          padding: "28px 26px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        {step === "request" && (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>Forgot password</h1>
            <p style={{ color: "#475569", marginBottom: 20 }}>
              Enter your email and we&apos;ll send you a 6-digit reset code.
            </p>

            <label style={{ fontSize: 14, color: "#334155" }}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ina06@mail.aub.edu"
              disabled={loading}
              className="auth-input"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 6,
                marginBottom: 16,
                borderRadius: 10,
                border: "1px solid #cbd5f5",
              }}
            />

            <button
              onClick={handleRequestCode}
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: "#1f2937",
                color: "#ffffff",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>

            {message && <p style={{ marginTop: 12, color: "#16a34a" }}>{message}</p>}
            {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

            <div style={{ marginTop: 18 }}>
              <Link href="/" style={{ color: "#2563eb", fontSize: 14 }}>
                ← Back to sign in
              </Link>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>Reset password</h1>
            <p style={{ color: "#475569", marginBottom: 18 }}>
              Enter the code sent to <strong>{email}</strong> and choose a new password.
            </p>

            <label style={{ fontSize: 14, color: "#334155" }}>Reset code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              disabled={loading}
              className="auth-input"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 6,
                marginBottom: 14,
                borderRadius: 10,
                border: "1px solid #cbd5f5",
              }}
            />

            <label style={{ fontSize: 14, color: "#334155" }}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              disabled={loading}
              className="auth-input"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 6,
                marginBottom: 14,
                borderRadius: 10,
                border: "1px solid #cbd5f5",
              }}
            />

            <label style={{ fontSize: 14, color: "#334155" }}>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              disabled={loading}
              className="auth-input"
              style={{
                width: "100%",
                padding: 12,
                marginTop: 6,
                marginBottom: 16,
                borderRadius: 10,
                border: "1px solid #cbd5f5",
              }}
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>

            {message && <p style={{ marginTop: 12, color: "#16a34a" }}>{message}</p>}
            {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

            <div style={{ marginTop: 18, display: "flex", gap: 16, fontSize: 14 }}>
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
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: loading ? "not-allowed" : "pointer",
                  padding: 0,
                }}
              >
                ← Back
              </button>
              <Link href="/" style={{ color: "#2563eb" }}>
                Go to sign in
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
