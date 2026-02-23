"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function isAubEmail(email: string) {
  return /^[^\s@]+@mail\.aub\.edu$/i.test(email) || /^[^\s@]+@aub\.edu$/i.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isAubEmail(email)) {
      setError("Please use an AUB email (aub.edu or mail.aub.edu).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Frontend-only mock login:
    router.push("/");
  }

  return (
    <main style={{ padding: 18, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ margin: "10px 0 6px" }}>Login</h1>
      <p style={{ marginTop: 0, color: "var(--muted)" }}>
        Frontend-only login (mock). Use AUB email format.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          border: "1px solid var(--border)",
          background: "var(--card)",
          borderRadius: 16,
          padding: 14,
          display: "grid",
          gap: 12,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)" }}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mail.aub.edu"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)" }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              outline: "none",
            }}
          />
        </label>

        {error ? (
          <div style={{ color: "#ff5a5f", fontSize: 13 }}>{error}</div>
        ) : null}

        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.08)",
            color: "var(--text)",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Log in
        </button>

        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          No account? <Link href="/register">Register</Link>
        </div>
      </form>
    </main>
  );
}
