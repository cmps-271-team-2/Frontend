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

export async function submitRating(payload: RatingPayload): Promise<SubmitRatingResponse> {
  try {
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as SubmitRatingResponse & {
      error?: string;
    };

    if (!response.ok || !data.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to submit rating.`;
      console.error("Submit rating failed:", {
        status: response.status,
        data,
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("rating:submitted"));
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error submitting rating.";
    console.error("Submit rating error:", message);
    throw error;
  }
}
