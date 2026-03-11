"use client";

import { useEffect } from "react";

type PhotoUploadProps = {
  files: File[];
  previews: string[];
  onChange: (nextFiles: File[], nextPreviews: string[]) => void;
};

export default function PhotoUpload({ files, previews, onChange }: PhotoUploadProps) {
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const chosenFiles = Array.from(event.target.files || []);
    if (!chosenFiles.length) return;

    const chosenPreviews = chosenFiles.map((file) => URL.createObjectURL(file));
    onChange([...files, ...chosenFiles], [...previews, ...chosenPreviews]);
    event.target.value = "";
  }

  function removeAt(index: number) {
    URL.revokeObjectURL(previews[index]);
    onChange(
      files.filter((_, fileIndex) => fileIndex !== index),
      previews.filter((_, previewIndex) => previewIndex !== index)
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">Photos or videos (optional)</label>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="block w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
      />

      {previews.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              <img src={preview} alt={`Upload ${index + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="w-full border-t px-2 py-1 text-xs font-semibold"
                style={{ borderColor: "var(--border)" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
