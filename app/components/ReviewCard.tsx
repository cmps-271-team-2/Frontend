"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star, Bookmark } from "lucide-react";

const STAR_COLORS = [
  "#FFD84D", // 1 – neon yellow
  "#FF9B54", // 2 – neon orange
  "#5BC8FF", // 3 – neon blue
  "#69F28C", // 4 – neon green
  "#C56BFF", // 5 – neon purple
];

type Review = {
  id: string | number;
  rating?: number;
  stars?: number;
  text: string;
  likes: number;
  dislikes: number;
  category?: string;
  type?: string;
  major: string;
  year: string;
  spotName?: string;
  title?: string;
  courseCode?: string;
  targetId?: string;
  displayName?: string;
};

type UserReaction = "liked" | "disliked" | null;

const CATEGORY_COLORS: Record<string, string> = {
  Professor: "var(--accent-blue)",
  Food: "var(--accent-orange)",
  "Study Spot": "var(--accent-green)",
};

export default function ReviewCard({
  review,
  userReaction,
  onLike,
  onDislike,
}: {
  review: Review;
  userReaction?: UserReaction;
  onLike?: () => void;
  onDislike?: () => void;
}) {
  const [localReaction, setLocalReaction] = useState<UserReaction>(null);
  const [isFavorite, setFavorite] = useState(false);

  const activeReaction = userReaction ?? localReaction;
  const resolvedRating = review.rating ?? review.stars ?? 0;
  const resolvedCategory = review.category ?? review.type ?? "Other";
  const catColor = CATEGORY_COLORS[resolvedCategory] || "var(--accent)";

  function handleLike() {
    if (onLike) {
      onLike();
      return;
    }

    // Local-only mode: toggle like on/off and clear any existing dislike
    setLocalReaction((prev) => (prev === "liked" ? null : "liked"));
  }

  function handleDislike() {
    if (onDislike) {
      onDislike();
      return;
    }

    // Local-only mode: toggle dislike on/off and clear any existing like
    setLocalReaction((prev) => (prev === "disliked" ? null : "disliked"));
  }

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
            {resolvedCategory}
          </div>

          {/* Stars */}
          <div className="flex gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={24}
                fill={i < resolvedRating ? "var(--accent-yellow)" : "none"}
                stroke={i < resolvedRating ? "var(--accent-yellow)" : "var(--muted)"}
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
              onClick={handleLike}
              className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90"
              style={{ color: activeReaction === "liked" ? "var(--accent-green)" : "var(--muted)" }}
            >
              <ThumbsUp
                size={30}
                fill={activeReaction === "liked" ? "currentColor" : "none"}
                strokeWidth={2}
              />
              <span className="text-xs font-bold">
                {review.likes + (activeReaction === "liked" ? 1 : 0)}
              </span>
            </button>

            <button
              onClick={handleDislike}
              className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90"
              style={{ color: activeReaction === "disliked" ? "#ff6b6b" : "var(--muted)" }}
            >
              <ThumbsDown
                size={30}
                fill={activeReaction === "disliked" ? "currentColor" : "none"}
                strokeWidth={2}
              />
              <span className="text-xs font-bold">
                {review.dislikes + (activeReaction === "disliked" ? 1 : 0)}
              </span>
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
            className="pt-4 w-full flex flex-col items-center gap-1"
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
