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
  kind?: "study-spot" | "food-spot" | "course-professor";
  major: string;
  year: string;
  spotName?: string;
  title?: string;
  code?: string;
  courseCode?: string;
  course?: { code?: string; codeName?: string };
  professorName?: string;
  targetId?: string;
  displayName?: string;
  semester?: string;
};

type UserReaction = "liked" | "disliked" | null;

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

  const cleanCode = typeof review.code === "string" ? review.code.trim() : "";

  // Compute title based on review kind
  const displayTitle =
    review.kind === "study-spot" || review.kind === "food-spot"
      ? review.spotName || "Unknown Spot"
      : cleanCode.length > 0
        ? cleanCode
        : "Unknown Course";

  function handleLike() {
    if (onLike) {
      onLike();
      return;
    }
    setLocalReaction((prev) => (prev === "liked" ? null : "liked"));
  }

  function handleDislike() {
    if (onDislike) {
      onDislike();
      return;
    }
    setLocalReaction((prev) => (prev === "disliked" ? null : "disliked"));
  }

  return (
    <div className="snap-item bg-transparent w-full h-full flex flex-col justify-center items-center pt-20">
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
          {/* FIXED: Title color now uses var(--text) to turn black in Light Mode */}
          <h2 
            className="text-lg font-semibold text-center mb-2"
            style={{ color: "var(--text)" }}
          >
            {displayTitle}
          </h2>

          {/* Stars */}
          <div className="flex gap-2 items-center justify-center mb-5">
            {[...Array(5)].map((_, i) => {
              const isActive = i < resolvedRating;
              const color = STAR_COLORS[i];
              return (
                <Star
                  key={i}
                  size={26}
                  fill={isActive ? color : "none"}
                  stroke={isActive ? color : "var(--muted)"}
                  strokeWidth={2}
                  style={isActive ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
                />
              );
            })}
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
              style={{ color: activeReaction === "liked" ? "#69F28C" : "var(--muted)" }}
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
              style={{ color: isFavorite ? "#FFD84D" : "var(--muted)" }}
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
            className="pt-4 w-full text-center text-sm"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p style={{ color: "var(--muted)" }}>
              By: {review.displayName || "Anonymous"}
            </p>
            {review.semester && (
              <p style={{ color: "var(--muted)" }}>
                Taken in: {review.semester}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}