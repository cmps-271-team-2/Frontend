import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid payload." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, message: "Rating received." });
}
