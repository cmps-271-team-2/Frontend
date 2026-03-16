"use client";

import { useState } from "react";
import GlobalHeader from "../components/SearchBar";
import ReviewCard from "../components/ReviewCard";
import SortBar from "../components/sortBar";

type StudyNoiseLevel = "quiet" | "moderate" | "busy";
type FoodVenueCategory = "restaurant" | "food" | "fast-food" | "bakery";

type HomeReview = {
  id: number;
  rating: number;
  category: string;
  text: string;
  likes: number;
  dislikes: number;
  major: string;
  year: string;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
};

const NOISE_FILTERS: Array<{ label: string; value: StudyNoiseLevel | "all" }> = [
  { label: "All", value: "all" },
  { label: "Quiet", value: "quiet" },
  { label: "Moderate", value: "moderate" },
  { label: "Busy", value: "busy" },
];

const FOOD_FILTERS: Array<{ label: string; value: FoodVenueCategory | "all" }> = [
  { label: "All", value: "all" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Food", value: "food" },
  { label: "Fast food", value: "fast-food" },
  { label: "Bakery", value: "bakery" },
];

const reviews: HomeReview[] = [
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
    category: "Food",
    text: "The food is decent, but the lines are way too long during peak hours. If you want the pasta, get there 10 minutes early!",
    likes: 0,
    dislikes: 0,
    major: "Business",
    year: "Sophomore",
    venueCategory: "food",
  },
  {
    id: 4,
    rating: 5,
    category: "Food",
    text: "Great shawarma and quick service. Perfect when you're between lectures and need a fast meal.",
    likes: 0,
    dislikes: 0,
    major: "Architecture",
    year: "Senior",
    venueCategory: "fast-food",
  },
  {
    id: 3,
    rating: 4,
    category: "Study Spot",
    text: "The engineering library basement is super calm in the morning and perfect for focused coding sessions.",
    likes: 0,
    dislikes: 0,
    major: "Computer Engineering",
    year: "Junior",
    noiseLevel: "quiet",
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("relevant");
  const [activeNoise, setActiveNoise] = useState<StudyNoiseLevel | "all">("all");
  const [activeFoodCategory, setActiveFoodCategory] = useState<FoodVenueCategory | "all">("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const categoryFilteredReviews =
    activeCategory === "All"
      ? reviews
      : reviews.filter((r) => r.category === activeCategory);

  const filteredReviews =
    activeCategory === "Study Spot" && activeNoise !== "all"
      ? categoryFilteredReviews.filter((r) => r.noiseLevel === activeNoise)
      : activeCategory === "Food" && activeFoodCategory !== "all"
      ? categoryFilteredReviews.filter((r) => r.venueCategory === activeFoodCategory)
      : categoryFilteredReviews;

  const hasStudyFilters = activeNoise !== "all";
  const hasFoodFilters = activeFoodCategory !== "all";
  const hasActiveFilters =
    (activeCategory === "Study Spot" && hasStudyFilters) ||
    (activeCategory === "Food" && hasFoodFilters);

  const activeFilterCount =
    activeCategory === "Study Spot"
      ? (activeNoise !== "all" ? 1 : 0)
      : activeCategory === "Food"
      ? (activeFoodCategory !== "all" ? 1 : 0)
      : 0;

  function scrollTop() {
    const container = document.querySelector(".snap-container") as HTMLElement | null;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="snap-container no-snap" style={{ background: "var(--bg)" }}>
      <GlobalHeader
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <SortBar activeSort={activeSort} setActiveSort={setActiveSort} />

      {activeCategory === "Study Spot" || activeCategory === "Food" ? (
        <div className="fixed left-1/2 top-24 z-[110] -translate-x-1/2 px-3">
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="rounded-full border px-4 py-2 text-sm font-bold"
            style={{
              borderColor: hasActiveFilters ? "var(--accent)" : "var(--border)",
              color: hasActiveFilters ? "var(--accent)" : "var(--text)",
              background: hasActiveFilters ? "rgba(197,107,255,0.10)" : "var(--card)",
            }}
          >
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </button>
        </div>
      ) : null}

      {isFiltersOpen && (activeCategory === "Study Spot" || activeCategory === "Food") ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4" onClick={() => setIsFiltersOpen(false)}>
          <section
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border p-3 sm:p-4"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide">
                {activeCategory === "Study Spot" ? "Study filters" : "Food filters"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCategory === "Study Spot") {
                      setActiveNoise("all");
                    } else {
                      setActiveFoodCategory("all");
                    }
                  }}
                  disabled={!hasActiveFilters}
                  className="rounded-full border px-3 py-1 text-xs font-bold disabled:opacity-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(false)}
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{ borderColor: "var(--border)" }}
                >
                  Done
                </button>
              </div>
            </div>

            {activeCategory === "Study Spot" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {NOISE_FILTERS.map((option) => {
                  const isActive = activeNoise === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveNoise(option.value)}
                      className="rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                      style={{
                        borderColor: isActive ? "var(--accent-green)" : "var(--border)",
                        color: isActive ? "var(--accent-green)" : "var(--text)",
                        background: isActive ? "rgba(105,242,140,0.08)" : "transparent",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {activeCategory === "Food" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {FOOD_FILTERS.map((option) => {
                  const isActive = activeFoodCategory === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveFoodCategory(option.value)}
                      className="rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                      style={{
                        borderColor: isActive ? "var(--accent-orange)" : "var(--border)",
                        color: isActive ? "var(--accent-orange)" : "var(--text)",
                        background: isActive ? "rgba(255,176,32,0.08)" : "transparent",
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

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
