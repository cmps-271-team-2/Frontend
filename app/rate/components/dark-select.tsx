"use client";

import { ChevronDown } from "lucide-react";

type DarkSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  "aria-label"?: string;
};

export default function DarkSelect({
  id,
  value,
  onChange,
  children,
  "aria-label": ariaLabel,
}: DarkSelectProps) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-sm font-medium outline-none transition-colors focus:ring-2"
        style={{
          borderColor: "var(--border)",
          background: "#0f0f0f",
          color: "var(--text)",
          colorScheme: "dark",
          // focus ring handled via focus-visible in the className but we
          // reinforce it via outline fall-through below
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {children}
      </select>
      {/* Custom chevron – non-interactive, pointer-events-none so clicks pass through */}
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--muted)" }}
        aria-hidden
      />
    </div>
  );
}
