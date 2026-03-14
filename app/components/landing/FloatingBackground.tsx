"use client";

import React, { useEffect, useState } from "react";
import { Star, Coffee, BookOpen } from "lucide-react";

type Variant = "stars" | "symbols";

interface FloatingBackgroundProps {
  variant: Variant;
  count?: number;
}

interface Particle {
  id: number;
  icon: "star" | "coffee" | "book";
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  glowColor: string;
  driftX: number;
  driftY: number;
  rotation: number;
}

const STAR_PALETTE = [
  { color: "#C56BFF", glow: "rgba(197,107,255,0.25)" },
  { color: "#5BC8FF", glow: "rgba(91,200,255,0.25)" },
];

const SYMBOL_MAP: Record<"star" | "coffee" | "book", { color: string; glow: string }> = {
  star:   { color: "#C56BFF", glow: "rgba(197,107,255,0.22)" },
  coffee: { color: "#FF9B54", glow: "rgba(255,155,84,0.22)" },
  book:   { color: "#69F28C", glow: "rgba(105,242,140,0.22)" },
};

export default function FloatingBackground({ variant, count = 28 }: FloatingBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const iconCycle: ("star" | "coffee" | "book")[] =
      variant === "stars"
        ? Array(count).fill("star")
        : Array.from({ length: count }, (_, i) => (["star", "coffee", "book"] as const)[i % 3]);

    const generated: Particle[] = iconCycle.map((icon, i) => {
      const palette =
        variant === "stars"
          ? STAR_PALETTE[i % STAR_PALETTE.length]
          : SYMBOL_MAP[icon];
      return {
        id: i,
        icon,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 12 + 10,
        duration: Math.random() * 14 + 12,      // 12‑26 s — very slow
        delay: Math.random() * 10,
        color: palette.color,
        glowColor: palette.glow,
        driftX: (Math.random() - 0.5) * 24,     // px horizontal drift
        driftY: -(Math.random() * 20 + 8),       // px vertical drift (upward)
        rotation: (Math.random() - 0.5) * 18,    // ±9 deg
      };
    });

    setParticles(generated);
    setMounted(true);
  }, [variant, count]);

  if (!mounted) return null;

  const renderIcon = (p: Particle) => {
    const fill = variant === "stars" ? p.color : "none";
    const strokeW = variant === "stars" ? 1 : 1.5;
    switch (p.icon) {
      case "coffee":
        return <Coffee size={p.size} fill={fill === "none" ? "none" : p.color} color={p.color} strokeWidth={strokeW} />;
      case "book":
        return <BookOpen size={p.size} fill={fill === "none" ? "none" : p.color} color={p.color} strokeWidth={strokeW} />;
      default:
        return <Star size={p.size} fill={p.color} color={p.color} strokeWidth={strokeW} />;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            filter: `drop-shadow(0 0 6px ${p.glowColor})`,
            animation: `floatDrift-${p.id} ${p.duration}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
            willChange: "transform, opacity",
          }}
        >
          {renderIcon(p)}
        </div>
      ))}

      {/* Per-particle keyframes for organic variety */}
      <style jsx>{`
        ${particles
          .map(
            (p) => `
          @keyframes floatDrift-${p.id} {
            0%   { transform: translate(0px, 0px) rotate(0deg) scale(1);    opacity: 0.07; }
            25%  { transform: translate(${p.driftX * 0.4}px, ${p.driftY * 0.3}px) rotate(${p.rotation * 0.3}deg) scale(1.02); opacity: 0.13; }
            50%  { transform: translate(${p.driftX}px, ${p.driftY}px) rotate(${p.rotation}deg) scale(1.05); opacity: 0.09; }
            75%  { transform: translate(${p.driftX * 0.6}px, ${p.driftY * 0.5}px) rotate(${p.rotation * 0.7}deg) scale(1.01); opacity: 0.15; }
            100% { transform: translate(${-p.driftX * 0.5}px, ${p.driftY * 0.8}px) rotate(${-p.rotation * 0.4}deg) scale(1.03); opacity: 0.06; }
          }`
          )
          .join("\n")}
      `}</style>
    </div>
  );
}
