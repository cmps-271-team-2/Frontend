"use client";

import { Search, LayoutGrid, GraduationCap, Coffee, BookOpen } from "lucide-react";

const CATEGORIES = [
  { id: "All", label: "All", icon: <LayoutGrid size={18} />, color: "var(--accent)" },
  { id: "Professor", label: "Prof", icon: <GraduationCap size={18} />, color: "var(--accent-blue)" },
  { id: "Cafeteria", label: "Café", icon: <Coffee size={18} />, color: "var(--accent-orange)" },
  { id: "Study Spot", label: "Study", icon: <BookOpen size={18} />, color: "var(--accent-green)" },
];

export default function GlobalHeader({ activeCategory, setActiveCategory }: any) {
  return (
    <>
      {/* ── Search bar ── */}
      <header className="fixed top-3 left-0 w-full z-[100] flex justify-center pointer-events-none">
        <div className="w-full max-w-[480px] pointer-events-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ratings..."
              className="w-full text-sm pl-12 pr-5 py-3 rounded-2xl outline-none transition-all duration-200"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(197,107,255,0.4)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35), 0 0 0 3px rgba(197,107,255,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
              }}
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
              size={18}
            />
          </div>
        </div>
      </header>

      {/* ── Category sidebar ── */}
      <nav className="fixed top-0 right-6 h-screen z-[100] flex flex-col items-center justify-center gap-5">
        <div className="mb-4 flex items-center justify-center">
          <img
            src="/UniTokLogo.png"
            alt="UniTok"
            className="w-16 h-auto object-contain opacity-90"
          />
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center justify-center w-[72px] h-[72px] rounded-2xl transition-all duration-200"
                style={{
                  background: isActive ? "var(--card-elevated)" : "var(--card)",
                  border: `1px solid ${isActive ? cat.color : "var(--border)"}`,
                  color: isActive ? cat.color : "var(--muted)",
                  boxShadow: isActive
                    ? `0 0 16px ${cat.color}22, 0 4px 12px rgba(0,0,0,0.3)`
                    : "0 2px 8px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = `${cat.color}60`;
                    e.currentTarget.style.color = cat.color;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 0 12px ${cat.color}15, 0 4px 12px rgba(0,0,0,0.3)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--muted)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                  }
                }}
              >
                {cat.icon}
                <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
