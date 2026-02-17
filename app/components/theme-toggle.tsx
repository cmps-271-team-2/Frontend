"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      title="Toggle theme"
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 9999,
        width: 44,
        height: 44,
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--card)",
        color: "var(--text)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      <AppleThemeIcon theme={theme} />
    </button>
  );
}

function AppleThemeIcon({ theme }: { theme: "light" | "dark" }) {
  const isDark = theme === "dark";

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3a9 9 0 0 0 0 18V3z" fill={isDark ? "currentColor" : "none"} />
      <circle cx="12" cy="12" r="3.2" fill="var(--bg)" />
    </svg>
  );
}
