import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

export type FirestoreSpot = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
};

function toText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchFirestoreSpots(): Promise<FirestoreSpot[]> {
  const snapshot = await getDocs(collection(db, "spots"));

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      name?: string;
      category?: string;
      location?: string;
      rating?: number;
      reviewCount?: number;
    };

    return {
      id: doc.id,
      name: toText(data.name, doc.id),
      category: toText(data.category, "study"),
      location: toText(data.location),
      rating: toNumber(data.rating),
      reviewCount: Math.max(0, Math.round(toNumber(data.reviewCount))),
    };
  });
}