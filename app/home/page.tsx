"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  addFavorite,
  clearPostReaction,
  deletePost,
  removeFavorite,
  reportPost,
  setPostReaction,
  updatePost,
} from "@/lib/posts";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import GlobalHeader from "../components/SearchBar";
import ReviewCard from "../components/ReviewCard";
import SortBar from "../components/sortBar";
import ThemeToggle from "../components/theme-toggle";

type StudyNoiseLevel = "quiet" | "moderate" | "busy";
type FoodVenueCategory = "restaurant" | "food" | "fast-food" | "bakery";

type BackendPost = {
  id?: string | number;
  targetId?: string;
  targetid?: string;
  TargetId?: string;
  rating?: number;
  stars?: number;
  category?: string;
  type?: string;
  targetType?: string;
  targettype?: string;
  TargetType?: string;
  code?: string;
  Code?: string;
  text?: string;
  comment?: string;
  likes?: number;
  dislikes?: number;
  currentUserReaction?: "liked" | "disliked" | null;
  isOwner?: boolean;
  isFavorited?: boolean;
  userId?: string;
  major?: string;
  year?: string;
  showDisplayName?: boolean;
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
  Title?: string;
};

type LookupEntity = {
  id?: string;
  name?: string;
  code?: string;
  title?: string;
};

type PostTargetLookup = {
  profilesByIdOrName: Record<string, string>;
  cafeteriasByIdOrName: Record<string, string>;
  spotsByIdOrName: Record<string, string>;
  coursesByIdCodeOrTitle: Record<string, string>;
};

type HomeReview = {
    kind?: "study-spot" | "food-spot" | "course-professor";
  id: string;
  targetId?: string;
  rating?: number;
  stars?: number;
  category?: string;
  type?: string;
  targetType?: string;
  code?: string;
  text: string;
  likes: number;
  dislikes: number;
  currentUserReaction?: UserReaction;
  isOwner?: boolean;
  isFavorited?: boolean;
  major: string;
  year: string;
  showDisplayName: boolean;
  createdAt?: string | number | Date;
  noiseLevel?: StudyNoiseLevel;
  venueCategory?: FoodVenueCategory;
  courseCode?: string;
  professorName?: string;
  spotName?: string;
  displayName?: string;
  semester?: string;
  title?: string;
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

  if (normalized === "spot" || normalized === "study-food") {
    return "study-spot";
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

function toLookupKey(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

function createLookupMap(items: LookupEntity[], labelSelector: (item: LookupEntity) => string | undefined, aliases: Array<(item: LookupEntity) => string | undefined>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) {
    const label = (labelSelector(item) || "").trim();
    if (!label) {
      continue;
    }
    for (const alias of aliases) {
      const key = toLookupKey(alias(item));
      if (key) {
        map[key] = label;
      }
    }
  }
  return map;
}

function resolveTargetLabel(post: BackendPost, lookup: PostTargetLookup): string | undefined {
  const targetType = toLookupKey(
    post.targetType || post.targettype || post.TargetType
  );
  const targetId = toLookupKey(
    post.targetId || post.targetid || post.TargetId
  );
  if (!targetId) {
    return undefined;
  }

  if (targetType === "study" || targetType === "study-spot" || targetType === "food" || targetType === "food-spot" || targetType === "spot") {
    return lookup.spotsByIdOrName[targetId] || lookup.cafeteriasByIdOrName[targetId];
  }

  if (targetType === "course") {
    return lookup.coursesByIdCodeOrTitle[targetId];
  }

  if (targetType === "prof" || targetType === "professor" || targetType === "profile") {
    return lookup.profilesByIdOrName[targetId];
  }

  return (
    lookup.profilesByIdOrName[targetId] ||
    lookup.cafeteriasByIdOrName[targetId] ||
    lookup.spotsByIdOrName[targetId] ||
    lookup.coursesByIdCodeOrTitle[targetId]
  );
}

function mapPostToReview(post: BackendPost, index: number, lookup: PostTargetLookup): HomeReview {
  const rawTargetId =
    (post.targetId || post.targetid || post.TargetId || "").toString().trim();
  const rawTargetType =
    (post.targetType || post.targettype || post.TargetType || "").toString().trim();
  const rawTitle =
    (post.title || post.Title || "").toString().trim();
  const rawCode =
    (post.code || post.Code || "").toString().trim();

  const extractedCode =
    rawTitle.length > 0
      ? rawTitle.split(" - ")[0]?.trim()
      : undefined;

  const normalizedTargetType = rawTargetType.toLowerCase();
  const resolvedTargetLabel = resolveTargetLabel(post, lookup);
  const normalizedTitle = rawTitle;
  const authorDisplayName =
    (typeof post.displayName === "string" && post.displayName.trim().length > 0
      ? post.displayName.trim()
      : "") ||
    (typeof post.authorName === "string" && post.authorName.trim().length > 0
      ? post.authorName.trim()
      : "") ||
    "Student";
  const authorMajor =
    (typeof post.major === "string" && post.major.trim().length > 0
      ? post.major.trim()
      : "") ||
    "Unknown Major";
  const derivedSpotName =
    (typeof post.spotName === "string" && post.spotName.trim().length > 0
      ? post.spotName.trim()
      : "") ||
    ((normalizedTargetType === "study" ||
      normalizedTargetType === "study-spot" ||
      normalizedTargetType === "food" ||
      normalizedTargetType === "food-spot") && normalizedTitle.length > 0
      ? normalizedTitle
      : "") ||
    ((normalizedTargetType === "study" ||
      normalizedTargetType === "study-spot" ||
      normalizedTargetType === "food" ||
      normalizedTargetType === "food-spot") && (resolvedTargetLabel || "").trim().length > 0
      ? (resolvedTargetLabel || "").trim()
      : "") ||
    undefined;

  const mapped: HomeReview = {
    id: String(post.id ?? `post-${index}`),
    targetId: rawTargetId || undefined,
    rating: post.rating,
    stars: post.stars,
    category: mapTargetTypeToCategory(rawTargetType) ?? post.category ?? post.type,
    type: post.type,
    targetType: rawTargetType || undefined,
    code:
      (rawCode.length > 0
        ? rawCode
        : undefined) ||
      (typeof post.courseCode === "string" && post.courseCode.trim().length > 0
        ? post.courseCode.trim()
        : undefined) ||
      (rawTargetId.length > 0 && normalizedTargetType === "course"
        ? rawTargetId.replace(/_/g, " ")
        : undefined) ||
      extractedCode,
    text: post.text ?? post.comment ?? "",
    likes: Number(post.likes ?? 0),
    dislikes: Number(post.dislikes ?? 0),
    currentUserReaction: (post.currentUserReaction as UserReaction | undefined) ?? null,
    isOwner: Boolean(post.isOwner),
    isFavorited: Boolean(post.isFavorited),
    major: authorMajor,
    year: post.year ?? "Student",
    showDisplayName: Boolean(post.showDisplayName),
    createdAt: post.createdAt,
    noiseLevel: post.noiseLevel,
    venueCategory: post.venueCategory,
    courseCode: post.courseCode,
    professorName: post.professorName,
    spotName: derivedSpotName,
    displayName: authorDisplayName,
    semester: post.semesterTaken ?? post.year,
    kind: getKindFromTargetType(rawTargetType),
    title: normalizedTitle || resolvedTargetLabel || undefined,
  };
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
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedSortFilter, setSelectedSortFilter] = useState<SortFilter>("relevant");
  const [ratings, setRatings] = useState<HomeReview[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, UserReaction>>({});
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editDialog, setEditDialog] = useState<{ review: HomeReview; text: string; rating: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<HomeReview | null>(null);
  const [reportDialog, setReportDialog] = useState<{ review: HomeReview; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeNoise, setActiveNoise] = useState<StudyNoiseLevel | "all">("all");
  const [activeFoodCategory, setActiveFoodCategory] = useState<FoodVenueCategory | "all">("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const reviewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const anchorReviewIdRef = useRef<string | null>(null);
  const jumpToTopOnSortRef = useRef(false);
  const deepLinkHandledRef = useRef(false);
  const deepLinkTargetRef = useRef<{ targetId: string; targetType: string; postId: string }>({ targetId: "", targetType: "", postId: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    deepLinkTargetRef.current = {
      targetId: (params.get("targetId") || "").trim(),
      targetType: (params.get("targetType") || "").trim().toLowerCase(),
      postId: (params.get("postId") || "").trim(),
    };
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  }

  async function requireAuthToken(): Promise<string | null> {
    if (!authUser) {
      showToast("error", "Please sign in first.");
      return null;
    }
    try {
      return await authUser.getIdToken();
    } catch {
      showToast("error", "Could not validate your session. Please sign in again.");
      return null;
    }
  }

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let mounted = true;

    async function loadRatings() {
      setLoading(true);
      setLoadError(null);

      try {
        const authToken = authUser ? await authUser.getIdToken() : undefined;
        const [posts, profiles, cafeterias, spots, courses] = await Promise.all([
          apiFetch<BackendPost[]>("/posts", { cache: "no-store", authToken }),
          apiFetch<LookupEntity[]>("/profiles", { cache: "no-store" }).catch(() => []),
          apiFetch<LookupEntity[]>("/cafeterias", { cache: "no-store" }).catch(() => []),
          apiFetch<LookupEntity[]>("/spots", { cache: "no-store" }).catch(() => []),
          apiFetch<LookupEntity[]>("/courses", { cache: "no-store" }).catch(() => []),
        ]);
        if (!mounted) {
          return;
        }

        const lookup: PostTargetLookup = {
          profilesByIdOrName: createLookupMap(profiles, (item) => item.name, [
            (item) => item.id,
            (item) => item.name,
          ]),
          cafeteriasByIdOrName: createLookupMap(cafeterias, (item) => item.name, [
            (item) => item.id,
            (item) => item.name,
          ]),
          spotsByIdOrName: createLookupMap(spots, (item) => item.name, [
            (item) => item.id,
            (item) => item.name,
          ]),
          coursesByIdCodeOrTitle: createLookupMap(courses, (item) => item.code || item.title, [
            (item) => item.id,
            (item) => item.code,
            (item) => item.title,
          ]),
        };

        const mapped = Array.isArray(posts)
          ? posts.map((post, index) => mapPostToReview(post, index, lookup)).filter((item) => item.text.trim().length > 0)
          : [];

        setRatings(mapped);
        const reactions: Record<string, UserReaction> = {};
        for (const item of mapped) {
          reactions[item.id] = item.currentUserReaction ?? null;
        }
        setUserReactions(reactions);
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
  }, [authReady, authUser]);

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

  useEffect(() => {
    if (deepLinkHandledRef.current) {
      return;
    }

    const targetIdParam = deepLinkTargetRef.current.targetId;
    const targetTypeParam = deepLinkTargetRef.current.targetType;
    const postIdParam = deepLinkTargetRef.current.postId;
    if (!targetIdParam && !postIdParam) {
      return;
    }

    const match = filteredReviews.find((item) => {
      if (postIdParam) {
        return String(item.id || "").trim() === postIdParam;
      }
      const itemTargetId = (item.targetId || "").trim();
      if (!itemTargetId || itemTargetId !== targetIdParam) {
        return false;
      }
      if (!targetTypeParam) {
        return true;
      }
      const itemTargetType = (item.targetType || "").trim().toLowerCase();
      return itemTargetType === targetTypeParam;
    });

    if (!match) {
      return;
    }

    const container = mainRef.current;
    const targetEl = reviewRefs.current[match.id];
    if (container && targetEl) {
      container.scrollTo({ top: targetEl.offsetTop, behavior: "auto" });
      deepLinkHandledRef.current = true;
    }
  }, [filteredReviews]);

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

  function handleSortChange(nextSort: SortFilter) {
    if (nextSort === selectedSortFilter) {
      return;
    }

    if (
      nextSort === "newest" ||
      nextSort === "oldest" ||
      nextSort === "highestRating" ||
      nextSort === "lowestRating"
    ) {
      anchorReviewIdRef.current = null;
      jumpToTopOnSortRef.current = true;
      setSelectedSortFilter(nextSort);
      return;
    }

    const container = mainRef.current;
    if (container && filteredReviews.length > 0) {
      const pageIndex = Math.round(container.scrollTop / Math.max(1, container.clientHeight));
      const safeIndex = Math.min(Math.max(pageIndex, 0), filteredReviews.length - 1);
      anchorReviewIdRef.current = filteredReviews[safeIndex]?.id ?? null;
    } else {
      anchorReviewIdRef.current = null;
    }

    jumpToTopOnSortRef.current = false;

    setSelectedSortFilter(nextSort);
  }

  useLayoutEffect(() => {
    if (jumpToTopOnSortRef.current) {
      const container = mainRef.current;
      if (container) {
        container.scrollTo({ top: 0, behavior: "auto" });
      }
      jumpToTopOnSortRef.current = false;
      anchorReviewIdRef.current = null;
      return;
    }

    const anchorId = anchorReviewIdRef.current;
    if (!anchorId) {
      return;
    }

    const container = mainRef.current;
    const target = reviewRefs.current[anchorId];
    if (container && target) {
      container.scrollTo({ top: target.offsetTop, behavior: "auto" });
    }

    anchorReviewIdRef.current = null;
  }, [selectedSortFilter, filteredReviews]);

  async function applyReaction(reviewId: string, nextReaction: Exclude<UserReaction, null>) {
    const token = await requireAuthToken();
    if (!token) {
      return;
    }

    const review = ratings.find((r) => r.id === reviewId);
    if (!review) {
      return;
    }

    setBusyPostId(reviewId);
    const currentReaction = userReactions[reviewId] ?? null;

    try {
      const result =
        currentReaction === nextReaction
          ? await clearPostReaction(reviewId, token)
          : await setPostReaction(reviewId, nextReaction === "liked" ? "like" : "dislike", token);

      setUserReactions((prev) => ({
        ...prev,
        [reviewId]: result.currentUserReaction,
      }));

      setRatings((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                likes: result.likes,
                dislikes: result.dislikes,
                currentUserReaction: result.currentUserReaction,
              }
            : item
        )
      );
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to update reaction.");
    } finally {
      setBusyPostId(null);
    }
  }

  async function handleToggleFavorite(review: HomeReview) {
    const token = await requireAuthToken();
    if (!token) {
      return;
    }

    if (!review.id) {
      showToast("error", "Cannot favorite this post.");
      return;
    }

    setBusyPostId(review.id);
    const prevFavorite = Boolean(review.isFavorited);
    try {
      if (prevFavorite) {
        await removeFavorite("post", String(review.id), token);
      } else {
        await addFavorite("post", String(review.id), String(review.id), token);
      }

      setRatings((prev) =>
        prev.map((item) =>
          item.id === review.id
            ? { ...item, isFavorited: !prevFavorite }
            : item
        )
      );
      showToast("success", prevFavorite ? "Removed from favorites." : "Added to favorites.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to update favorite.");
    } finally {
      setBusyPostId(null);
    }
  }

  async function handleEditPost(review: HomeReview) {
    setEditDialog({
      review,
      text: review.text,
      rating: String(review.rating ?? review.stars ?? 0),
    });
  }

  async function submitEditDialog() {
    if (!editDialog) {
      return;
    }

    const token = await requireAuthToken();
    if (!token) {
      return;
    }

    const trimmedText = editDialog.text.trim();
    if (!trimmedText) {
      showToast("error", "Review text cannot be empty.");
      return;
    }

    const nextRating = Number(editDialog.rating);
    if (!Number.isFinite(nextRating) || nextRating < 1 || nextRating > 5) {
      showToast("error", "Rating must be between 1 and 5.");
      return;
    }

    const review = editDialog.review;
    setBusyPostId(review.id);
    try {
      const result = await updatePost(review.id, { text: trimmedText, rating: nextRating }, token);
      const updated = result.post;
      setRatings((prev) =>
        prev.map((item) =>
          item.id === review.id
            ? {
                ...item,
                text: String(updated.text ?? trimmedText),
                rating: Number(updated.rating ?? nextRating),
                stars: Number(updated.rating ?? nextRating),
                title: String(updated.title ?? item.title ?? "") || item.title,
              }
            : item
        )
      );
      setEditDialog(null);
      showToast("success", "Rating updated.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to update rating.");
    } finally {
      setBusyPostId(null);
    }
  }

  async function handleDeletePost(review: HomeReview) {
    setDeleteDialog(review);
  }

  async function submitDeleteDialog() {
    if (!deleteDialog) {
      return;
    }

    const token = await requireAuthToken();
    if (!token) {
      return;
    }

    const review = deleteDialog;
    setBusyPostId(review.id);
    try {
      await deletePost(review.id, token);
      setRatings((prev) => prev.filter((item) => item.id !== review.id));
      setUserReactions((prev) => {
        const next = { ...prev };
        delete next[review.id];
        return next;
      });
      setDeleteDialog(null);
      showToast("success", "Rating deleted.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to delete rating.");
    } finally {
      setBusyPostId(null);
    }
  }

  async function handleReportSpot(review: HomeReview) {
    setReportDialog({ review, text: "" });
  }

  async function submitReportDialog() {
    if (!reportDialog) {
      return;
    }

    const token = await requireAuthToken();
    if (!token) {
      return;
    }

    const trimmed = reportDialog.text.trim();
    if (!trimmed) {
      showToast("error", "Report text cannot be empty.");
      return;
    }

    const review = reportDialog.review;
    setBusyPostId(review.id);
    try {
      await reportPost(review.id, trimmed, token);
      setReportDialog(null);
      showToast("success", "Report submitted. Thank you.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to submit report.");
    } finally {
      setBusyPostId(null);
    }
  }

  function scrollTop() {
    const container = document.querySelector("main") as HTMLElement | null;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div 
    className="relative w-full transition-colors duration-300" 
    style={{ background: 'var(--bg)', color: 'var(--text)' }}
  >
    <ThemeToggle />
    <main ref={mainRef} className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth" style={{ background: "var(--bg)" }}>
      <GlobalHeader
        activeCategory={selectedCategoryFilter}
        setActiveCategory={setSelectedCategoryFilter}
      />

      <SortBar activeSort={selectedSortFilter} setActiveSort={handleSortChange} />

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
              <div
                key={review.id}
                className="h-screen w-full snap-start"
                ref={(el) => {
                  reviewRefs.current[review.id] = el;
                }}
              >
                <ReviewCard
                  review={review}
                  userReaction={userReactions[review.id] ?? null}
                  isFavorited={Boolean(review.isFavorited)}
                  isOwner={Boolean(review.isOwner)}
                  isBusy={busyPostId === review.id}
                  onLike={() => void applyReaction(review.id, "liked")}
                  onDislike={() => void applyReaction(review.id, "disliked")}
                  onToggleFavorite={() => void handleToggleFavorite(review)}
                  onEdit={review.isOwner ? () => void handleEditPost(review) : undefined}
                  onDelete={review.isOwner ? () => void handleDeletePost(review) : undefined}
                  onReport={() => void handleReportSpot(review)}
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

      {toast ? (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            color: "var(--text)",
            background: toast.type === "success" ? "rgba(105,242,140,0.14)" : "rgba(255,120,120,0.15)",
            border:
              toast.type === "success"
                ? "1px solid rgba(105,242,140,0.45)"
                : "1px solid rgba(255,120,120,0.45)",
            backdropFilter: "blur(8px)",
          }}
        >
          {toast.message}
        </div>
      ) : null}

      {editDialog ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4" onClick={() => setEditDialog(null)}>
          <div className="w-full max-w-xl rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }} onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Edit rating</h3>
            <label className="mt-3 block text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Text</label>
            <textarea
              value={editDialog.text}
              onChange={(e) => setEditDialog((prev) => (prev ? { ...prev, text: e.target.value } : prev))}
              rows={4}
              className="mt-1 w-full rounded-lg border p-2 text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
            />
            <label className="mt-3 block text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Rating (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              step={1}
              value={editDialog.rating}
              onChange={(e) => setEditDialog((prev) => (prev ? { ...prev, rating: e.target.value } : prev))}
              className="mt-1 w-full rounded-lg border p-2 text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditDialog(null)} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Cancel</button>
              <button type="button" onClick={() => void submitEditDialog()} disabled={busyPostId === editDialog.review.id} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>{busyPostId === editDialog.review.id ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteDialog ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4" onClick={() => setDeleteDialog(null)}>
          <div className="w-full max-w-md rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }} onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Delete rating</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteDialog(null)} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Cancel</button>
              <button type="button" onClick={() => void submitDeleteDialog()} disabled={busyPostId === deleteDialog.id} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "rgba(255,107,107,0.5)", color: "#ff6b6b" }}>{busyPostId === deleteDialog.id ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {reportDialog ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4" onClick={() => setReportDialog(null)}>
          <div className="w-full max-w-xl rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }} onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Report rating</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Tell us what is wrong or outdated.</p>
            <textarea
              value={reportDialog.text}
              onChange={(e) => setReportDialog((prev) => (prev ? { ...prev, text: e.target.value } : prev))}
              rows={4}
              className="mt-3 w-full rounded-lg border p-2 text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setReportDialog(null)} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Cancel</button>
              <button type="button" onClick={() => void submitReportDialog()} disabled={busyPostId === reportDialog.review.id} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg)" }}>{busyPostId === reportDialog.review.id ? "Submitting..." : "Submit"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
    </div>
  );
}
