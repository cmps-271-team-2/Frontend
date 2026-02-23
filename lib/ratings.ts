export type StudyFoodCategory = "study-spot" | "food-spot";

export type StudyFoodRatingPayload = {
  ratingType: "study-food";
  spotName: string;
  category: StudyFoodCategory;
  location?: string;
  overallRating: number;
  attributes: string[];
  priceRange?: string;
  bestTimeToGo?: string;
  comment: string;
  photos?: string[];
};

export type CourseProfessorType = "course" | "professor";

export type CourseProfessorRatingPayload = {
  ratingType: "course-professor";
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
};

export async function submitRating(payload: RatingPayload): Promise<SubmitRatingResponse> {
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
    throw new Error(data.error || data.message || "Failed to submit rating.");
  }

  return data;
}
