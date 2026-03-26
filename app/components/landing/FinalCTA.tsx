"use client";
import React from "react";

export default function FinalCTA({ onOpenAuth }: any) {
  return (
    <section id="final-cta" className="py-36 px-6 text-center">
      <h2 className="text-5xl md:text-7xl font-black mb-6" style={{ color: 'var(--text)' }}>
        Ready to <span className="accent-phrase-cta">UniTok</span> it?
      </h2>
      <p className="mb-10 max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
        Join thousands of students sharing honest reviews.
      </p>
      <button
        onClick={onOpenAuth}
        className="px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
        style={{ background: 'var(--text)', color: 'var(--bg)' }}
      >
        Get Started
      </button>
    </section>
  );
}