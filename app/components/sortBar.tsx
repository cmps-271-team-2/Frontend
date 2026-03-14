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
    { id: "relevant", label: "Relevant", icon: <Sparkles size={20} /> },
    { id: "newest", label: "Newest", icon: <Clock size={20} /> },
    { id: "oldest", label: "Oldest", icon: <ArrowUpDown size={20} /> },
    { id: "highestRating", label: "Top Rated", icon: <Star size={20} /> },
    { id: "lowestRating", label: "Low Rated", icon: <StarOff size={20} /> },
    { id: "alphabetical", label: "A-Z", icon: <ArrowDownAZ size={20} /> }
  ];

  return (
    <nav className="fixed top-0 left-8 h-screen z-[100] flex flex-col items-center justify-center gap-6">

      <div className="flex flex-col gap-4">
        {sortOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveSort(option.id)}
            className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-black transition-all duration-200 group relative
              ${
                activeSort === option.id
                  ? "bg-white shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
          >

            {activeSort === option.id && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
            )}

            <div className={`relative z-10 ${activeSort === option.id ? "text-purple-600" : "text-black"}`}>
              {option.icon}
            </div>

            <span
              className={`relative z-10 text-[10px] font-black uppercase mt-1 tracking-tighter
              ${activeSort === option.id ? "text-purple-600" : "text-black"}`}
            >
              {option.label}
            </span>

          </button>
        ))}
      </div>

    </nav>
  );
}