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

export default function ReviewCard({ review }: { review: Review }) {
  const [userAction, setUserAction] = useState<"liked" | "disliked" | null>(null);
  const [isFavorite, setFavorite] = useState(false);

  const displayLikes = review.likes + (userAction === "liked" ? 1 : 0);
  const displayDislikes = review.dislikes + (userAction === "disliked" ? 1 : 0);

  return (
    <div className="snap-item bg-transparent">
      <div className="relative z-20 flex flex-col items-center w-[500px] max-w-[90vw]">
        <div
          className="w-full rounded-[4rem] p-10 shadow-2xl flex flex-col items-center"
          style={{
            background: "var(--card)",
            border: "2px solid var(--border)",
            color: "var(--text)",
          }}
        >
          <div
            className="mb-4 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
            style={{
              border: "2px solid var(--border)",
              background: "var(--tile-bg)",
              color: "var(--tile-text)",
            }}
          >
            {review.category}
          </div>

          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={28}
                fill={i < review.rating ? "#facc15" : "none"}
                stroke={i < review.rating ? "#facc15" : "currentColor"}
                strokeWidth={2}
              />
            ))}
          </div>

          <div className="w-full max-h-[35vh] overflow-y-auto mb-8 px-4 scrollbar-hide">
            <p
              className="text-xl md:text-2xl font-bold text-center leading-relaxed break-words italic"
              style={{ color: "var(--text)" }}
            >
              &quot;{review.text}&quot;
            </p>
          </div>

          <div className="flex items-center justify-center gap-14 w-full mb-6">
            <button
              onClick={() => setUserAction(userAction === "liked" ? null : "liked")}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${
                userAction === "liked"
                  ? "text-green-600"
                  : "hover:text-green-500"
              }`}
              style={{ color: userAction === "liked" ? undefined : "var(--text)" }}
            >
              <ThumbsUp
                size={36}
                fill={userAction === "liked" ? "currentColor" : "none"}
                strokeWidth={2.5}
              />
              <span className="text-sm font-black">{displayLikes}</span>
            </button>

            <button
              onClick={() =>
                setUserAction(userAction === "disliked" ? null : "disliked")
              }
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${
                userAction === "disliked"
                  ? "text-red-600"
                  : "hover:text-red-500"
              }`}
              style={{ color: userAction === "disliked" ? undefined : "var(--text)" }}
            >
              <ThumbsDown
                size={36}
                fill={userAction === "disliked" ? "currentColor" : "none"}
                strokeWidth={2.5}
              />
              <span className="text-sm font-black">{displayDislikes}</span>
            </button>

            <button
              onClick={() => setFavorite(!isFavorite)}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${
                isFavorite ? "text-yellow-500" : "hover:text-yellow-500"
              }`}
              style={{ color: isFavorite ? undefined : "var(--text)" }}
            >
              <Bookmark
                size={36}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={2.5}
              />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isFavorite ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          <div
            className="pt-4 w-full flex flex-col items-center"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "var(--muted)" }}>
              Posted by
            </span>
            <div className="flex gap-2 items-center font-bold text-sm" style={{ color: "var(--text)" }}>
              <span>{review.major}</span>
              <span className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
              <span style={{ color: "var(--muted)" }}>{review.year}</span>
            </div>
          </div>
        </div>

        <div
          className="w-0 h-0 -mt-[1px] drop-shadow-xl"
          style={{
            borderLeft: "35px solid transparent",
            borderRight: "35px solid transparent",
            borderTop: "35px solid var(--border)",
          }}
        />
      </div>
    </div>
  );
}
