"use client";

import { useState } from "react";
import GlobalHeader from "../components/SearchBar";
import ReviewCard from "../components/ReviewCard";
import sortBar from "../components/sortBar";



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
              <div
                className="rounded-[2rem] p-10 max-w-[400px]"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
                  No more ratings
                </h2>
                <p className="text-sm font-medium" style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                  You&apos;ve reached the end! <br /> Check back later for more updates.
                </p>

                <button
                  onClick={scrollTop}
                  className="mt-6 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95"
                  style={{
                    background: "var(--text)",
                    color: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 16px rgba(197,107,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Back to Top
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="snap-item flex flex-col items-center justify-center text-center px-10">
            <div
              className="rounded-[2rem] p-10 max-w-[400px]"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
                Empty Category
              </h2>
              <p className="text-sm font-medium" style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                There are currently no ratings for{" "}
                <span style={{ color: "var(--accent)" }}>
                  &quot;{activeCategory}&quot;
                </span>
                .
              </p>

              <button
                onClick={() => setActiveCategory("All")}
                className="mt-6 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95"
                style={{
                  background: "transparent",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(197,107,255,0.3)";
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(197,107,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
