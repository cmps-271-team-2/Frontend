import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api";
import type {
  AcademicKind,
  CatalogItem,
  CourseCatalogItem,
  FoodSpotCatalogItem,
  ProfessorCatalogItem,
  SpotKind,
  StudySpotCatalogItem,
} from "@/lib/rating-catalog";

const STUDY_SPOTS: StudySpotCatalogItem[] = [
  {
    id: "s1",
    kind: "study-spot",
    name: "Jafet Library",
    subtitle: "Main campus",
    area: "Main Campus",
    spotType: "indoor",
    noiseLevel: "quiet",
    hasWifi: true,
    hasOutlets: true,
    openNow: true,
    rating: 4.8,
  },
  {
    id: "s2",
    kind: "study-spot",
    name: "Irani Oxy Terrace",
    subtitle: "Engineering area",
    area: "Engineering",
    spotType: "outdoor",
    noiseLevel: "moderate",
    hasWifi: true,
    hasOutlets: false,
    openNow: true,
    rating: 4.2,
  },
  {
    id: "s3",
    kind: "study-spot",
    name: "Green Oval Benches",
    subtitle: "Outdoor",
    area: "Green Oval",
    spotType: "outdoor",
    noiseLevel: "busy",
    hasWifi: false,
    hasOutlets: false,
    openNow: true,
    rating: 3.7,
  },
  {
    id: "s4",
    kind: "study-spot",
    name: "Sage Hall Study Lounge",
    subtitle: "Quiet corners and shared desks",
    area: "Sage Hall",
    spotType: "indoor",
    noiseLevel: "quiet",
    hasWifi: true,
    hasOutlets: true,
    openNow: false,
    rating: 4.5,
  },
  {
    id: "s5",
    kind: "study-spot",
    name: "West Hall Courtyard",
    subtitle: "Semi-covered, group-friendly",
    area: "West Hall",
    spotType: "mixed",
    noiseLevel: "moderate",
    hasWifi: true,
    hasOutlets: true,
    openNow: true,
    rating: 4.1,
  },
];

const FOOD_SPOTS: FoodSpotCatalogItem[] = [
  {
    id: "f1",
    kind: "food-spot",
    name: "West Hall Food Court",
    subtitle: "Affordable meals",
    area: "West Hall",
    venueCategory: "restaurant",
    priceLevel: "$",
    openNow: true,
    rating: 4.0,
  },
  {
    id: "f2",
    kind: "food-spot",
    name: "Bliss House Food",
    subtitle: "Coffee and snacks",
    area: "Bliss Street",
    venueCategory: "food",
    priceLevel: "$$",
    openNow: true,
    rating: 4.6,
  },
  {
    id: "f3",
    kind: "food-spot",
    name: "Main Gate Shawarma",
    subtitle: "Quick bite",
    area: "Main Gate",
    venueCategory: "fast-food",
    priceLevel: "$",
    openNow: false,
    rating: 4.1,
  },
  {
    id: "f4",
    kind: "food-spot",
    name: "Nour Bakery",
    subtitle: "Fresh pastries and manakish",
    area: "Hamra",
    venueCategory: "bakery",
    priceLevel: "$",
    openNow: true,
    rating: 4.4,
  },
  {
    id: "f5",
    kind: "food-spot",
    name: "Urban Fork",
    subtitle: "Casual dining and bowls",
    area: "Bliss Street",
    venueCategory: "restaurant",
    priceLevel: "$$$",
    openNow: true,
    rating: 4.3,
  },
];

const SPOTS: Record<SpotKind, CatalogItem[]> = {
  "study-spot": STUDY_SPOTS,
  "food-spot": FOOD_SPOTS,
};

const COURSES: CourseCatalogItem[] = [
  {
    id: "c1",
    kind: "course",
    name: "Data Structures",
    courseCode: "CMPS 202",
    subtitle: "Computer Science",
    department: "Computer Science",
  },
  {
    id: "c2",
    kind: "course",
    name: "Calculus III",
    courseCode: "MATH 201",
    subtitle: "Mathematics",
    department: "Mathematics",
  },
  {
    id: "c3",
    kind: "course",
    name: "Circuit Analysis",
    courseCode: "EECE 230",
    subtitle: "Engineering",
    department: "Electrical and Computer Engineering",
  },
  {
    id: "c4",
    kind: "course",
    name: "Introduction to Food Service and Industries",
    courseCode: "NFSC 201",
    subtitle: "Nutrition and Food Science",
    department: "Nutrition and Food Science",
  },
];

async function fetchProfessors(): Promise<ProfessorCatalogItem[]> {
  const baseUrl = getBackendUrl();
  if (!baseUrl) {
    throw new Error("Backend base URL not configured.");
  }

  const response = await fetch(`${baseUrl}/professors?sort_by=name&order=asc`, {
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as Array<Record<string, unknown>> | null;
  if (!response.ok || !Array.isArray(data)) {
    throw new Error("Failed to load professors.");
  }

  return data
    .map((professor, index) => {
      const name = typeof professor.name === "string" ? professor.name.trim() : "";
      const department = typeof professor.department === "string" ? professor.department.trim() : "";

      if (!name) {
        return null;
      }

      return {
        id: typeof professor.id === "string" && professor.id.trim().length > 0 ? professor.id.trim() : `professor-${index}`,
        kind: "professor" as const,
        name,
        subtitle: department || undefined,
        department: department || undefined,
      };
    })
    .filter((item): item is ProfessorCatalogItem => item !== null);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const kind = searchParams.get("kind");

    if (group === "spots" && (kind === "study-spot" || kind === "food-spot")) {
      return NextResponse.json({ ok: true, items: SPOTS[kind] });
    }

    if (group === "academics" && kind === "course") {
      return NextResponse.json({ ok: true, items: COURSES });
    }

    if (group === "academics" && kind === "professor") {
      const professors = await fetchProfessors();
      return NextResponse.json({ ok: true, items: professors });
    }

    if (group === "academics" && kind === "all") {
      const professors = await fetchProfessors();
      return NextResponse.json({ ok: true, items: [...COURSES, ...professors] });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid group/kind query." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to load catalog items." },
      { status: 500 }
    );
  }
}
