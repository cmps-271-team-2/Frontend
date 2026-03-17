"use client";

import { FormEvent, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DarkSelect from "./dark-select";
import RatingStars from "./rating-stars";
import { CourseProfessorType, submitRating } from "@/lib/ratings";

type FirestoreCourse = {
  id: string;
  code: string;
  title: string;
};

const MIN_COMMENT_LENGTH = 20;

type CourseProfessorFormProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  initialTargetId: string;
  initialType?: CourseProfessorType;
  initialName?: string;
  lockSelection?: boolean;
};

type CourseProfessorErrors = {
  type?: string;
  courseCode?: string;
  courseName?: string;
  professorName?: string;
  difficulty?: string;
  teachingQuality?: string;
  workload?: string;
  fairness?: string;
  comment?: string;
};

export default function CourseProfessorRatingForm({
  onSuccess,
  onError,
  initialTargetId,
  initialType,
  initialName,
  lockSelection = false,
}: CourseProfessorFormProps) {
  const [type, setType] = useState<CourseProfessorType | "">(initialType ?? "");
  const [courseCode, setCourseCode] = useState(initialType === "course" ? initialName ?? "" : "");
  const [courseName, setCourseName] = useState("");
  const [professorName, setProfessorName] = useState(
    initialType === "professor" ? initialName ?? "" : ""
  );
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [semesterTaken, setSemesterTaken] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [teachingQuality, setTeachingQuality] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [fairness, setFairness] = useState(0);
  const [attendanceMandatory, setAttendanceMandatory] = useState<string>("");
  const [wouldRecommend, setWouldRecommend] = useState<string>("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<CourseProfessorErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCourseTitle = courses.find((c) => c.code === courseCode)?.title ?? "";

  // Load courses from Firestore when the course type is active
  useEffect(() => {
    if (type !== "course") return;
    let mounted = true;
    setCoursesLoading(true);
    getDocs(collection(db, "courses"))
      .then((snapshot) => {
        if (!mounted) return;
        const list: FirestoreCourse[] = snapshot.docs.map((doc) => {
          const d = doc.data() as { code?: string; title?: string };
          return { id: doc.id, code: d.code ?? doc.id, title: d.title ?? "" };
        });
        list.sort((a, b) => a.code.localeCompare(b.code));
        setCourses(list);
      })
      .catch(() => { /* silently fail – user can still type */ })
      .finally(() => { if (mounted) setCoursesLoading(false); });
    return () => { mounted = false; };
  }, [type]);

  useEffect(() => {
    if (type !== "course") {
      return;
    }

    if (selectedCourseTitle) {
      setCourseName(selectedCourseTitle);
    }
  }, [courseCode, selectedCourseTitle, type]);

  function handleCourseSelect(selectedCode: string) {
    setCourseCode(selectedCode);
    const match = courses.find((c) => c.code === selectedCode);
    setCourseName(match ? match.title : "");
  }

  function resetForm() {
    setType(initialType ?? "");
    setCourseCode(initialType === "course" ? initialName ?? "" : "");
    setCourseName("");
    setProfessorName(initialType === "professor" ? initialName ?? "" : "");
    setDepartment("");
    setSemesterTaken("");
    setDifficulty(0);
    setTeachingQuality(0);
    setWorkload(0);
    setFairness(0);
    setAttendanceMandatory("");
    setWouldRecommend("");
    setComment("");
    setErrors({});
  }

  function validateForm(): CourseProfessorErrors {
    const nextErrors: CourseProfessorErrors = {};

    if (!type) {
      nextErrors.type = "Please select a type.";
    }

    if (type === "course" && !courseCode.trim()) {
      nextErrors.courseCode = "Course code is required.";
    }

    if (type === "course" && !professorName.trim()) {
      nextErrors.professorName = "Professor name is required.";
    }

    if (type === "professor" && !professorName.trim()) {
      nextErrors.professorName = "Professor name is required.";
    }

    if (type === "professor" && !courseCode.trim() && !courseName.trim()) {
      nextErrors.courseName = "Course is required.";
    }

    if (difficulty < 1 || difficulty > 5) {
      nextErrors.difficulty = "Difficulty rating is required.";
    }
    if (teachingQuality < 1 || teachingQuality > 5) {
      nextErrors.teachingQuality = "Teaching quality rating is required.";
    }
    if (workload < 1 || workload > 5) {
      nextErrors.workload = "Workload rating is required.";
    }
    if (fairness < 1 || fairness > 5) {
      nextErrors.fairness = "Fairness rating is required.";
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      nextErrors.comment = `Comment must be at least ${MIN_COMMENT_LENGTH} characters.`;
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const derivedCourseName = type === "course" ? (selectedCourseTitle || courseName.trim()) : courseName.trim();

      await submitRating({
        ratingType: "course-professor",
        targetId: initialTargetId,
        type: type as CourseProfessorType,
        courseCode: courseCode.trim() || undefined,
        courseName: derivedCourseName || undefined,
        professorName: professorName.trim() || undefined,
        department: department.trim() || undefined,
        semesterTaken: semesterTaken.trim() || undefined,
        ratings: {
          difficulty,
          teachingQuality,
          workload,
          fairness,
        },
        attendanceMandatory: attendanceMandatory ? attendanceMandatory === "yes" : undefined,
        wouldRecommend: wouldRecommend ? wouldRecommend === "yes" : undefined,
        comment: comment.trim(),
      });

      onSuccess("Course/Professor post submitted successfully.");
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit rating.";
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Type *</label>
        {lockSelection ? (
          <div
            className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--accent-blue)", background: "rgba(91, 200, 255, 0.08)" }}
          >
            {type === "course" ? "Course" : "Professor"}
          </div>
        ) : (
          <div className="flex gap-2">
            {[
              { value: "course", label: "Course" },
              { value: "professor", label: "Professor" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setType(item.value as CourseProfessorType);
                  setCourseCode("");
                  setCourseName("");
                }}
                className="rounded-full border px-4 py-2 text-sm font-semibold"
                style={{
                  borderColor: type === item.value ? "var(--accent-blue)" : "var(--border)",
                  background: type === item.value ? "rgba(91, 200, 255, 0.08)" : "transparent",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        {errors.type ? <p className="text-sm text-red-500">{errors.type}</p> : null}
      </div>

      {/* Course type fields */}
      {type === "course" ? (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Course *</label>
            {coursesLoading ? (
              <p className="text-xs" style={{ color: "var(--muted)" }}>Loading courses…</p>
            ) : (
              <DarkSelect
                value={courseCode}
                onChange={handleCourseSelect}
                aria-label="Select course"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} – {c.title}
                  </option>
                ))}
              </DarkSelect>
            )}
            {errors.courseCode ? <p className="text-sm text-red-500">{errors.courseCode}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Professor name *</label>
            <input
              type="text"
              value={professorName}
              onChange={(e) => setProfessorName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
            />
            {errors.professorName ? <p className="text-sm text-red-500">{errors.professorName}</p> : null}
          </div>
        </>
      ) : null}

      {/* Professor type fields */}
      {type === "professor" ? (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Professor name *</label>
            <input
              type="text"
              value={professorName}
              onChange={(e) => setProfessorName(e.target.value)}
              disabled={lockSelection}
              className="w-full rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
            />
            {errors.professorName ? <p className="text-sm text-red-500">{errors.professorName}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Course name *</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
            />
            {errors.courseName ? <p className="text-sm text-red-500">{errors.courseName}</p> : null}
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Semester taken</label>
        <input
          type="text"
          value={semesterTaken}
          onChange={(event) => setSemesterTaken(event.target.value)}
          placeholder="e.g. Fall 2025"
          className="w-full rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
        />
      </div>

      <RatingStars value={difficulty} onChange={setDifficulty} label="Difficulty *" error={errors.difficulty} />
      <RatingStars
        value={teachingQuality}
        onChange={setTeachingQuality}
        label="Teaching quality *"
        error={errors.teachingQuality}
      />
      <RatingStars value={workload} onChange={setWorkload} label="Workload *" error={errors.workload} />
      <RatingStars value={fairness} onChange={setFairness} label="Fairness *" error={errors.fairness} />

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Attendance mandatory?</label>
        <DarkSelect
          value={attendanceMandatory}
          onChange={setAttendanceMandatory}
          aria-label="Attendance mandatory"
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </DarkSelect>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Would recommend?</label>
        <DarkSelect
          value={wouldRecommend}
          onChange={setWouldRecommend}
          aria-label="Would recommend"
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </DarkSelect>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Comment / review *</label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          className="w-full rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
        />
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Minimum {MIN_COMMENT_LENGTH} characters.
        </p>
        {errors.comment ? <p className="text-sm text-red-500">{errors.comment}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2 font-bold disabled:opacity-70"
        style={{ background: "var(--accent)", color: "white" }}
      >
        {isSubmitting ? "Submitting..." : "Submit Course / Professor Rating"}
      </button>
    </form>
  );
}
