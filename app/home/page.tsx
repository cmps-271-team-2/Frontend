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
  text: string;
  likes: number;
  dislikes: number;
  major: string;
  year: string;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
  title?: string;
  courseCode?: string;
  displayName?: string;
};

type BackendPost = {
  id: string;
  rating?: number;
  text?: string;
  targetType?: string;
  targetName?: string;
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
  const feedRef = useRef<HTMLElement>(null);
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
    if (feedRef.current) feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main
      ref={feedRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory"
      style={{ background: "var(--bg)" }}
    >
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

      {isLoading ? (
        <div className="h-screen w-full flex flex-col items-center justify-center text-center px-10">
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Loading posts...
          </p>
        </div>
      ) : null}

      {!isLoading && loadError ? (
        <div className="h-screen w-full snap-start flex flex-col items-center justify-center text-center px-10">
          <p className="text-sm font-semibold text-red-500">{loadError}</p>
        </div>
      ) : null}

      {!isLoading && !loadError && filteredReviews.length > 0 ? (
        <>
          {filteredReviews.map((review) => (
            <div key={review.id} className="h-screen w-full snap-start">
              <ReviewCard review={review} />
            </div>
          ))}

            <div className="h-screen w-full snap-start flex flex-col items-center justify-center text-center px-10">
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
      ) : !isLoading && !loadError ? (
        <div className="h-screen w-full snap-start flex flex-col items-center justify-center text-center px-10">
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
    text: post.text || "",
    likes: Number(post.likes) || 0,
    dislikes: Number(post.dislikes) || 0,
    major: post.department || "Anonymous",
    year: post.semesterTaken || "",
    noiseLevel: post.noiseLevel,
    venueCategory: post.venueCategory,
    title: post.targetName || "",
    courseCode: post.courseCode || "",
    displayName: post.displayName || post.authorName || "Anonymous",
  };
}
