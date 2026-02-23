"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { aubEmailSchema } from "@/lib/validators";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);

    // Frontend email validation (UX only)
    const emailCheck = aubEmailSchema.safeParse(email);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      // Temporary success
      alert("Login successful ✅");
    } catch (e: any) {
      // Firebase-specific error handling
      if (e.code === "auth/user-disabled") {
        setError("Your account is not verified yet. Please verify your email code.");
      } else if (e.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (e.code === "auth/user-not-found") {
        setError("No account found for this email.");
      } else {
        setError(e.message ?? "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Login</h1>

      <label>Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ina06@mail.aub.edu"
        style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 14 }}
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Your password"
        style={{ width: "100%", padding: 10, marginTop: 6, marginBottom: 14 }}
      />

      <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 10 }}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}
    </main>
  );
}
