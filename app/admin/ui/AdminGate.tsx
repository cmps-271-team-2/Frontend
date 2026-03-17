"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

const SESSION_KEY = "admin_panel_authenticated";

export default function AdminGate() {
  const searchParams = useSearchParams();
  const bypass = searchParams.get("bypass") === "true";
  const configuredPassword = process.env.NEXT_PUBLIC_ADMIN_PANEL_PASSWORD;

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (bypass) return;
    const hasSession = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true";
    if (hasSession) setAuthenticated(true);
  }, [bypass]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!configuredPassword) {
      setError("Admin password is not configured. Set NEXT_PUBLIC_ADMIN_PANEL_PASSWORD in your env.");
      return;
    }

    if (password === configuredPassword) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setError(null);
      return;
    }

    setError("Invalid admin password.");
  }

  if (bypass || authenticated) {
    return <AdminDashboard />;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-foreground/15 bg-foreground/5 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm opacity-80">
          Enter the admin password to continue. Use <code>?bypass=true</code> in the URL to skip this screen.
        </p>

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
