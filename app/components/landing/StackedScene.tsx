import { ReactNode } from "react";

type StackedSceneProps = {
"use client";

import React from "react";

interface StackedSceneProps {
  id: string;
  zIndex: number;
  sceneHeightVh: number;
  overlapVh?: number;
  panelBackground?: string;
  isFirst?: boolean;
  children: ReactNode;
};
  isFirst?: boolean;
  panelBackground?: string;
  children: React.ReactNode;
}

export default function StackedScene({
  id,
  zIndex,
  sceneHeightVh,
  overlapVh = 0,
  panelBackground = "var(--background)",
  isFirst = false,
  children,
}: StackedSceneProps) {
  return (
    <section
      id={id}
      className="relative w-full"
      style={{
        height: `${sceneHeightVh}vh`,
        marginTop: isFirst ? 0 : `${-overlapVh}vh`,
        zIndex,
      }}
    >
      <div
        className="sticky top-0 w-full"
        style={{
          minHeight: "100vh",
          background: panelBackground,
        }}
      >
        {children}
      </div>
  isFirst = false,
  panelBackground = "var(--background)",
  children,
}: StackedSceneProps) {
  const overlapMargin = overlapVh ? `-${overlapVh}vh` : "0";

  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex,
        minHeight: `${sceneHeightVh}vh`,
        marginTop: isFirst ? 0 : overlapMargin,
        background: panelBackground,
        width: "100%",
      }}
    >
      {children}
    </section>
  );
}
