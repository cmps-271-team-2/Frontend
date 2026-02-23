"use client";

import { useRouter } from "next/navigation";

export default function RatePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 18,
        paddingBottom: 130, // space for bottom bar
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div style={{ width: "min(760px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Create a rating</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontWeight: 700 }}>
            Choose a category to continue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/rate/select/spots")}
            style={{
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text)",
              cursor: "pointer",
              minHeight: 140,
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            Food / Study Spot
          </button>

          <button
            type="button"
            onClick={() => router.push("/rate/select/academics")}
            style={{
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text)",
              cursor: "pointer",
              minHeight: 140,
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            Professor / Course
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 12, color: "var(--muted)", fontWeight: 700 }}>
          Select an item from the database in the next step.
        </div>
      </div>
    </main>
  );
}
