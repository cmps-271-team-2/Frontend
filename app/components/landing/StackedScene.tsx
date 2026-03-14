"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface StackedSceneProps {
  id?: string;
  zIndex: number;
  /** Total outer height — the "scroll runway" for the sticky phase. */
  sceneHeightVh?: number;
  /** Negative top-margin overlap with the previous section (creates layering). */
  overlapVh?: number;
  panelBackground?: string;
  /** If true, skip the entrance fade (used for the very first panel). */
  isFirst?: boolean;
  children: React.ReactNode;
}

/**
 * Stacked-sticky scene wrapper.
 *
 * Architecture:
 *   • Each scene is a tall <section> (the "scroll runway") with a sticky
 *     viewport-height child that pins the content.
 *   • Scenes stack via ascending z-index — each new scene naturally covers
 *     the previous one as the user scrolls.
 *   • The only scroll-linked effect is a gentle opacity cross-fade (0 → 1).
 *     No scale, no translateY, no borderRadius — the natural scroll physics
 *     and sticky stacking provide all the "motion" needed.
 *   • This keeps the GPU workload minimal and avoids the sub-pixel jitter
 *     that scale transforms cause on viewport-sized elements.
 */
export default function StackedScene({
  id,
  zIndex,
  sceneHeightVh = 180,
  overlapVh = 0,
  panelBackground = "var(--background)",
  isFirst = false,
  children,
}: StackedSceneProps) {
  const ref = useRef<HTMLElement>(null);

  /* scrollYProgress: 0 = section top at viewport bottom
   *                  1 = section bottom at viewport top           */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /*
   * Soft cross-fade.
   * – Starts at progress 0.02 (section top is just above the very bottom
   *   edge of the viewport) so there's no flash at the exact pixel.
   * – Completes at progress 0.22 (~55 vh of scroll for a 180 vh section),
   *   giving a long, gentle ramp that feels cinematic rather than abrupt.
   * – Hero panel is always fully opaque (no entrance needed).
   */
  const opacity = useTransform(
    scrollYProgress,
    [0.02, 0.22],
    isFirst ? [1, 1] : [0, 1],
  );

  return (
    <section
      id={id}
      ref={ref}
      style={{
        height: `${sceneHeightVh}vh`,
        position: "relative",
        zIndex,
        marginTop: overlapVh > 0 ? `-${overlapVh}vh` : undefined,
        /* scroll-margin lets anchor links offset for the fixed navbar */
        scrollMarginTop: "72px",
      }}
    >
      {/* Sticky wrapper — pins panel at the top during its scroll runway */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="h-full w-full"
          style={{ opacity, background: panelBackground }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
