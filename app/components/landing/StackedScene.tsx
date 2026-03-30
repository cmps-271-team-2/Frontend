import { type ReactNode } from "react";

type StackedSceneProps = {
  id: string;
  zIndex: number;
  sceneHeightVh: number;
  overlapVh?: number;
  panelBackground?: string;
  isFirst?: boolean;
  children: ReactNode;
};

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
        minHeight: `${sceneHeightVh}vh`,
        marginTop: isFirst ? 0 : `-${overlapVh}vh`,
        zIndex,
        background: panelBackground,
      }}
    >
      {children}
    </section>
  );
}
