"use client";

import { useState } from "react";
import GlobalHeader from "../components/SearchBar";
import ReviewCard from "../components/ReviewCard";
import Link from "next/link";


const reviews = [
  {
    id: 1,
    rating: 5,
    category: "Professor",
    text: "Professor John makes complex algorithms feel like a breeze. Best CS teacher I've ever had! The way he explains concepts makes even the most complicated topics feel manageable. Exams are based on what was taught, no weird surprises. They focus more on understanding than memorization, which I really appreciate. Overall, this is the type of professor that actually makes you want to attend class, not just go for attendance.",
    likes: 0,
    dislikes: 0,
    major: "Computer Science",
    year: "Senior",
  },
  {
    id: 2,
    rating: 4,
    category: "Cafeteria",
    text: "The food is decent, but the lines are way too long during peak hours. If you want the pasta, get there 10 minutes early!",
    likes: 0,
    dislikes: 0,
    major: "Business",
    year: "Sophomore",
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredReviews =
    activeCategory === "All"
      ? reviews
      : reviews.filter((r) => r.category === activeCategory);

  function scrollTop() {
    const container = document.querySelector(".snap-container") as HTMLElement | null;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "2px solid var(--border)",
    color: "var(--text)",
  };

  const primaryButtonStyle: React.CSSProperties = {
    background: "var(--text)",
    color: "var(--bg)",
    border: "1px solid var(--border)",
    fontWeight: 900,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    background: "var(--tile-bg)",
    color: "var(--tile-text)",
    border: "1px solid var(--border)",
    fontWeight: 900,
  };

  return (
    <main className="snap-container" style={{ background: "var(--bg)" }}>
      <GlobalHeader
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="w-full">
        {filteredReviews.length > 0 ? (
          <>
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            <div className="snap-item flex flex-col items-center justify-center text-center px-10">
              <div className="rounded-[3rem] p-10 shadow-xl max-w-[400px]" style={cardStyle}>
                <h2 className="text-2xl font-black uppercase italic mb-2">
                  No more ratings
                </h2>
                <p style={{ color: "var(--muted)", fontWeight: 800, lineHeight: 1.2 }}>
                  You&apos;ve reached the end! <br /> Check back later for more updates.
                </p>

                <button
                  onClick={scrollTop}
                  className="mt-6 px-6 py-2 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
                  style={primaryButtonStyle}
                >
                  Back to Top
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="snap-item flex flex-col items-center justify-center text-center px-10">
            <div className="rounded-[3rem] p-10 shadow-xl max-w-[400px]" style={cardStyle}>
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-black uppercase italic mb-2">
                Empty Category
              </h2>
              <p style={{ color: "var(--muted)", fontWeight: 800, lineHeight: 1.2 }}>
                There are currently no ratings for{" "}
                <span style={{ color: "var(--text)" }}>
                  &quot;{activeCategory}&quot;
                </span>
                .
              </p>

              <button
                onClick={() => setActiveCategory("All")}
                className="mt-6 px-6 py-2 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
                style={secondaryButtonStyle}
              >
                View All Ratings
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
