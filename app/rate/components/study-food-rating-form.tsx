"use client";

import { FormEvent, useState, useMemo } from "react";
import MultiSelectChips from "./multi-select-chips";
import PhotoUpload from "./photo-upload";
import RatingStars from "./rating-stars";
import { submitRating, StudyFoodCategory } from "@/lib/ratings";
import { detectTags } from "@/lib/tag-detector";

const MIN_COMMENT_LENGTH = 20;

const ATTRIBUTE_OPTIONS = [
  "quiet",
  "outlets",
  "wifi",
  "cheap",
  "good coffee",
  "group-friendly",
  "comfortable",
  "sleepy",
  "loud",
  "coffee",
  "crowded",
];

type StudyFoodFormProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  initialSpotName?: string;
  initialCategory?: StudyFoodCategory;
  lockSelection?: boolean;
};

type StudyFoodFormErrors = {
  spotName?: string;
  category?: string;
  overallRating?: string;
  comment?: string;
};

export default function StudyFoodRatingForm({
  onSuccess,
  onError,
  initialSpotName,
  initialCategory,
  lockSelection = false,
}: StudyFoodFormProps) {
  const [spotName, setSpotName] = useState(initialSpotName ?? "");
  const [category, setCategory] = useState<StudyFoodCategory | "">(initialCategory ?? "");
  const [location, setLocation] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [blockedAutoTags, setBlockedAutoTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("");
  const [bestTimeToGo, setBestTimeToGo] = useState("");
  const [comment, setComment] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<StudyFoodFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect tags from comment text
  const autoDetectedTags = useMemo(() => {
    return detectTags(comment);
  }, [comment]);

  // Filter auto-detected tags by blocked list
  const activeAutoTags = useMemo(() => {
    return autoDetectedTags.filter((tag) => !blockedAutoTags.includes(tag));
  }, [autoDetectedTags, blockedAutoTags]);

  // Merge manual and auto-detected attributes (excluding blocked)
  const finalAttributes = useMemo(() => {
    return Array.from(new Set([...attributes, ...activeAutoTags]));
  }, [attributes, activeAutoTags]);

  function resetForm() {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setSpotName(initialSpotName ?? "");
    setCategory(initialCategory ?? "");
    setLocation("");
    setOverallRating(0);
    setAttributes([]);
    setBlockedAutoTags([]);
    setPriceRange("");
    setBestTimeToGo("");
    setComment("");
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setErrors({});
  }

  function validateForm(): StudyFoodFormErrors {
    const nextErrors: StudyFoodFormErrors = {};

    if (!spotName.trim()) {
      nextErrors.spotName = "Spot name is required.";
    }

    if (!category) {
      nextErrors.category = "Please select a category.";
    }

    if (overallRating < 1 || overallRating > 5) {
      nextErrors.overallRating = "Overall rating is required.";
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      nextErrors.comment = `Comment must be at least ${MIN_COMMENT_LENGTH} characters.`;
    }

    return nextErrors;
  }

  function handleAttributesChange(newAttributes: string[]) {
    // Detect which tags were removed
    for (const tag of attributes) {
      if (!newAttributes.includes(tag) && autoDetectedTags.includes(tag)) {
        // Tag was removed and it's auto-detected, so block it
        setBlockedAutoTags((prev) =>
          prev.includes(tag) ? prev : [...prev, tag]
        );
      }
    }

    // Detect which tags were added
    for (const tag of newAttributes) {
      if (!attributes.includes(tag) && blockedAutoTags.includes(tag)) {
        // Tag was added back and it was blocked, remove from blocked
        setBlockedAutoTags((prev) => prev.filter((t) => t !== tag));
      }
    }

    setAttributes(newAttributes);
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
      await submitRating({
        ratingType: "study-food",
        spotName: spotName.trim(),
        category: category as StudyFoodCategory,
        location: location.trim() || undefined,
        overallRating,
        attributes: finalAttributes,
        priceRange: category === "food-spot" ? priceRange.trim() || undefined : undefined,
        bestTimeToGo: bestTimeToGo.trim() || undefined,
        comment: comment.trim(),
        photos: photoFiles.map((file) => file.name),
      });

      onSuccess("Study/Food rating submitted successfully.");
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
        <label className="block text-sm font-semibold">Spot name *</label>
        <input
          type="text"
          value={spotName}
          onChange={(event) => setSpotName(event.target.value)}
          disabled={lockSelection}
          className="w-full rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
        />
        {errors.spotName ? <p className="text-sm text-red-500">{errors.spotName}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Category *</label>
        {lockSelection ? (
          <div
            className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "#3b82f6", background: "rgba(59, 130, 246, 0.18)" }}
          >
            {category === "food-spot" ? "Food spot" : "Study spot"}
          </div>
        ) : (
          <div className="flex gap-2">
            {[
              { label: "Study spot", value: "study-spot" },
              { label: "Food spot", value: "food-spot" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value as StudyFoodCategory)}
                className="rounded-full border px-4 py-2 text-sm font-semibold"
                style={{
                  borderColor: category === item.value ? "#3b82f6" : "var(--border)",
                  background: category === item.value ? "rgba(59, 130, 246, 0.18)" : "transparent",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        {errors.category ? <p className="text-sm text-red-500">{errors.category}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Location / campus area</label>
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
        />
      </div>

      <RatingStars
        value={overallRating}
        onChange={setOverallRating}
        label="Overall rating *"
        error={errors.overallRating}
      />

      <MultiSelectChips
        label="Attributes"
        options={ATTRIBUTE_OPTIONS}
        selected={finalAttributes}
        onChange={handleAttributesChange}
      />

      {category === "food-spot" ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold">Price range</label>
          <select
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
          >
            <option value="">Select range</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Best time to go</label>
        <input
          type="text"
          value={bestTimeToGo}
          onChange={(event) => setBestTimeToGo(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
        />
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

      <PhotoUpload
        files={photoFiles}
        previews={photoPreviews}
        onChange={(nextFiles, nextPreviews) => {
          setPhotoFiles(nextFiles);
          setPhotoPreviews(nextPreviews);
        }}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2 font-bold disabled:opacity-70"
        style={{ background: "#2563eb", color: "white" }}
      >
        {isSubmitting ? "Submitting..." : "Submit Study / Food Rating"}
      </button>
    </form>
  );
}
