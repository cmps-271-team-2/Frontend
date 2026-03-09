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
      color: isActive ? "#ffffff" : "rgba(255,255,255,0.78)",
      textDecoration: "none",
      padding: "6px 0",
      userSelect: "none",
    } as const);

  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none", // makes the outer wrapper ignore clicks
      }}
    >
      <div
        style={{
          pointerEvents: "auto", // bar itself is clickable
          width: "100%",
          maxWidth: 520,
          margin: "0 auto",
          padding: "10px 14px calc(env(safe-area-inset-bottom, 0px) + 10px)",
          background: "rgba(0,0,0,0.92)",
          border: "1px solid rgba(255,255,255,0.18)", // clear outline
          borderBottom: "none",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          boxShadow: "0 -10px 30px rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {/* Home */}
        <Link href="/home" style={tabStyle(active === "home")} aria-label="Home">
          <svg
            width="24"
            height="24"
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
          <span style={{ fontSize: 12, marginTop: 4, textAlign: "center" }}>
            Home
          </span>
        </Link>

        {/* Plus -> Choice Page */}
        <Link href="/rate/choice" aria-label="Create rating" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: 55,
              height: 35,
              borderRadius: 14,
              background: "linear-gradient(90deg,#ff416c,#ff4b2b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                active === "rate"
                  ? "0 0 0 2px rgba(255,255,255,0.25)"
                  : "0 6px 18px rgba(0,0,0,0.45)",
              transform: active === "rate" ? "translateY(-1px)" : "none",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
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
            width="24"
            height="24"
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
          <span style={{ fontSize: 12, marginTop: 4, textAlign: "center" }}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}
