"use client";

import { Search, LayoutGrid, GraduationCap, Coffee, BookOpen } from "lucide-react";

export default function GlobalHeader({ activeCategory, setActiveCategory }: any) {
  const categories = [
    { id: "All", label: "All", icon: <LayoutGrid size={20} /> },
    { id: "Professor", label: "Prof", icon: <GraduationCap size={20} /> },
    { id: "Cafeteria", label: "Café", icon: <Coffee size={20} /> },
    { id: "Study Spot", label: "Study", icon: <BookOpen size={20} /> },
  ];

  return (
    <>
      <header className="fixed top-2 left-0 w-full z-[100] flex justify-center pointer-events-none">
        <div className="w-full max-w-[500px] pointer-events-auto px-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white border-2 border-black text-black text-sm pl-14 pr-6 py-3 rounded-full outline-none shadow-xl focus:border-blue-600 transition-all placeholder:text-zinc-400"
            />
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-black"
              size={20}
            />
          </div>
        </div>
      </header>

      <nav className="fixed top-0 right-8 h-screen z-[100] flex flex-col items-center justify-center gap-6">
        <div className="mb-6 flex items-center justify-center">
          <img
            src="/picture.png"
            alt="AUB Rate"
            className="w-[140px] h-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center w-20 h-20 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group
              ${activeCategory === cat.id ? "bg-blue-50 border-blue-600" : ""}`}
            >
              <div className={activeCategory === cat.id ? "text-blue-600" : "text-black"}>
                {cat.icon}
              </div>
              <span
                className={`text-[10px] font-black uppercase mt-1 tracking-tighter ${
                  activeCategory === cat.id ? "text-blue-600" : "text-black"
                }`}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
