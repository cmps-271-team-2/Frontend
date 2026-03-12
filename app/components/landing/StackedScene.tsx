"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface StackedSceneProps {
  id?: string;
  zIndex: number;
  /** Total outer height — the "scroll runway" for the sticky phase. */
  sceneHeightVh?: number;
  /** Negative overlap with the previous section (creates layering). */
  overlapVh?: number;
  panelBackground?: string;
  glowGradient?: string;
  /** If true, skip the enter animation (used for the very first panel). */
  isFirst?: boolean;
  children: React.ReactNode;
}

export default function StackedScene({
  id,
  zIndex,
  sceneHeightVh = 160,
  overlapVh = 0,
  panelBackground = "var(--background)",
  glowGradient = "radial-gradient(circle at 50% 100%, rgba(197,107,255,0.22) 0%, rgba(91,200,255,0.14) 36%, transparent 72%)",
  isFirst = false,
  children,
}: StackedSceneProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  // Track how far this section has scrolled into view
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });

  // Map early portion of scroll to 0→1 for the entrance animation
  const enterProgress = useTransform(scrollYProgress, [0.0, 0.35], [0, 1]);

  // --- Entrance motion values (disabled for the first panel) ---
  const translateY = useTransform(enterProgress, [0, 1], isFirst ? [0, 0] : [60, 0]);
  const scaleVal   = useTransform(enterProgress, [0, 1], isFirst ? [1, 1] : [0.97, 1]);
  const enterOpacity = useTransform(enterProgress, [0, 1], isFirst ? [1, 1] : [0.6, 1]);

  // Subtle glow at the seam between this panel and previous
  const seamOpacity = useTransform(enterProgress, [0, 1], [0.4, 0.05]);

  return (
    <section
      id={id}
      ref={rootRef}
      style={{
        height: `${sceneHeightVh}vh`,
        position: "relative",
        zIndex,
        marginTop: overlapVh > 0 ? `-${overlapVh}vh` : undefined,
        /* scroll-margin lets anchor links offset for the fixed navbar */
        scrollMarginTop: "72px",
      }}
    >
      {/* Sticky wrapper — keeps the panel pinned during its scroll runway */}
      <div className="sticky top-0 h-screen" style={{ zIndex: 1 }}>
        {/* Soft glow at bottom edge (seam blender) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 md:inset-x-16 bottom-4 md:bottom-8 h-36 blur-3xl"
          style={{ background: glowGradient, opacity: seamOpacity }}
        />

        {/* Animated panel */}
        <motion.div
          className="h-full w-full overflow-hidden"
          style={{
            y: translateY,
            scale: scaleVal,
            opacity: enterOpacity,
            background: panelBackground,
            borderRadius: 16,
            willChange: "transform, opacity",
          }}
        >
          <div className="relative h-full w-full" style={{ borderRadius: "inherit", overflow: "hidden" }}>
            {children}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
