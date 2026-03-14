"use client";

import React from "react";

export default function FinalCTA({ onOpenAuth }: any) {
  return (
    <section className="w-full flex items-center justify-center px-6 py-36 relative overflow-hidden" style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* Subtle ambient glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(197,107,255,0.08) 0%, transparent 70%)' }} />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="display-font text-5xl md:text-7xl font-black leading-tight">Ready to <span className="accent-phrase-cta">UniTok</span> it?</h2>
        <p className="mt-6" style={{ color: 'var(--text-secondary)' }}>Join thousands of students sharing honest reviews — make smarter campus choices.</p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => onOpenAuth?.()}
            className="px-8 py-3 rounded-full font-semibold hover:scale-[1.02] transition-transform"
            style={{ background: 'white', color: 'var(--text-on-light)', boxShadow: '0 6px 32px rgba(197,107,255,0.10)' }}
          >
            Get Started
          </button>
          <button onClick={() => onOpenAuth?.()} className="px-8 py-3 rounded-full font-semibold hover:scale-[1.02] transition-transform" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>Write a Review</button>
        </div>
      </div>
    </section>
  );
}
