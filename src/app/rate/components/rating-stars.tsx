"use client";

import { Star } from "lucide-react";

const STAR_COLORS = [
  "#FFD84D", // 1 – neon yellow
  "#FF9B54", // 2 – neon orange
  "#5BC8FF", // 3 – neon blue
  "#69F28C", // 4 – neon green
  "#C56BFF", // 5 – neon purple
];

type RatingStarsProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
};

export default function RatingStars({ value, onChange, label, error }: RatingStarsProps) {
  return (
    <div className="space-y-2">
      {label ? <label className="block text-sm font-semibold">{label}</label> : null}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= value;
          const color = STAR_COLORS[index];

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              aria-label={`Set rating to ${starValue}`}
              className="rounded-md p-1 transition hover:scale-110"
              style={isActive ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
            >
              <Star
                size={24}
                fill={isActive ? color : "none"}
                stroke={isActive ? color : "#555"}
              />
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
