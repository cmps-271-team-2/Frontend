"use client";

import { useRouter } from "next/navigation";

export default function RatingChoicePage() {
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
      <div style={{ width: "min(640px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Create a rating</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontWeight: 700 }}>
            Choose a category to get started
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/rate/select/spots")}
            style={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text)",
              cursor: "pointer",
              minHeight: 160,
              padding: 16,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,155,84,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            <div>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️📚</div>
              <div>Food / Study Spot</div>
            </div>
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
              minHeight: 160,
              padding: 16,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(91,200,255,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            <div>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍🏫📖</div>
              <div>Professor / Course</div>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
