"use client";

type MultiSelectChipsProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
};

export default function MultiSelectChips({
  label,
  options,
  selected,
  onChange,
}: MultiSelectChipsProps) {
  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }

    onChange([...selected, option]);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className="rounded-full border px-3 py-1.5 text-sm font-medium transition"
              style={{
                borderColor: isSelected ? "var(--accent)" : "var(--border)",
                background: isSelected ? "rgba(197, 107, 255, 0.08)" : "transparent",
                color: "var(--text)",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
