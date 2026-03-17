"use client";

import React from "react";
import { motion } from "framer-motion";

const variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function ReviewCard({ title, quote, score, tag }: any) {
  return (
    <motion.div variants={variants} className="card-surface p-6 rounded-xl w-full max-w-md">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>A</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: tag === 'Professors' ? 'rgba(197,107,255,0.1)' : tag === 'Food' ? 'rgba(255,155,84,0.1)' : 'rgba(105,242,140,0.1)', color: tag === 'Professors' ? 'var(--neon-purple)' : tag === 'Food' ? 'var(--neon-orange)' : 'var(--neon-green)' }}>{tag}</div>
            <div className="font-black" style={{ color: 'var(--neon-yellow)' }}>{score}</div>
          </div>
          <div className="mt-2 font-semibold">{title}</div>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>{quote}</p>
        </div>
      </div>
    </motion.div>
  );
}
