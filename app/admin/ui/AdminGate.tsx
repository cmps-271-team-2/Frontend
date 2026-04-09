"use client";

import { FormEvent, useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/api";
import AdminDashboard from "./AdminDashboard";

const SESSION_KEY = "admin_panel_authenticated";
const PASSWORD_KEY = "admin_panel_password";

export default function AdminGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const hasSession = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true";
    const hasPassword = typeof window !== "undefined" && !!sessionStorage.getItem(PASSWORD_KEY);
    if (hasSession && hasPassword) setAuthenticated(true);
  }, []);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    try {
      const url = `${getBackendUrl()}/admin/analytics`;
      console.debug("[AdminGate] POST to:", url);
      console.debug("[AdminGate] Password length:", password.length, "| first char:", password[0]);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Admin-Password": password,
        },
      });

      console.debug("[AdminGate] Response status:", res.status);

      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, "true");
        sessionStorage.setItem(PASSWORD_KEY, password);
        setAuthenticated(true);
        setError(null);
        return;
      }

      if (res.status === 401) {
        setError("Invalid admin password.");
      } else {
        setError(`Login failed: ${res.statusText}`);
      }
    } catch (err) {
      setError("Network error while validating admin password.");
    }
  }

  if (authenticated) return <AdminDashboard />;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-foreground/15 bg-foreground/5 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm opacity-80">Enter the admin password to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm opacity-80">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-foreground/20 bg-white px-3 py-2 text-slate-900 outline-none ring-0 focus:border-foreground/40"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg border border-foreground/20 bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
