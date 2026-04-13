import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";

export type StudyFoodCategory = "study-spot" | "food-spot";

export type StudyFoodRatingPayload = {
  ratingType: "study-food";
  targetId: string;
  spotName: string;
  category: StudyFoodCategory;
  location?: string;
  overallRating: number;
  attributes: string[];
  priceRange?: string;
  bestTimeToGo?: string;
  comment: string;
  media?: string[];
};

export type CourseProfessorType = "course" | "professor";

export type CourseProfessorRatingPayload = {
  ratingType: "course-professor";
  targetId: string;
  type: CourseProfessorType;
  targetName?: string;
  courseCode?: string;
  courseName?: string;
  professorName?: string;
  department?: string;
  semesterTaken?: string;
  ratings: {
    difficulty: number;
    teachingQuality: number;
    workload: number;
    fairness: number;
  };
  attendanceMandatory?: boolean;
  wouldRecommend?: boolean;
  comment: string;
};

export type RatingPayload = StudyFoodRatingPayload | CourseProfessorRatingPayload;

type SubmitRatingResponse = {
  ok: boolean;
  message?: string;
  moderation?: {
    status: string;
    allowed: boolean;
  };
};

function mapRatingPayloadToBackendPost(payload: RatingPayload): Record<string, unknown> | null {
  if (payload.ratingType === "course-professor") {
    const ratings = payload.ratings;
    const numericRatings = [
      Number(ratings.difficulty || 0),
      Number(ratings.teachingQuality || 0),
      Number(ratings.workload || 0),
      Number(ratings.fairness || 0),
    ].filter((value) => Number.isFinite(value) && value > 0);

    return {
      rating: numericRatings.length
        ? Math.round(numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length)
        : 0,
      text: payload.comment,
      targetId: payload.targetId,
      targetType: payload.type,
      targetName: payload.targetName || payload.professorName || payload.courseName,
      title:
        payload.type === "professor"
          ? payload.professorName || payload.targetName || payload.courseName || ""
          : payload.courseName || payload.targetName || payload.professorName || "",
      courseCode: payload.courseCode,
      courseName: payload.courseName,
      professorName: payload.professorName,
      department: payload.department,
      semesterTaken: payload.semesterTaken,
      ratings,
      attendanceMandatory: payload.attendanceMandatory,
      wouldRecommend: payload.wouldRecommend,
    };
  }

  if (payload.ratingType === "study-food") {
    return {
      rating: payload.overallRating,
      text: payload.comment,
      targetId: payload.targetId,
      targetType: "spot",
      targetName: payload.spotName,
      title: payload.spotName,
      spotName: payload.spotName,
      category: payload.category,
      location: payload.location,
      attributes: payload.attributes,
      priceRange: payload.priceRange,
      bestTimeToGo: payload.bestTimeToGo,
      media: payload.media,
    };
  }

  return null;
}

export async function submitRating(payload: RatingPayload): Promise<SubmitRatingResponse> {
  try {
    const authToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    const backendPayload = mapRatingPayloadToBackendPost(payload);

    if (!backendPayload) {
      throw new Error("Unsupported rating payload.");
    }

    await apiFetch<{ id?: string; message?: string; moderation?: { status?: string; allowed?: boolean } }>(
      "/posts",
      {
        method: "POST",
        authToken: authToken || undefined,
        body: JSON.stringify(backendPayload),
      }
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("rating:submitted"));
    }

    return {
      ok: true,
      message: "Post submitted successfully.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error submitting rating.";
    console.error("Submit rating error:", message);
    throw error;
  }
}
