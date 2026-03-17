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
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
  category: string;
  kind?: "study-spot" | "food-spot" | "course-professor";
  major: string;
  year: string;
  spotName?: string;
  title?: string;
  courseCode?: string;
  targetId?: string;
  displayName?: string;
};

export default function ReviewCard({ review }: { review: Review }) {
  const [userAction, setUserAction] = useState<"liked" | "disliked" | null>(null);
  const [isFavorite, setFavorite] = useState(false);

  const displayLikes = review.likes + (userAction === "liked" ? 1 : 0);
  const displayDislikes = review.dislikes + (userAction === "disliked" ? 1 : 0);
  const authorName = review.displayName || "Anonymous";
  const semesterLabel = review.year || "";
  const displayTitle =
    review.kind === "study-spot" || review.kind === "food-spot"
      ? review.spotName || review.title || "Unknown Spot"
      : review.courseCode || review.title || review.targetId || "Unknown";

  return (
    <div className="bg-transparent w-[480px] max-w-[90vw]">
      <div className="relative z-20 flex flex-col items-center w-full">
        <div
          className="w-full rounded-[2.5rem] p-9 flex flex-col items-center transition-shadow duration-300"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Course / venue title */}
          <h2
            className="mb-4 text-lg font-semibold text-center"
            style={{ color: "var(--text)" }}
          >
            {displayTitle}
          </h2>

          {/* Stars – neon per-star colors matching the rating form */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {Array.from({ length: 5 }, (_, i) => {
              const isActive = i < review.rating;
              const color = STAR_COLORS[i];
              return (
                <span
                  key={i}
                  style={isActive ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
                >
                  <Star
                    size={26}
                    fill={isActive ? color : "none"}
                    stroke={isActive ? color : "#555"}
                    strokeWidth={2}
                  />
                </span>
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
            className="pt-4 w-full flex flex-col items-center gap-1"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              By:{" "}
              <span style={{ color: "var(--text)" }}>{authorName}</span>
            </span>
            {semesterLabel ? (
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Taken in:{" "}
                <span style={{ color: "var(--text)" }}>{semesterLabel}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
