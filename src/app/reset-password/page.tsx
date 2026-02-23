"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema, passwordSchema, verifyOtpSchema } from "@/lib/validators";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
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
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 900);
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
          "radial-gradient(circle at bottom, #fdf2f8, #eef2ff 40%, #f8fafc)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 18,
          padding: "28px 26px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Reset password</h1>
        <p style={{ color: "#475569", marginBottom: 18 }}>
          Enter the code sent to your email and choose a new password.
        </p>

        <label style={{ fontSize: 14 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ina06@mail.aub.edu"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 14,
            borderRadius: 10,
            border: "1px solid #cbd5f5",
          }}
        />

        <label style={{ fontSize: 14 }}>Reset code</label>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          inputMode="numeric"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 14,
            borderRadius: 10,
            border: "1px solid #cbd5f5",
          }}
        />

        <label style={{ fontSize: 14 }}>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min 8 characters"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 14,
            borderRadius: 10,
            border: "1px solid #cbd5f5",
          }}
        />

        <label style={{ fontSize: 14 }}>Confirm password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
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
          onClick={handleSubmit}
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
          }}
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>

        {message && <p style={{ marginTop: 12, color: "#16a34a" }}>{message}</p>}
        {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

        <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
          <Link href="/forgot-password" style={{ color: "#2563eb" }}>
            Request a new code
          </Link>
          <Link href="/login" style={{ color: "#2563eb" }}>
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
