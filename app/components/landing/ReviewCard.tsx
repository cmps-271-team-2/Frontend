"use client";

import React, { useState } from "react";

interface ReviewCardProps {
  title: string;
  quote: string;
  score: number;
  tag: string;
}

export default function ReviewCard({ title, quote, score, tag }: ReviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getAccentColor = () => {
    switch (tag.toLowerCase()) {
      case "professors":
        return "rgb(197, 107, 255)"; // Pure Purple
      case "food":
        return "rgb(255, 155, 84)";  // Pure Orange
      case "study spots":
        return "rgb(105, 242, 140)"; // Pure Green
      default:
        return "rgb(255, 255, 255)";
    }
  };

  const accentColor = getAccentColor();

  return (
    <div 
      className="w-full max-w-[480px] p-8 rounded-[2.5rem] transition-all duration-300 active:scale-[0.98] shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        /* FIXED: Removed transparency (/60) so it stays DEEP DARK BLACK in Light Mode */
        background: "#0a0a0a", 
        
        /* FIXED: Border becomes more visible on hover using the accent color */
        border: `2px solid ${isHovered ? accentColor.replace('rgb', 'rgba').replace(')', ', 0.6)') : 'rgba(255,255,255,0.05)'}`,

        transform: isHovered ? 'scale(1.02) translateY(-5px)' : 'scale(1)',
        boxShadow: isHovered 
          ? `0 20px 40px -15px ${accentColor.replace('rgb', 'rgba').replace(')', ', 0.3)')}` 
          : '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/10">A</div>
           
           <span 
             className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-colors"
             style={{ 
               background: isHovered ? accentColor.replace('rgb', 'rgba').replace(')', ', 0.2)') : 'rgba(255,255,255,0.08)',
               color: isHovered ? accentColor : 'white'
             }}
           >
             {tag}
           </span>
        </div>
        <div className="text-2xl font-black" style={{ color: isHovered ? '#FFD84D' : '#FFD84D', opacity: isHovered ? 1 : 0.8 }}>
          {score}
        </div>
      </div>

      {/* FIXED: Explicit text-white ensures it never turns black in Light Mode */}
      <h4 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h4>
      <p className="text-sm leading-relaxed text-white/70 font-medium">{quote}</p>
    </div>
  );
}