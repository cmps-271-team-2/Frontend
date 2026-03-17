"use client";

import { useEffect, useRef, useState } from "react";
import GlobalHeader from "../components/SearchBar";
import ReviewCard from "../components/ReviewCard";
import SortBar from "../components/sortBar";

type StudyNoiseLevel = "quiet" | "moderate" | "busy";
type FoodVenueCategory = "restaurant" | "food" | "fast-food" | "bakery";

type HomeReview = {
  id: string;
  rating: number;
  category: string;
  kind?: "study-spot" | "food-spot" | "course-professor";
  text: string;
  likes: number;
  dislikes: number;
  major: string;
  year: string;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
  spotName?: string;
  title?: string;
  courseCode?: string;
  targetId?: string;
  displayName?: string;
};

type BackendPost = {
  id: string;
  rating?: number;
  text?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  spotName?: string;
  courseCode?: string;
  department?: string;
  semesterTaken?: string;
  likes?: number;
  dislikes?: number;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
  displayName?: string;
  authorName?: string;
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

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("relevant");
  const [activeNoise, setActiveNoise] = useState<StudyNoiseLevel | "all">("all");
  const [activeFoodCategory, setActiveFoodCategory] = useState<FoodVenueCategory | "all">("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [reviews, setReviews] = useState<HomeReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        if (!apiBaseUrl) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(`${apiBaseUrl}/posts`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const posts = (await response.json()) as BackendPost[];

        if (process.env.NODE_ENV === "development") {
          console.debug("[home-feed] Loaded posts:", posts.length);
        }

        if (!mounted) {
          return;
        }

        setReviews(posts.map(mapPostToHomeReview));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[home-feed] Failed to load posts", error);
        }
        if (mounted) {
          setLoadError("Unable to load posts right now. Please try again.");
          setReviews([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadReviews();

    const handleSubmitted = () => {
      void loadReviews();
    };

    window.addEventListener("rating:submitted", handleSubmitted);

    return () => {
      mounted = false;
      window.removeEventListener("rating:submitted", handleSubmitted);
    };
  }, []);

  const categoryFilteredReviews =
    activeCategory === "All"
      ? reviews
      : reviews.filter((r) => r.category === activeCategory);

  return (
    <main className="w-full bg-black text-white min-h-screen">
      {/* Debug: always render, even if CSS not loaded */}
      {typeof window !== "undefined" && !document.documentElement.style.getPropertyValue("--bg") && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-900 text-yellow-200 p-2 text-xs z-50">
          CSS not loaded - reload page
        </div>
      )}
      <GlobalHeader
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <SortBar activeSort={activeSort} setActiveSort={setActiveSort} />

      {/* FILTERS MODAL */}
      {activeCategory === "Study Spot" || activeCategory === "Food" ? (
        <div className="fixed left-1/2 top-24 z-[110] -translate-x-1/2 px-3">
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="rounded-full border px-4 py-2 text-sm font-bold"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              background: "var(--card)",
            }}
          >
            Filters
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
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{ borderColor: "var(--border)" }}
                >
                  Clear
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

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="px-4 py-20 text-center">
          <p className="text-sm font-semibold text-gray-400">Loading posts...</p>
        </div>
      ) : null}

      {/* ERROR STATE */}
      {!isLoading && loadError ? (
        <div className="px-4 py-20 text-center">
          <p className="text-sm font-semibold text-red-500">{loadError}</p>
          <button
            onClick={() => {
              setLoadError(null);
              setIsLoading(true);
              // Reload posts
              const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
              if (apiBaseUrl) {
                fetch(`${apiBaseUrl}/posts`, { method: "GET", cache: "no-store" })
                  .then((r) => r.json())
                  .then((data) => {
                    setReviews((Array.isArray(data) ? data : []).map(mapPostToHomeReview));
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    console.error(err);
                    setLoadError("Failed to reload. Try again later.");
                    setIsLoading(false);
                  });
              }
            }}
            className="mt-4 px-4 py-2 rounded-lg border text-xs font-bold"
            style={{ borderColor: "var(--border)" }}
          >
            Try Again
          </button>
        </div>
      ) : null}

      {/* POSTS LIST */}
      {!isLoading && !loadError && reviews.length > 0 ? (
        <div className="flex flex-col items-center gap-8 py-8 px-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          <div
            className="rounded-[2rem] p-9 max-w-md text-center"
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
          </div>
        </div>
      ) : !isLoading && !loadError && reviews.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <div
            className="rounded-[2rem] p-9 max-w-md mx-auto"
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
            <p className="text-sm font-medium mb-6" style={{ color: "var(--muted)", lineHeight: 1.5 }}>
              There are currently no ratings for <strong>&quot;{activeCategory}&quot;</strong>.
            </p>
            <button
              onClick={() => setActiveCategory("All")}
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              View All Ratings
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function mapPostToHomeReview(post: BackendPost): HomeReview {
  const targetType = (post.targetType || "").toLowerCase();

  let category = "Professor";
  if (targetType === "food-spot") {
    category = "Food";
  } else if (targetType === "study-spot") {
    category = "Study Spot";
  }

  return {
    id: post.id,
    rating: Number(post.rating) || 0,
    category,
    kind: targetType === "study-spot" || targetType === "food-spot" ? targetType : "course-professor",
    text: post.text || "",
    likes: Number(post.likes) || 0,
    dislikes: Number(post.dislikes) || 0,
    major: post.department || "Anonymous",
    year: post.semesterTaken || "",
    noiseLevel: post.noiseLevel,
    venueCategory: post.venueCategory,
    spotName: post.spotName || (targetType === "study-spot" || targetType === "food-spot" ? post.targetName || "" : ""),
    title: post.targetName || "",
    courseCode: post.courseCode || "",
    targetId: post.targetId || "",
    displayName: post.displayName || post.authorName || "Anonymous",
  };
}
