"use client";

import React from "react";

export default function Footer() {
  return (
    <footer 
      className="w-full py-12 transition-colors duration-300" 
      style={{ 
        background: 'var(--bg)', // Changed from --background to match your page.tsx
        borderTop: '1px solid var(--border)' 
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src="/UniTokLogo.png" alt="UniTok" className="h-10 w-auto object-contain" />
          <div 
            className="text-sm font-medium tracking-wide italic"
            style={{ color: 'var(--text)', opacity: 0.7 }} // Using var(--text) with opacity ensures it's always visible
          >
            UniTok — real student reviews
          </div>
        </div>
        
        {/* Optional: Add a copyright or simple links here if you want to fill the right side */}
        <div className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text)', opacity: 0.5 }}>
          © 2026 
        </div>
      </div>
    </footer>
  );
}