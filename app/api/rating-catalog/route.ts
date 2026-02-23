import { NextResponse } from "next/server";
import type { AcademicKind, SpotKind } from "@/lib/rating-catalog";

const SPOTS: Record<SpotKind, { id: string; name: string; subtitle?: string }[]> = {
  "study-spot": [
    { id: "s1", name: "Jafet Library", subtitle: "Main campus" },
    { id: "s2", name: "Irani Oxy Terrace", subtitle: "Engineering area" },
    { id: "s3", name: "Green Oval Benches", subtitle: "Outdoor" },
  ],
  "food-spot": [
    { id: "f1", name: "West Hall Cafeteria", subtitle: "Affordable meals" },
    { id: "f2", name: "Bliss House Café", subtitle: "Coffee and snacks" },
    { id: "f3", name: "Main Gate Shawarma", subtitle: "Quick bite" },
  ],
};

const ACADEMICS: Record<AcademicKind, { id: string; name: string; subtitle?: string }[]> = {
  course: [
    { id: "c1", name: "CMPS 202 - Data Structures", subtitle: "Computer Science" },
    { id: "c2", name: "MATH 201 - Calculus III", subtitle: "Mathematics" },
    { id: "c3", name: "EECE 230 - Circuit Analysis", subtitle: "Engineering" },
  ],
  professor: [
    { id: "p1", name: "Dr. Rana Haddad", subtitle: "Computer Science" },
    { id: "p2", name: "Dr. Samir Nassar", subtitle: "Mathematics" },
    { id: "p3", name: "Dr. Layla Harb", subtitle: "Engineering" },
  ],
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

  return NextResponse.json(
    { ok: false, error: "Invalid group/kind query." },
    { status: 400 }
  );
}
