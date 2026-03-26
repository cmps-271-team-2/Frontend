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
    <button
      onClick={toggle}
      aria-label="Toggle Theme"
      className="fixed top-6 right-6 z-[10000] p-2 transition-transform active:scale-90 group"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      {/* The Lamp SVG */}
      <svg 
        width="60" 
        height="80" 
        viewBox="0 0 100 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl"
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
          className="group-hover:translate-y-1 transition-transform"
        />
      </svg>
      
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ color: 'var(--muted)' }}>
        Pull to Switch
      </span>
    </button>
  );
}