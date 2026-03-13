"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star, Bookmark } from "lucide-react";
import toast from "react-hot-toast";

type Review = {
  id: number;
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
  category: string;
  major: string;
  year: string;
  has_liked?: boolean;
  has_disliked?: boolean;
  has_saved?: boolean; // NEW
};

export default function ReviewCard({
  review,
  setReviews,
}: {
  review: Review;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}) {
  const [userAction, setUserAction] = useState<"liked" | "disliked" | null>(
    review.has_liked ? "liked" : review.has_disliked ? "disliked" : null
  );
  
  // Initialize from backend data
  const [isFavorite, setFavorite] = useState(review.has_saved || false);

  // Keep state in sync when reviews are re-fetched or sorted
  useEffect(() => {
    setUserAction(review.has_liked ? "liked" : review.has_disliked ? "disliked" : null);
    setFavorite(review.has_saved || false);
  }, [review.has_liked, review.has_disliked, review.has_saved]);

  const handleAction = async (action: "like" | "dislike" | "save") => {
    try {
      const res = await fetch("http://localhost:8000/reviews/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: review.id,
          user_id: "myUser123", 
          action,
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();

      // Update global state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { 
                ...r, 
                likes: data.likes, 
                dislikes: data.dislikes,
                has_liked: action === "like" ? !r.has_liked : (action === "dislike" ? false : r.has_liked),
                has_disliked: action === "dislike" ? !r.has_disliked : (action === "like" ? false : r.has_disliked),
                has_saved: action === "save" ? !r.has_saved : r.has_saved
              }
            : r
        )
      );

      if (action === "save") {
        toast.success(!isFavorite ? "Review Bookmarked" : "Removed Bookmark");
      }
    } catch (err) {
      toast.error("Could not reach server");
    }
  };

  return (
    <div className="snap-item bg-transparent py-10 flex justify-center">
      <div className="relative z-20 flex flex-col items-center w-[500px] max-w-[90vw]">
        <div className="w-full bg-white border-[3px] border-black rounded-[4rem] p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col items-center">
          
          <div className="mb-4 px-6 py-1 rounded-full border-2 border-black bg-blue-50 text-blue-900 text-[10px] font-black uppercase tracking-widest">
            {review.category}
          </div>

          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} size={28} 
                fill={i < review.rating ? "#facc15" : "none"} 
                stroke="black" strokeWidth={2} 
              />
            ))}
          </div>

          <div className="w-full max-h-[35vh] overflow-y-auto mb-8 px-4 scrollbar-hide">
             <p className="text-black text-xl md:text-2xl font-bold text-center leading-tight italic">
              "{review.text}"
            </p>
          </div>

          <div className="flex items-center justify-center gap-14 w-full mb-6">
            <button
              onClick={() => handleAction("like")}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${userAction === "liked" ? "text-green-600" : "text-black"}`}
            >
              <ThumbsUp size={36} fill={userAction === "liked" ? "currentColor" : "none"} strokeWidth={3} />
              <span className="text-sm font-black">{review.likes}</span>
            </button>

            <button
              onClick={() => handleAction("dislike")}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${userAction === "disliked" ? "text-red-600" : "text-black"}`}
            >
              <ThumbsDown size={36} fill={userAction === "disliked" ? "currentColor" : "none"} strokeWidth={3} />
              <span className="text-sm font-black">{review.dislikes}</span>
            </button>

            <button
              onClick={() => handleAction("save")}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${isFavorite ? "text-yellow-500" : "text-black"}`}
            >
              <Bookmark size={36} fill={isFavorite ? "currentColor" : "none"} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{isFavorite ? "Saved" : "Save"}</span>
            </button>
          </div>

          <div className="pt-4 border-t-2 border-black w-full flex flex-col items-center">
            <span className="text-zinc-400 text-[10px] font-black uppercase mb-1">Posted by</span>
            <div className="text-black font-black text-sm uppercase italic">
              {review.major} • {review.year}
            </div>
          </div>
        </div>
        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-t-[35px] border-t-black -mt-[1px]" />
      </div>
    </div>
  );
}