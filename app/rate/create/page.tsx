"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CourseProfessorRatingForm from "../components/course-professor-rating-form";
import StudyFoodRatingForm from "../components/study-food-rating-form";
import { CourseProfessorType, StudyFoodCategory } from "@/lib/ratings";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function CreateRatingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6" style={{ color: "var(--text)" }}>
          <h1 className="text-2xl font-black">Create rating</h1>
        </main>
      }
    >
      <CreateRatingPageContent />
    </Suspense>
  );
}

function CreateRatingPageContent() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ToastState>(null);

  const flow = searchParams.get("flow");
  const selectedId = searchParams.get("id") || "";
  const selectedName = searchParams.get("name") || "";
  const category = searchParams.get("category") as StudyFoodCategory | null;
  const academicType = searchParams.get("type") as CourseProfessorType | null;

  const isStudyFoodFlow =
    flow === "study-food" && (category === "study-spot" || category === "food-spot");
  const isAcademicFlow =
    flow === "course-professor" && (academicType === "course" || academicType === "professor");

  const heading = useMemo(() => {
    if (isStudyFoodFlow) {
      return "Create Study / Food Spot rating";
    }
    if (isAcademicFlow) {
      return "Create Course / Professor rating";
    }
    return "Create rating";
  }, [isAcademicFlow, isStudyFoodFlow]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }

  if (!selectedId || !selectedName || (!isStudyFoodFlow && !isAcademicFlow)) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6" style={{ color: "var(--text)" }}>
        <h1 className="text-2xl font-black">Invalid rating selection</h1>
        <p className="mt-2 text-sm font-semibold" style={{ color: "var(--muted)" }}>
          Please start from the + button and pick a category and item from list.
        </p>
        <Link href="/rate" className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm font-bold">
          Go to rating categories
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6" style={{ color: "var(--text)" }}>
      <h1 className="text-2xl font-black">{heading}</h1>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
        Selected item: {selectedName}
      </p>

      <section
        className="mt-4 rounded-2xl border p-4 sm:p-6"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        {isStudyFoodFlow ? (
          <StudyFoodRatingForm
            initialTargetId={selectedId}
            initialSpotName={selectedName}
            initialCategory={category as StudyFoodCategory}
            lockSelection
            onSuccess={(message) => showToast("success", message)}
            onError={(message) => showToast("error", message)}
          />
        ) : null}

        {isAcademicFlow ? (
          <CourseProfessorRatingForm
            initialTargetId={selectedId}
            initialType={academicType as CourseProfessorType}
            initialName={selectedName}
            lockSelection
            onSuccess={(message) => showToast("success", message)}
            onError={(message) => showToast("error", message)}
          />
        ) : null}
      </section>

      <div
        aria-live="polite"
        className="pointer-events-none fixed left-1/2 top-4 z-110 w-[90%] max-w-md -translate-x-1/2"
      >
        {toast ? (
          <div
            className="rounded-lg border px-4 py-3 text-sm font-semibold"
            style={{
              borderColor: toast.type === "success" ? "#22c55e" : "#ef4444",
              background:
                toast.type === "success" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.18)",
            }}
          >
            {toast.message}
          </div>
        ) : null}
      </div>
    </main>
  );
}
