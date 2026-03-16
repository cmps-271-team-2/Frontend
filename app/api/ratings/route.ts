import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid payload." },
      { status: 400 }
    );
  }

  // Use environment variable with fallback to local development URL
  const baseUrl =
    process.env.BACKEND_BASE_URL ||
    (typeof window === "undefined" ? "http://localhost:8000" : "http://localhost:8000");

  if (!baseUrl) {
    return NextResponse.json(
      { ok: false, error: "Backend base URL not configured." },
      { status: 500 }
    );
  }

  const backendPayload = mapRatingPayloadToPost(body as Record<string, unknown>);
  if (!backendPayload) {
    return NextResponse.json(
      { ok: false, error: "Unsupported rating payload." },
      { status: 400 }
    );
  }

  const response = await fetch(`${baseUrl}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendPayload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; moderation?: { status?: string; allowed?: boolean }; error?: string }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: data?.error || data?.message || "Failed to submit post." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    ok: true,
    message: data?.message || "Post submitted successfully.",
    moderation: {
      status: data?.moderation?.status || "pending",
      allowed: Boolean(data?.moderation?.allowed),
    },
  });
}

function mapRatingPayloadToPost(body: Record<string, unknown>) {
  if (body.ratingType === "course-professor") {
    const ratings = (body.ratings as Record<string, unknown> | undefined) || {};
    const numericRatings = [
      Number(ratings.difficulty || 0),
      Number(ratings.teachingQuality || 0),
      Number(ratings.workload || 0),
      Number(ratings.fairness || 0),
    ].filter((value) => Number.isFinite(value) && value > 0);

    return {
      targetId: String(body.targetId || ""),
      targetType: String(body.type || "course"),
      text: String(body.comment || ""),
      rating: numericRatings.length
        ? Math.round(numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length)
        : 0,
      kind: "course-professor",
      title: body.type === "professor" ? String(body.professorName || "") : String(body.courseName || ""),
      department: body.department,
      semesterTaken: body.semesterTaken,
      ratings,
      attendanceMandatory: body.attendanceMandatory,
      wouldRecommend: body.wouldRecommend,
    };
  }

  if (body.ratingType === "study-food") {
    return {
      targetId: String(body.targetId || ""),
      targetType: String(body.category || "study-spot"),
      text: String(body.comment || ""),
      rating: Number(body.overallRating || 0),
      kind: "study-food",
      title: String(body.spotName || ""),
      location: body.location,
      attributes: body.attributes,
      priceRange: body.priceRange,
      bestTimeToGo: body.bestTimeToGo,
      media: body.media,
    };
  }

  return null;
}
