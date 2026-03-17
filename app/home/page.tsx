"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import GlobalHeader from "../components/SearchBar";
import ReviewCard from "../components/ReviewCard";
import SortBar from "../components/sortBar";

type StudyNoiseLevel = "quiet" | "moderate" | "busy";
type FoodVenueCategory = "restaurant" | "food" | "fast-food" | "bakery";

type BackendPost = {
  id?: string | number;
  rating?: number;
  stars?: number;
  category?: string;
  type?: string;
  targetType?: string;
  code?: string;
  text?: string;
  comment?: string;
  likes?: number;
  dislikes?: number;
  major?: string;
  year?: string;
  createdAt?: string | number | Date;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
  courseCode?: string;
  professorName?: string;
  spotName?: string;
  displayName?: string;
  authorName?: string;
  semesterTaken?: string;
  title?: string;
};

type HomeReview = {
    kind?: "study-spot" | "food-spot" | "course-professor";
  id: string;
  rating?: number;
  stars?: number;
  category?: string;
  type?: string;
  code?: string;
  text: string;
  likes: number;
  dislikes: number;
  major: string;
  year: string;
  createdAt?: string | number | Date;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
  courseCode?: string;
  professorName?: string;
  spotName?: string;
  displayName?: string;
  semester?: string;
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

type UserReaction = "liked" | "disliked" | null;
type SortFilter = "relevant" | "newest" | "oldest" | "highestRating" | "lowestRating";
function getKindFromTargetType(targetType: string | undefined): "study-spot" | "food-spot" | "course-professor" | undefined {
  const normalized = (targetType || "").trim().toLowerCase();

  if (normalized === "study" || normalized === "study-spot") {
    return "study-spot";
  }

  if (normalized === "food" || normalized === "food-spot") {
    return "food-spot";
  }

  return "course-professor";
}


function mapTargetTypeToCategory(targetType: string | undefined): string | undefined {
  const normalized = (targetType || "").trim().toLowerCase();

  if (normalized === "prof" || normalized === "professor" || normalized === "course") {
    return "Professor";
  }

  if (normalized === "food" || normalized === "food-spot") {
    return "Food";
  }

  if (normalized === "study" || normalized === "study-spot") {
    return "Study Spot";
  }

  return undefined;
}

function mapPostToReview(post: BackendPost, index: number): HomeReview {
  const extractedCode =
    typeof post.title === "string"
      ? post.title.split(" - ")[0]?.trim()
      : undefined;

  const mapped: HomeReview = {
    id: String(post.id ?? `post-${index}`),
    rating: post.rating,
    stars: post.stars,
    category: mapTargetTypeToCategory(post.targetType) ?? post.category ?? post.type,
    type: post.type,
    code:
      (typeof post.code === "string" && post.code.trim().length > 0
        ? post.code.trim()
        : undefined) ||
      (typeof post.courseCode === "string" && post.courseCode.trim().length > 0
        ? post.courseCode.trim()
        : undefined) ||
      extractedCode,
    text: post.text ?? post.comment ?? "",
    likes: Number(post.likes ?? 0),
    dislikes: Number(post.dislikes ?? 0),
    major: post.major ?? "Anonymous",
    year: post.year ?? "Student",
    createdAt: post.createdAt,
    noiseLevel: post.noiseLevel,
    venueCategory: post.venueCategory,
    courseCode: post.courseCode,
    professorName: post.professorName,
    spotName: post.spotName,
    displayName: post.displayName ?? post.authorName ?? "Anonymous",
    semester: post.semesterTaken ?? post.year,
    kind: getKindFromTargetType(post.targetType),
  };
  console.log("Mapped review:", mapped);
  return mapped;
}

function normalizeCategory(value: string | undefined): "prof" | "food" | "study" | "other" {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "prof" || normalized === "professor") {
    return "prof";
  }

  if (normalized === "food") {
    return "food";
  }

  if (normalized === "study" || normalized === "study spot" || normalized === "study-spot") {
    return "study";
  }

  return "other";
}

function getRatingValue(review: HomeReview): number {
  const value = review.rating ?? review.stars ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function getCreatedAtMs(review: HomeReview): number {
  const raw = review.createdAt;

  if (typeof raw === "number") {
    return raw;
  }

  if (raw instanceof Date) {
    return raw.getTime();
  }

  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

export default function HomePage() {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedSortFilter, setSelectedSortFilter] = useState<SortFilter>("relevant");
  const [ratings, setRatings] = useState<HomeReview[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, UserReaction>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeNoise, setActiveNoise] = useState<StudyNoiseLevel | "all">("all");
  const [activeFoodCategory, setActiveFoodCategory] = useState<FoodVenueCategory | "all">("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRatings() {
      setLoading(true);
      setLoadError(null);

      try {
        const posts = await apiFetch<BackendPost[]>("/posts", { cache: "no-store" });
        if (!mounted) {
          return;
        }

        const mapped = Array.isArray(posts)
          ? posts.map((post, index) => mapPostToReview(post, index)).filter((item) => item.text.trim().length > 0)
          : [];

        setRatings(mapped);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setRatings([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load ratings.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRatings();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const next = ratings.filter((review) => {
      const mappedCategory = normalizeCategory(review.category ?? review.type);

      if (selectedCategoryFilter === "Professor" && mappedCategory !== "prof") {
        return false;
      }

      if ((selectedCategoryFilter === "Food" || selectedCategoryFilter === "Cafeteria") && mappedCategory !== "food") {
        return false;
      }

      if (selectedCategoryFilter === "Study Spot" && mappedCategory !== "study") {
        return false;
      }

      if (selectedCategoryFilter === "Study Spot" && activeNoise !== "all" && review.noiseLevel !== activeNoise) {
        return false;
      }

      if ((selectedCategoryFilter === "Food" || selectedCategoryFilter === "Cafeteria") && activeFoodCategory !== "all" && review.venueCategory !== activeFoodCategory) {
        return false;
      }

      const ratingValue = getRatingValue(review);

      return true;
    });

    const sorted = [...next];
    sorted.sort((a, b) => {
      if (selectedSortFilter === "relevant") {
        return b.likes - a.likes;
      }

      if (selectedSortFilter === "newest") {
        return getCreatedAtMs(b) - getCreatedAtMs(a);
      }

      if (selectedSortFilter === "oldest") {
        return getCreatedAtMs(a) - getCreatedAtMs(b);
      }

      if (selectedSortFilter === "highestRating") {
        const ratingDiff = getRatingValue(b) - getRatingValue(a);
        if (ratingDiff !== 0) {
          return ratingDiff;
        }
        return getCreatedAtMs(b) - getCreatedAtMs(a);
      }

      if (selectedSortFilter === "lowestRating") {
        const ratingDiff = getRatingValue(a) - getRatingValue(b);
        if (ratingDiff !== 0) {
          return ratingDiff;
        }
        return getCreatedAtMs(b) - getCreatedAtMs(a);
      }

      return 0;
    });

    return sorted;
  }, [
    activeFoodCategory,
    activeNoise,
    ratings,
    selectedCategoryFilter,
    selectedSortFilter,
  ]);

  const hasStudyFilters = activeNoise !== "all";
  const hasFoodFilters = activeFoodCategory !== "all";
  const hasActiveFilters =
    (selectedCategoryFilter === "Study Spot" && hasStudyFilters) ||
    (selectedCategoryFilter === "Food" && hasFoodFilters);

  const activeFilterCount =
    selectedCategoryFilter === "Study Spot"
      ? (activeNoise !== "all" ? 1 : 0)
      : selectedCategoryFilter === "Food"
      ? (activeFoodCategory !== "all" ? 1 : 0)
      : 0;

  function applyReaction(reviewId: string, nextReaction: Exclude<UserReaction, null>) {
    setRatings((prev) => {
      const currentReaction = userReactions[reviewId] ?? null;

      return prev.map((review) => {
        if (review.id !== reviewId) {
          return review;
        }

        let likes = review.likes;
        let dislikes = review.dislikes;

        if (currentReaction === nextReaction) {
          // Toggling off: remove existing reaction and decrement the corresponding count.
          if (nextReaction === "liked") {
            likes = Math.max(0, likes - 1);
          } else if (nextReaction === "disliked") {
            dislikes = Math.max(0, dislikes - 1);
          }

          return {
            ...review,
            likes,
            dislikes,
          };
        }

        if (currentReaction === "liked") {
          likes = Math.max(0, likes - 1);
        }

        if (currentReaction === "disliked") {
          dislikes = Math.max(0, dislikes - 1);
        }

        if (nextReaction === "liked") {
          likes += 1;
        }

        if (nextReaction === "disliked") {
          dislikes += 1;
        }

        return {
          ...review,
          likes,
          dislikes,
        };
      });
    });

    setUserReactions((prev) => {
      const currentReaction = prev[reviewId] ?? null;
      const newReaction =
        currentReaction === nextReaction ? null : nextReaction;

      return {
        ...prev,
        [reviewId]: newReaction,
      };
    });

    // TODO: replace this with a backend call when a like/dislike endpoint is available.
  }

  function scrollTop() {
    const container = document.querySelector("main") as HTMLElement | null;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth" style={{ background: "var(--bg)" }}>
      <GlobalHeader
        activeCategory={selectedCategoryFilter}
        setActiveCategory={setSelectedCategoryFilter}
      />

      <SortBar activeSort={selectedSortFilter} setActiveSort={setSelectedSortFilter} />

      {selectedCategoryFilter === "Study Spot" || selectedCategoryFilter === "Food" ? (
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

      {isFiltersOpen && (selectedCategoryFilter === "Study Spot" || selectedCategoryFilter === "Food") ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4" onClick={() => setIsFiltersOpen(false)}>
          <section
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border p-3 sm:p-4"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide">
                {selectedCategoryFilter === "Study Spot" ? "Study filters" : "Food filters"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCategoryFilter === "Study Spot") {
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

            {selectedCategoryFilter === "Study Spot" ? (
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

            {selectedCategoryFilter === "Food" ? (
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
        {loading ? (
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
                Loading ratings...
              </h2>
            </div>
          </div>
        ) : filteredReviews.length > 0 ? (
          <>
            {filteredReviews.map((review) => (
              <div key={review.id} className="h-screen w-full snap-start">
                <ReviewCard
                  review={review}
                  userReaction={userReactions[review.id] ?? null}
                  onLike={() => applyReaction(review.id, "liked")}
                  onDislike={() => applyReaction(review.id, "disliked")}
                />
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
        ) : (
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
                {loadError
                  ? `Could not load ratings (${loadError}).`
                  : "There are currently no ratings for "}
                {!loadError ? (
                <span style={{ color: "var(--accent)" }}>
                  &quot;{selectedCategoryFilter}&quot;
                </span>
                ) : null}
                {!loadError ? "." : null}
              </p>

              <button
                onClick={() => setSelectedCategoryFilter("All")}
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
