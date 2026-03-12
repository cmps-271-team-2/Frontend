"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { passwordSchema } from "@/lib/validators";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
        return;
      }
      setReady(true);
    });

    return () => unsub();
  }, [router]);

  async function handleSubmit() {
    setError(null);
    setMessage(null);

    if (!auth.currentUser) {
      setError("You must be logged in.");
      router.replace("/");
      return;
    }

    const currentPasswordCheck = passwordSchema.safeParse(currentPassword);
    if (!currentPasswordCheck.success) {
      setError(
        currentPasswordCheck.error.issues[0]?.message || "Invalid password"
      );
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
      const token = await auth.currentUser.getIdToken();
      await apiFetch<{ message: string }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
        authToken: token,
      });

      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-geist-sans)",
          background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
        }}
      >
        <p>Checking session...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top right, #e0f2fe, #fef3c7 45%, #f8fafc)",
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
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Change password</h1>
        <p style={{ color: "#475569", marginBottom: 18 }}>
          Update your password with your current credentials.
        </p>

        <label style={{ fontSize: 14 }}>Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
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

        <label style={{ fontSize: 14 }}>Confirm new password</label>
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
          {loading ? "Saving..." : "Change password"}
        </button>

        {message && <p style={{ marginTop: 12, color: "#16a34a" }}>{message}</p>}
        {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}
      </section>
    </main>
  );
}
