"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import FloatingBackground from "./FloatingBackground";

type Props = { onOpenAuth?: () => void };

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] as const } },
};

export default function Hero({ onOpenAuth }: Props) {
  return (
    <section className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Ambient glow blobs — logo-derived colors */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[5%] top-[15%] w-[420px] h-[420px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(197,107,255,0.14) 0%, transparent 70%)' }} />
        <div className="absolute right-[8%] bottom-[10%] w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(91,200,255,0.08) 0%, rgba(105,242,140,0.04) 60%, transparent 100%)' }} />
        <div className="absolute left-[50%] top-[60%] w-[200px] h-[200px] rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(255,216,77,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Floating star particles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <FloatingBackground variant="stars" count={32} />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* left */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="md:col-span-7">
            <motion.p variants={fadeUp} className="inline-block mb-6 px-3 py-1 rounded-full text-sm uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>Your campus, your voice</motion.p>
            <motion.h1 variants={fadeUp} className="display-font text-[3.2rem] md:text-[5rem] leading-[0.92] font-black tracking-tight">
              <span className="block">Find it. Rate it.</span>
              <span className="block"><span className="accent-phrase">UniTok</span> it.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-lg max-w-2xl font-medium" style={{ color: 'var(--text-secondary)' }}>
              Honest student reviews for professors, food, and study spots — decide with confidence.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onOpenAuth?.()}
                className="px-7 py-3 rounded-full font-semibold hover:scale-[1.02] transition-transform"
                style={{ background: 'white', color: 'var(--text-on-light)', boxShadow: '0 8px 40px rgba(197,107,255,0.10)' }}
              >
                Explore Reviews
              </button>
              <button onClick={() => onOpenAuth?.()} className="px-7 py-3 rounded-full font-semibold transition-all hover:scale-[1.02]" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>Write a Review</button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              <span className="inline-block animate-bounce">Scroll to explore ↓</span>
            </motion.div>
          </motion.div>

          {/* right */}
          <motion.div variants={fadeUp} className="md:col-span-5 flex items-center justify-center">
            <div className="w-[320px] md:w-[420px] aspect-[3/4] relative card-surface p-6">
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-xl bg-[var(--neon-purple)]/10 blur-xl" />
              <div className="relative z-10">
                <img src="/UniTokLogo.png" alt="UniTok" className="w-36 mx-auto mb-6 opacity-95" />
                <div className="space-y-4">
                  <div className="bg-[#0b0b0b] p-4 rounded-xl border border-white/6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-on-dark)' }}>Food Review</div>
                        <div className="text-lg font-bold" style={{ color: 'var(--text-on-dark)' }}>Midd Hall Food</div>
                      </div>
                      <div className="font-black" style={{ color: 'var(--neon-yellow)' }}>4.7</div>
                    </div>
                    <p className="mt-3 text-sm" style={{ color: 'var(--muted-on-dark)' }}>Great coffee and quiet corners for group work.</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--neon-blue)]/10 flex items-center justify-center" style={{ color: 'var(--text-on-dark)' }}>📚</div>
                    <div className="w-12 h-12 rounded-xl bg-[var(--neon-green)]/10 flex items-center justify-center" style={{ color: 'var(--text-on-dark)' }}>🍽️</div>
                    <div className="w-12 h-12 rounded-xl bg-[var(--neon-orange)]/10 flex items-center justify-center" style={{ color: 'var(--text-on-dark)' }}>👩‍🏫</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-6 w-40 h-20 rounded-full bg-gradient-to-r from-[rgba(197,107,255,0.06)] to-[rgba(255,79,203,0.04)] blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
