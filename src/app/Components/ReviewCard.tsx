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
        
        {/*THE BUBBLE BODY */}
        <div className="w-full bg-white border-2 border-black rounded-[4rem] p-10 shadow-2xl flex flex-col items-center">
          
          {/*CATEGORY BADGE */}
          <div className="mb-4 px-6 py-1 rounded-full border-2 border-[#1e3a8a] bg-white text-[#1e3a8a] text-[10px] font-black uppercase tracking-widest shadow-sm">
            {review.category}
          </div>

          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={28} 
                fill={i < review.rating ? "#facc15" : "none"} 
                stroke={i < review.rating ? "#facc15" : "black"} 
                strokeWidth={2}
              />
            ))}
          </div>

          {/*text area*/}
          <div className="w-full max-h-[35vh] overflow-y-auto mb-8 px-4 scrollbar-hide">
             <p className="text-black text-xl md:text-2xl font-bold text-center leading-relaxed break-words italic">
              "{review.text}"
            </p>
          </div>

          {/*INTERACTION BUTTONS*/}
          <div className="flex items-center justify-center gap-14 w-full mb-6">

            {/*the like button*/}
            <button
              onClick={() => setUserAction(userAction === "liked" ? null : "liked")}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${userAction === "liked" ? "text-green-600" : "text-black hover:text-green-500"}`}
            >
              <ThumbsUp size={36} fill={userAction === "liked" ? "currentColor" : "none"} strokeWidth={2.5} />
              <span className="text-sm font-black">{displayLikes}</span>
            </button>

            {/*the dislike button*/}
            <button
              onClick={() => setUserAction(userAction === "disliked" ? null : "disliked")}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${userAction === "disliked" ? "text-red-600" : "text-black hover:text-red-500"}`}
            >
              <ThumbsDown size={36} fill={userAction === "disliked" ? "currentColor" : "none"} strokeWidth={2.5} />
              <span className="text-sm font-black">{displayDislikes}</span>
            </button>

            {/*the favorites button*/}
            <button
              onClick={() => setFavorite(!isFavorite)}
              className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${isFavorite ? "text-yellow-500" : "text-black hover:text-yellow-500"}`}
            >
              <Bookmark size={36} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">{isFavorite ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/*STUDENT INFO (Major and Year), the rating must remain anonymous */}
          <div className="pt-4 border-t border-zinc-100 w-full flex flex-col items-center">
            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Posted by</span>
            <div className="flex gap-2 items-center text-zinc-800 font-bold text-sm">
              <span>{review.major}</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
              <span className="text-zinc-500">{review.year}</span>
            </div>
          </div>

        </div>

        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-t-[35px] border-t-black -mt-[1px] drop-shadow-xl" />
      </div>
    </div>
  );
}