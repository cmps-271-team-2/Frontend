"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = saved || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <>
      <button
        onClick={toggle}
        aria-label="Toggle Theme"
        className="fixed right-3 top-[calc(env(safe-area-inset-top,0px)+10px)] z-[220] flex h-9 w-9 items-center justify-center rounded-full border md:hidden"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text)",
          cursor: "pointer",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {theme === "dark" ? (
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2.5V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 19V21.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4.93 4.93L6.7 6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17.3 17.3L19.07 19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M2.5 12H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M19 12H21.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4.93 19.07L6.7 17.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17.3 6.7L19.07 4.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      <button
        onClick={toggle}
        aria-label="Toggle Theme"
        className="group fixed right-6 top-6 z-[900] hidden p-2 transition-transform active:scale-90 md:block"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        {/* The Lamp SVG */}
        <svg
          width="46"
          height="62"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[80px] w-[60px] drop-shadow-xl"
        >
          {/*glow effect */}
          {theme === "light" && (
            <circle cx="50" cy="45" r="30" fill="#FFD84D" fillOpacity="0.2" className="animate-pulse" />
          )}

          <path
            d="M30 50L40 20H60L70 50H30Z"
            fill={theme === "light" ? "#FFD84D" : "#333"}
            stroke={theme === "light" ? "#EAB308" : "#555"}
            strokeWidth="2"
          />

          <circle cx="50" cy="55" r="6" fill={theme === "light" ? "#FFD84D" : "#444"} />

          <rect x="48" y="60" width="4" height="40" fill="#71717a" />

          <path d="M35 105C35 102 40 100 50 100C60 100 65 102 65 105H35Z" fill="#71717a" />

          <line x1="75" y1="35" x2="75" y2="70" stroke="#71717a" strokeWidth="1" />
          <circle
            cx="75"
            cy="75"
            r="4"
            fill={theme === "light" ? "#FFD84D" : "#71717a"}
            className="transition-transform group-hover:translate-y-1"
          />
        </svg>

        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--muted)" }}>
          Pull to Switch
        </span>
      </button>
    </>
  );
}