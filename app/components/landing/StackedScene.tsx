"use client";

import React from "react";

interface StackedSceneProps {
  id: string;
  zIndex: number;
  sceneHeightVh: number;
  overlapVh?: number;
  isFirst?: boolean;
  panelBackground?: string;
  children: React.ReactNode;
}

export default function StackedScene({
  id,
  zIndex,
  sceneHeightVh,
  overlapVh = 0,
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
