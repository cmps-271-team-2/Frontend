"use client";

import { 
  Clock, 
  ArrowUpDown, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Star, 
  StarOff, 
  Sparkles 
} from "lucide-react";

export default function SortBar({ activeSort, setActiveSort }: any) {

  const sortOptions = [
    { id: "relevant", label: "Relevant", icon: <Sparkles size={18} />, color: "var(--accent)" },
    { id: "newest", label: "Newest", icon: <Clock size={18} />, color: "var(--accent-blue)" },
    { id: "oldest", label: "Oldest", icon: <ArrowUpDown size={18} />, color: "var(--accent-orange)" },
    { id: "highestRating", label: "Top Rated", icon: <Star size={18} />, color: "var(--accent-green)" },
    { id: "lowestRating", label: "Low Rated", icon: <StarOff size={18} />, color: "var(--accent)" }
  ];

  return (
    <nav className="fixed top-0 left-6 h-screen z-[100] flex flex-col items-center justify-center gap-5">

      <div className="flex flex-col gap-3">
        {sortOptions.map((option) => {

          const isActive = activeSort === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setActiveSort(option.id)}
              className="flex flex-col items-center justify-center w-[72px] h-[72px] rounded-2xl transition-all duration-200"
              style={{
                background: isActive ? "var(--card-elevated)" : "var(--card)",
                border: `1px solid ${isActive ? option.color : "var(--border)"}`,
                color: isActive ? option.color : "var(--muted)",
                boxShadow: isActive
                  ? `0 0 16px ${option.color}22, 0 4px 12px rgba(0,0,0,0.3)`
                  : "0 2px 8px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${option.color}60`;
                  e.currentTarget.style.color = option.color;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 0 12px ${option.color}15, 0 4px 12px rgba(0,0,0,0.3)`;
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

              {option.icon}

              <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">
                {option.label}
              </span>

            </button>
          );
        })}
      </div>

    </nav>
  );
}