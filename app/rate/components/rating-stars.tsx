"use client";

import { Star } from "lucide-react";

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

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              aria-label={`Set rating to ${starValue}`}
              className="rounded-md p-1 transition hover:scale-105"
            >
              <Star
                size={24}
                className={isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
              />
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
