"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Coffee, BookOpen, type LucideIcon } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { 
  hidden: { opacity: 0, y: 16 }, 
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const } } 
};

interface StepCardProps {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
  accentColor: string;
  accentRgb: string;
}

function StepCard({ icon: Icon, step, title, desc, accentColor, accentRgb }: StepCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover="hovered"
      initial="rest"
      animate="rest"
    >
      <motion.div
        variants={{
          rest: { 
            y: 0, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)', 
            borderColor: 'var(--border)' 
          },
          hovered: {
            y: -8,
            boxShadow: `0 0 0 1px rgba(${accentRgb},0.55), 0 8px 48px rgba(${accentRgb},0.12), 0 24px 56px rgba(0,0,0,0.1)`,
            borderColor: `rgba(${accentRgb},0.55)`,
            transition: { duration: 0.28, ease: 'easeOut' },
          },
        }}
        style={{
          background: 'var(--card)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          height: 252,
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          transition: 'background 0.3s ease, border-color 0.3s ease'
        }}
      >
        {/* Step badge */}
        <div className="mb-4 flex items-center gap-3">
          <motion.div
            variants={{
              rest:    { background: `rgba(${accentRgb},0.10)`, color: accentColor },
              hovered: { background: `rgba(${accentRgb},0.22)`, color: accentColor, transition: { duration: 0.22 } },
            }}
            style={{ width: 44, height: 44, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Icon size={20} />
          </motion.div>
          
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>{step}</span>
        </div>

        {/* Title */}
        <motion.h3
          
          variants={{ 
            rest: { color: 'var(--text)' }, 
            hovered: { color: accentColor, transition: { duration: 0.22 } } 
          }}
          className="text-xl font-bold mb-3 leading-snug"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </motion.h3>

        {/* Description */}
        
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>

        {/* Bottom accent line */}
        <div className="mt-auto pt-4">
          <motion.div
            variants={{
              rest:    { scaleX: 0, transformOrigin: 'left' },
              hovered: { scaleX: 1, transformOrigin: 'left', transition: { duration: 0.3, ease: 'easeOut' } },
            }}
            style={{ height: 2, borderRadius: 1, background: `linear-gradient(90deg, rgba(${accentRgb},0.8), transparent)` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="w-full flex items-center justify-center px-6 transition-colors duration-300"
      style={{ background: 'transparent', minHeight: '100vh', paddingTop: '7rem', paddingBottom: '7rem' }}
    >
      <div className="max-w-6xl w-full mx-auto">
        <div className="text-center mb-16">
          {/* ✅ Fixed: Label border and text */}
          <div className="inline-block px-4 py-1 rounded-full border text-sm font-bold uppercase tracking-widest mb-6" 
               style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            How it works
          </div>
          
          {/* ✅ Fixed: Main heading text color */}
          <h2 className="text-5xl md:text-7xl font-black mb-6 italic leading-[1.1]" style={{ color: 'var(--text)' }}>
            Simple steps to <span className="accent-phrase inline-block pr-4">share</span> and discover
          </h2>
          
          {/* ✅ Fixed: Sub-paragraph text color */}
          <p className="max-w-xl mx-auto text-base" style={{ color: 'var(--muted)' }}>
            Pick a category, drop an honest review, help your campus community.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <StepCard
            icon={Star}
            step="Step 01"
            title="Pick a category"
            desc="Professors, food spots, or study spots — choose where your review belongs."
            accentColor="var(--neon-purple)"
            accentRgb="197,107,255"
          />
          <StepCard
            icon={Coffee}
            step="Step 02"
            title="Share your experience"
            desc="Write a short, honest review with an optional score — anonymous by default."
            accentColor="var(--neon-orange)"
            accentRgb="255,155,84"
          />
          <StepCard
            icon={BookOpen}
            step="Step 03"
            title="Help others decide"
            desc="Your review surfaces to classmates and helps them pick the best options on campus."
            accentColor="var(--neon-green)"
            accentRgb="105,242,140"
          />
        </motion.div>
      </div>
    </section>
  );
}