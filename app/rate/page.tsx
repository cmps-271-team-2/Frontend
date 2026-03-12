"use client";

import { useRouter } from "next/navigation";

export default function RatePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 18,
        paddingBottom: 130,
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div style={{ width: "min(760px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Create a rating</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>
            Choose a category to continue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/rate/select/spots")}
            style={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text)",
              cursor: "pointer",
              minHeight: 140,
              fontWeight: 700,
              fontSize: 18,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,155,84,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Food / Study Spot
          </button>

          <button
            type="button"
            onClick={() => router.push("/rate/select/academics")}
            style={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text)",
              cursor: "pointer",
              minHeight: 140,
              fontWeight: 700,
              fontSize: 18,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(91,200,255,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Professor / Course
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 14, color: "var(--muted)", fontWeight: 600, fontSize: 13 }}>
          Select an item from the database in the next step.
        </div>
      </div>
    </main>
  );
}
