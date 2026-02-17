"use client";

import { useRouter } from "next/navigation";

export default function RatePage() {
  const router = useRouter();

  const tiles = [
    { title: "Food spot", emoji: "🍽️", href: "/rate/food" },
    { title: "Study spot", emoji: "📚", href: "/rate/study" },
    { title: "Professor", emoji: "👨‍🏫", href: "/rate/professor" },
    { title: "Course", emoji: "🧾", href: "/rate/course" },
  ];

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
      <div style={{ width: "min(920px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Create a rating</h1>
          <p style={{ margin: "6px 0 0", color: "var(--muted)", fontWeight: 700 }}>
            Choose what you want to rate
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {tiles.map((t) => (
            <button
              key={t.title}
              onClick={() => router.push(t.href)}
              style={{
                height: 160,
                borderRadius: 18,
                border: "1px solid var(--border)",
                background: "var(--tile-bg)",
                color: "var(--tile-text)",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                transition: "transform 120ms ease, box-shadow 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 14px 30px rgba(0,0,0,0.16)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 10px 25px rgba(0,0,0,0.12)";
              }}
            >
              <div>
                <div style={{ fontSize: 34, lineHeight: 1 }}>{t.emoji}</div>
                <div style={{ marginTop: 10, fontWeight: 900, fontSize: 16 }}>
                  {t.title}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 700,
                  }}
                >
                  Tap to continue
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 14, color: "var(--muted)", fontWeight: 700 }}>
        </div>
      </div>
    </main>
  );
}
