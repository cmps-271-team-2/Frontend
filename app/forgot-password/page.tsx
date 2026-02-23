"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
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
      setMessage("If the email exists, a reset code has been sent.");
    } catch (e: any) {
      setError(e.message || "Failed to request reset.");
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
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Forgot password</h1>
        <p style={{ color: "#475569", marginBottom: 20 }}>
          We will email a 6-digit reset code if the account exists.
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
            background: "#1f2937",
            color: "#ffffff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send reset code"}
        </button>

        {message && <p style={{ marginTop: 12, color: "#16a34a" }}>{message}</p>}
        {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

        <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
          <Link href="/reset-password" style={{ color: "#2563eb" }}>
            Have a code? Reset now
          </Link>
          <Link href="/login" style={{ color: "#2563eb" }}>
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
