import { NextResponse } from "next/server";
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

const PROFESSORS: ProfessorCatalogItem[] = [
  {
    id: "p1",
    kind: "professor",
    name: "Dr. Rana Haddad",
    subtitle: "Computer Science",
    department: "Computer Science",
  },
  {
    id: "p2",
    kind: "professor",
    name: "Dr. Samir Nassar",
    subtitle: "Mathematics",
    department: "Mathematics",
  },
  {
    id: "p3",
    kind: "professor",
    name: "Dr. Layla Harb",
    subtitle: "Engineering",
    department: "Electrical and Computer Engineering",
  },
  {
    id: "p4",
    kind: "professor",
    name: "Dr. Nour Khoury",
    subtitle: "Nutrition and Food Science",
    department: "Nutrition and Food Science",
  },
];

const ACADEMICS: Record<AcademicKind, CatalogItem[]> = {
  course: [...COURSES],
  professor: [...PROFESSORS],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const kind = searchParams.get("kind");

  if (group === "spots" && (kind === "study-spot" || kind === "food-spot")) {
    return NextResponse.json({ ok: true, items: SPOTS[kind] });
  }

  if (group === "academics" && (kind === "course" || kind === "professor")) {
    return NextResponse.json({ ok: true, items: ACADEMICS[kind] });
  }

  if (group === "academics" && kind === "all") {
    return NextResponse.json({ ok: true, items: [...COURSES, ...PROFESSORS] });
  }

  return NextResponse.json(
    { ok: false, error: "Invalid group/kind query." },
    { status: 400 }
  );
}
