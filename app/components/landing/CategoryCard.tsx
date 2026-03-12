"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] as const } },
};

interface CategoryCardProps {
  icon: React.ReactNode;
  color?: string;
  title: string;
  desc: string;
  backText?: string;
  accentRgb?: string;
  accentColor?: string;
}

/* Accent fallback map keyed by color name */
const ACCENT: Record<string, { rgb: string; css: string }> = {
  purple: { rgb: "197,107,255", css: "var(--neon-purple)" },
  orange: { rgb: "255,155,84",  css: "var(--neon-orange)" },
  green:  { rgb: "105,242,140", css: "var(--neon-green)" },
};

export default function CategoryCard({
  icon,
  color = "purple",
  title,
  desc,
  backText,
  accentRgb,
  accentColor,
}: CategoryCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const rgb = accentRgb ?? ACCENT[color]?.rgb ?? ACCENT.purple.rgb;
  const css = accentColor ?? ACCENT[color]?.css ?? ACCENT.purple.css;

  /* ── Shared glow variants (matches page 3 StepCard) ── */
  const glowRest = {
    y: 0,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    borderColor: "rgba(255,255,255,0.05)",
  };
  const glowHover = {
    y: -8,
    boxShadow: `0 0 0 1px rgba(${rgb},0.55), 0 8px 48px rgba(${rgb},0.18), 0 24px 56px rgba(0,0,0,0.5)`,
    borderColor: `rgba(${rgb},0.55)`,
    transition: { duration: 0.28, ease: "easeOut" as const },
  };

  const faceBase: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    height: 264,
    display: "flex",
    flexDirection: "column",
    userSelect: "none",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return (
    <motion.div
      variants={cardVariants}
      style={{ perspective: 1000 }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped((f) => !f)}
    >
      {/* Glow / lift wrapper — stays in 2-D so glow looks correct */}
      <motion.div
        animate={isFlipped ? "hovered" : "rest"}
        variants={{ rest: glowRest, hovered: glowHover }}
        style={{ borderRadius: "var(--radius-lg)", position: "relative" }}
      >
        {/* 3-D flip container */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d", position: "relative" }}
        >
          {/* ── Front face ── */}
          <div style={faceBase}>
            <div className="mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(${rgb},0.12)`, color: css }}
              >
                {icon}
              </div>
            </div>

            <h3
              className="text-2xl font-bold display-font mb-3 leading-snug"
              style={{ color: "var(--text-on-dark)" }}
            >
              {title}
            </h3>

            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {desc}
            </p>

            {/* Accent line — matches page 3 */}
            <div className="mt-auto pt-4">
              <motion.div
                animate={isFlipped ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  height: 2,
                  borderRadius: 1,
                  background: `linear-gradient(90deg, rgba(${rgb},0.8), transparent)`,
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>

          {/* ── Back face ── */}
          <div
            style={{
              ...faceBase,
              transform: "rotateY(180deg)",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: `rgba(${rgb},0.14)`, color: css }}
            >
              {icon}
            </div>

            <p
              className="text-base font-medium leading-relaxed max-w-[18rem]"
              style={{ color: "var(--text-secondary)" }}
            >
              {backText || desc}
            </p>

            {/* Centered accent bar */}
            <div className="w-full mt-auto pt-5 flex justify-center">
              <div
                style={{
                  width: "60%",
                  height: 2,
                  borderRadius: 1,
                  background: `linear-gradient(90deg, transparent, rgba(${rgb},0.6), transparent)`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
