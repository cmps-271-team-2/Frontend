"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star, Bookmark } from "lucide-react";

type Review = {
  id: number;
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
  category: string;
  major: string;
  year: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Professor: "var(--accent-blue)",
  Cafeteria: "var(--accent-orange)",
  "Study Spot": "var(--accent-green)",
};

export default function ReviewCard({ review }: { review: Review }) {
  const [userAction, setUserAction] = useState<"liked" | "disliked" | null>(null);
  const [isFavorite, setFavorite] = useState(false);

  const displayLikes = review.likes + (userAction === "liked" ? 1 : 0);
  const displayDislikes = review.dislikes + (userAction === "disliked" ? 1 : 0);
  const catColor = CATEGORY_COLORS[review.category] || "var(--accent)";

  return (
    <div className="snap-item bg-transparent">
      <div className="relative z-20 flex flex-col items-center w-[480px] max-w-[90vw]">
        <div
          className="w-full rounded-[2.5rem] p-9 flex flex-col items-center transition-shadow duration-300"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Category chip */}
          <div
            className="mb-4 px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{
              border: `1px solid ${catColor}30`,
              background: `${catColor}10`,
              color: catColor,
            }}
          >
            {review.category}
          </div>

          {/* Stars */}
          <div className="flex gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={24}
                fill={i < review.rating ? "var(--accent-yellow)" : "none"}
                stroke={i < review.rating ? "var(--accent-yellow)" : "var(--muted)"}
                strokeWidth={2}
              />
            ))}
          </div>

          {/* Review text */}
          <div className="w-full max-h-[35vh] overflow-y-auto mb-7 px-2 scrollbar-hide">
            <p
              className="text-lg md:text-xl font-semibold text-center leading-relaxed break-words"
              style={{ color: "var(--text)", opacity: 0.92 }}
            >
              &ldquo;{review.text}&rdquo;
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-12 w-full mb-5">
            <button
              onClick={() => setUserAction(userAction === "liked" ? null : "liked")}
              className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90"
              style={{ color: userAction === "liked" ? "var(--accent-green)" : "var(--muted)" }}
            >
              <ThumbsUp
                size={30}
                fill={userAction === "liked" ? "currentColor" : "none"}
                strokeWidth={2}
              />
              <span className="text-xs font-bold">{displayLikes}</span>
            </button>

            <button
              onClick={() => setUserAction(userAction === "disliked" ? null : "disliked")}
              className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90"
              style={{ color: userAction === "disliked" ? "#ff6b6b" : "var(--muted)" }}
            >
              <ThumbsDown
                size={30}
                fill={userAction === "disliked" ? "currentColor" : "none"}
                strokeWidth={2}
              />
              <span className="text-xs font-bold">{displayDislikes}</span>
            </button>

            <button
              onClick={() => setFavorite(!isFavorite)}
              className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90"
              style={{ color: isFavorite ? "var(--accent-yellow)" : "var(--muted)" }}
            >
              <Bookmark
                size={30}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={2}
              />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {isFavorite ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div
            className="pt-4 w-full flex flex-col items-center"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "var(--muted)" }}>
              Posted by
            </span>
            <div className="flex gap-2 items-center font-semibold text-sm">
              <span style={{ color: "var(--text)" }}>{review.major}</span>
              <span className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
              <span style={{ color: "var(--muted)" }}>{review.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
