"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomBar() {
  const pathname = usePathname() || "/";

  const active =
    pathname.startsWith("/profile")
      ? "profile"
      : pathname.startsWith("/rate")
      ? "rate"
      : "home";

  const tabStyle = (isActive: boolean) =>
    ({
      width: 78,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
      textDecoration: "none",
      padding: "6px 0",
      userSelect: "none",
      transition: "color 0.2s",
    } as const);

  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 120,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          padding: "10px 14px calc(env(safe-area-inset-bottom, 0px) + 10px)",
          background: "rgba(17,17,17,0.95)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {/* Home */}
        <Link href="/home" style={tabStyle(active === "home")} aria-label="Home">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 10v10h14V10" />
          </svg>
          <span style={{ fontSize: 11, marginTop: 4, textAlign: "center", fontWeight: 600 }}>
            Home
          </span>
        </Link>

        {/* Plus -> Choice Page */}
        <Link href="/rate/choice" aria-label="Create rating" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: 50,
              height: 34,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--neon-purple), var(--neon-hotpink))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                active === "rate"
                  ? "0 0 12px rgba(197,107,255,0.3), 0 0 0 2px rgba(255,255,255,0.15)"
                  : "0 4px 16px rgba(197,107,255,0.2)",
              transform: active === "rate" ? "translateY(-1px)" : "none",
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "white",
                lineHeight: 1,
              }}
            >
              +
            </span>
          </div>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          style={tabStyle(active === "profile")}
          aria-label="Profile"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          <span style={{ fontSize: 11, marginTop: 4, textAlign: "center", fontWeight: 600 }}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}
