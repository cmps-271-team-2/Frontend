"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("Student");
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [showMyRatingsPublicly, setShowMyRatingsPublicly] = useState(false);

  const cardStyle: React.CSSProperties = {
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 14,
    background: "var(--card)",
    color: "var(--text)",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderTop: "1px solid var(--border)",
  };

  const labelStyle: React.CSSProperties = { color: "var(--muted)", fontWeight: 700 };

  const inputStyle: React.CSSProperties = {
    width: 220,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--tile-bg)",
    color: "var(--tile-text)",
    outline: "none",
  };

  return (
    <main style={{ padding: 18, paddingBottom: 130, maxWidth: 700 }}>
      <h1 style={{ margin: 0, fontSize: 22, color: "var(--text)" }}>Profile</h1>
      <p style={{ color: "var(--muted)", marginTop: 6 }}>Settings for now</p>

      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Account</h2>

          <div style={{ ...rowStyle, borderTop: "none" }}>
            <div style={labelStyle}>Display name</div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>Show my ratings on my profile</div>
            <input
              type="checkbox"
              checked={showMyRatingsPublicly}
              onChange={(e) => setShowMyRatingsPublicly(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>Email notifications (replies/updates)</div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Session</h2>
          <p style={{ color: "var(--muted)", marginTop: 6, marginBottom: 12 }}>
            Log out of your account.
          </p>

          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--text)",
              color: "var(--bg)",
              cursor: "pointer",
              width: 160,
              fontWeight: 900,
            }}
          >
            Log out
          </button>
        </section>
      </div>
    </main>
  );
}
