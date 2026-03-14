"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-12" style={{ background: 'var(--background)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src="/UniTokLogo.png" alt="UniTok" className="h-10" />
          <div style={{ color: 'var(--text-secondary)' }}>UniTok — real student reviews</div>
        </div>
        <div className="flex gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
