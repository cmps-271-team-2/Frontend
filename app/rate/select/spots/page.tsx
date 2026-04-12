"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MultiSelectChips from "@/app/rate/components/multi-select-chips";
import {
  fetchCatalogItems,
  filterFoodSpotItems,
  filterStudySpotItems,
  FoodSpotCatalogItem,
  FoodSpotFilters,
  FoodVenueCategory,
  PriceLevel,
  SpotKind,
  StudyNoiseLevel,
  StudySpotCatalogItem,
  StudySpotFilters,
  StudySpotType,
} from "@/lib/rating-catalog";

const STUDY_SPOT_TYPES: Array<{ label: string; value: StudySpotType }> = [
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Mixed", value: "mixed" },
];

const STUDY_NOISE_LEVELS: Array<{ label: string; value: StudyNoiseLevel }> = [
  { label: "Quiet", value: "quiet" },
  { label: "Moderate", value: "moderate" },
  { label: "Busy", value: "busy" },
];

const FOOD_CATEGORIES: Array<{ label: string; value: FoodVenueCategory }> = [
  { label: "Restaurant", value: "restaurant" },
  { label: "Food", value: "food" },
  { label: "Fast food", value: "fast-food" },
  { label: "Bakery", value: "bakery" },
];

const INITIAL_STUDY_FILTERS: StudySpotFilters = {
  search: "",
  types: [],
  noiseLevels: [],
  requireWifi: false,
  requireOutlets: false,
  openNowOnly: false,
  areas: [],
  minRating: 0,
};

const INITIAL_FOOD_FILTERS: FoodSpotFilters = {
  search: "",
  categories: [],
};

export default function SelectSpotPage() {
  const router = useRouter();
  const [kind, setKind] = useState<SpotKind>("study-spot");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addKind, setAddKind] = useState<SpotKind>("study-spot");

  const [newStudySpot, setNewStudySpot] = useState({
    name: "",
    area: "",
    spotType: "indoor" as StudySpotType,
    noiseLevel: "quiet" as StudyNoiseLevel,
    hasWifi: false,
    hasOutlets: false,
  });

  const [newFoodSpot, setNewFoodSpot] = useState({
    name: "",
    area: "",
    category: "restaurant" as FoodVenueCategory,
    priceLevel: "$" as PriceLevel,
  });

  const [studyItems, setStudyItems] = useState<StudySpotCatalogItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodSpotCatalogItem[]>([]);
  const [studyFilters, setStudyFilters] = useState<StudySpotFilters>(INITIAL_STUDY_FILTERS);
  const [foodFilters, setFoodFilters] = useState<FoodSpotFilters>(INITIAL_FOOD_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [studyData, foodData] = await Promise.all([
        fetchCatalogItems("spots", "study-spot"),
        fetchCatalogItems("spots", "food-spot"),
      ]);

      setStudyItems(
        studyData.filter((item): item is StudySpotCatalogItem => item.kind === "study-spot")
      );
      setFoodItems(
        foodData.filter((item): item is FoodSpotCatalogItem => item.kind === "food-spot")
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load spots.");
      setStudyItems([]);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFiltersOpen(false);
        setIsAddOpen(false);
      }
    }

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const areaOptions = useMemo(() => {
    return Array.from(new Set(studyItems.map((item) => item.area))).sort();
  }, [studyItems]);

  const filteredItems = useMemo(() => {
    if (kind === "study-spot") {
      return filterStudySpotItems(studyItems, studyFilters);
    }

    return filterFoodSpotItems(foodItems, foodFilters);
  }, [foodFilters, foodItems, kind, studyFilters, studyItems]);

  const activeSearchValue = kind === "study-spot" ? studyFilters.search : foodFilters.search;

  function updateActiveSearch(search: string) {
    if (kind === "study-spot") {
      updateStudyFilters({ search });
      return;
    }

    updateFoodFilters({ search });
  }

  function updateStudyFilters(partial: Partial<StudySpotFilters>) {
    setStudyFilters((prev) => ({ ...prev, ...partial }));
  }

  function updateFoodFilters(partial: Partial<FoodSpotFilters>) {
    setFoodFilters((prev) => ({ ...prev, ...partial }));
  }

  function clearCurrentFilters() {
    if (kind === "study-spot") {
      setStudyFilters(INITIAL_STUDY_FILTERS);
      return;
    }

    setFoodFilters(INITIAL_FOOD_FILTERS);
  }

  async function handleAddSpotSubmit() {
    setError(null);

    try {
      if (addKind === "study-spot") {
        if (!newStudySpot.name.trim() || !newStudySpot.area.trim()) {
          setError("Please enter both study spot name and area.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/spots`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newStudySpot.name.trim(),
            category: "study",
            location: newStudySpot.area.trim(),
            description: "",
            createdBy: "guest",
            spotType: newStudySpot.spotType,
            noiseLevel: newStudySpot.noiseLevel,
            hasWifi: newStudySpot.hasWifi,
            hasOutlets: newStudySpot.hasOutlets,
            openNow: true,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to add study spot.");
        }

        if (data.created === false) {
          setError("This study spot already exists.");
          return;
        }

        const newItem: StudySpotCatalogItem = {
          id: data.id,
          kind: "study-spot",
          name: newStudySpot.name.trim(),
          area: newStudySpot.area.trim(),
          spotType: newStudySpot.spotType,
          noiseLevel: newStudySpot.noiseLevel,
          hasWifi: newStudySpot.hasWifi,
          hasOutlets: newStudySpot.hasOutlets,
          openNow: true,
          rating: 0,
        };

        setStudyItems((prev) => [newItem, ...prev]);
        setNewStudySpot({
          name: "",
          area: "",
          spotType: "indoor",
          noiseLevel: "quiet",
          hasWifi: false,
          hasOutlets: false,
        });
      } else {
        if (!newFoodSpot.name.trim() || !newFoodSpot.area.trim()) {
          setError("Please enter both food spot name and area.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/spots`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newFoodSpot.name.trim(),
            category: "food",
            location: newFoodSpot.area.trim(),
            description: "",
            createdBy: "guest",
            venueCategory: newFoodSpot.category,
            priceLevel: newFoodSpot.priceLevel,
            openNow: true,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to add food spot.");
        }

        if (data.created === false) {
          setError("This food spot already exists.");
          return;
        }

        const newItem: FoodSpotCatalogItem = {
          id: data.id,
          kind: "food-spot",
          name: newFoodSpot.name.trim(),
          area: newFoodSpot.area.trim(),
          venueCategory: newFoodSpot.category,
          priceLevel: newFoodSpot.priceLevel,
          openNow: true,
          rating: 0,
        };

        setFoodItems((prev) => [newItem, ...prev]);
        setNewFoodSpot({
          name: "",
          area: "",
          category: "restaurant",
          priceLevel: "$",
        });
      }

      setIsAddOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add spot.");
    }
  }

  const hasStudyFilters =
    studyFilters.search.trim().length > 0 ||
    studyFilters.types.length > 0 ||
    studyFilters.noiseLevels.length > 0 ||
    studyFilters.requireWifi ||
    studyFilters.requireOutlets ||
    studyFilters.openNowOnly ||
    studyFilters.areas.length > 0 ||
    studyFilters.minRating > 0;

  const hasFoodFilters = foodFilters.search.trim().length > 0 || foodFilters.categories.length > 0;
  const hasActiveFilters = kind === "study-spot" ? hasStudyFilters : hasFoodFilters;
  const activeFilterCount =
    kind === "study-spot"
      ? studyFilters.types.length +
        studyFilters.noiseLevels.length +
        studyFilters.areas.length +
        (studyFilters.search.trim().length > 0 ? 1 : 0) +
        (studyFilters.requireWifi ? 1 : 0) +
        (studyFilters.requireOutlets ? 1 : 0) +
        (studyFilters.openNowOnly ? 1 : 0) +
        (studyFilters.minRating > 0 ? 1 : 0)
      : foodFilters.categories.length + (foodFilters.search.trim().length > 0 ? 1 : 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6" style={{ color: "var(--text)" }}>
      <h1 className="text-2xl font-black">Choose a study/food spot</h1>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
        Select from the available list, then continue to create your rating.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {[
            { label: "Study spots", value: "study-spot" as const },
            { label: "Food spots", value: "food-spot" as const },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setKind(option.value)}
              className="rounded-full border px-4 py-2 text-sm font-bold"
              style={{
                borderColor: kind === option.value ? "var(--accent-green)" : "var(--border)",
                background: kind === option.value ? "rgba(105,242,140,0.08)" : "transparent",
                color: kind === option.value ? "var(--accent-green)" : "var(--text)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          className="rounded-full border px-4 py-2 text-sm font-bold"
          style={{
            borderColor: hasActiveFilters ? "var(--accent)" : "var(--border)",
            background: hasActiveFilters ? "rgba(197,107,255,0.10)" : "transparent",
            color: hasActiveFilters ? "var(--accent)" : "var(--text)",
          }}
        >
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="mt-4 flex-1">
          <input
            value={activeSearchValue}
            onChange={(event) => updateActiveSearch(event.target.value)}
            placeholder={
              kind === "study-spot"
                ? "Search study spots by name or area..."
                : "Search food spots by name or area..."
            }
            className="w-full rounded-lg border px-3 py-2"
            style={{
              borderColor: "var(--border)",
              background: "transparent",
              color: "var(--text)",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="mt-4 rounded-full border px-4 py-2 text-sm font-bold"
          style={{
            borderColor: "var(--accent-green)",
            background: "rgba(105,242,140,0.08)",
            color: "var(--accent-green)",
          }}
        >
          + Add spot
        </button>
      </div>

      {isFiltersOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsFiltersOpen(false)}
        >
          <section
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border p-3 sm:p-4"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide">
                {kind === "study-spot" ? "Study filters" : "Food filters"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCurrentFilters}
                  disabled={!hasActiveFilters}
                  className="rounded-full border px-3 py-1 text-xs font-bold disabled:opacity-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(false)}
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{ borderColor: "var(--border)" }}
                >
                  Done
                </button>
              </div>
            </div>

            {kind === "study-spot" ? (
              <div className="mt-3 space-y-3">
                <input
                  value={studyFilters.search}
                  onChange={(event) => updateStudyFilters({ search: event.target.value })}
                  placeholder="Search study spots by name or area..."
                  className="w-full rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
                />

                <MultiSelectChips
                  label="Spot type"
                  options={STUDY_SPOT_TYPES.map((item) => item.label)}
                  selected={studyFilters.types.map((type) => STUDY_SPOT_TYPES.find((item) => item.value === type)?.label || type)}
                  onChange={(labels) => {
                    const nextTypes = STUDY_SPOT_TYPES
                      .filter((item) => labels.includes(item.label))
                      .map((item) => item.value);
                    updateStudyFilters({ types: nextTypes });
                  }}
                />

                <MultiSelectChips
                  label="Noise level"
                  options={STUDY_NOISE_LEVELS.map((item) => item.label)}
                  selected={studyFilters.noiseLevels.map(
                    (noise) => STUDY_NOISE_LEVELS.find((item) => item.value === noise)?.label || noise
                  )}
                  onChange={(labels) => {
                    const nextLevels = STUDY_NOISE_LEVELS
                      .filter((item) => labels.includes(item.label))
                      .map((item) => item.value);
                    updateStudyFilters({ noiseLevels: nextLevels });
                  }}
                />

                <MultiSelectChips
                  label="Area"
                  options={areaOptions}
                  selected={studyFilters.areas}
                  onChange={(areas) => updateStudyFilters({ areas })}
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={studyFilters.requireWifi}
                      onChange={(event) => updateStudyFilters({ requireWifi: event.target.checked })}
                    />
                    Wifi available
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={studyFilters.requireOutlets}
                      onChange={(event) => updateStudyFilters({ requireOutlets: event.target.checked })}
                    />
                    Charging outlets
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={studyFilters.openNowOnly}
                      onChange={(event) => updateStudyFilters({ openNowOnly: event.target.checked })}
                    />
                    Open now
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    Minimum rating: {studyFilters.minRating.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={studyFilters.minRating}
                    onChange={(event) => updateStudyFilters({ minRating: Number(event.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <input
                  value={foodFilters.search}
                  onChange={(event) => updateFoodFilters({ search: event.target.value })}
                  placeholder="Search food spots by name or area..."
                  className="w-full rounded-lg border px-3 py-2"
                  style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
                />

                <MultiSelectChips
                  label="Category"
                  options={FOOD_CATEGORIES.map((item) => item.label)}
                  selected={foodFilters.categories.map(
                    (category) => FOOD_CATEGORIES.find((item) => item.value === category)?.label || category
                  )}
                  onChange={(labels) => {
                    const nextCategories = FOOD_CATEGORIES
                      .filter((item) => labels.includes(item.label))
                      .map((item) => item.value);
                    updateFoodFilters({ categories: nextCategories });
                  }}
                />
              </div>
            )}
          </section>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm">Loading...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No items found.
          </p>
        ) : null}

        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              router.push(
                `/rate/create?flow=study-food&category=${kind}&id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`
              )
            }
            className="w-full rounded-xl border px-4 py-3 text-left"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div className="font-bold">{item.name}</div>
            {item.subtitle ? (
              <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                {item.subtitle}
              </div>
            ) : null}
            {item.kind === "study-spot" ? (
              <div className="mt-1 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                {item.area} | {item.spotType} | {item.noiseLevel} | {item.hasWifi ? "Wifi" : "No wifi"} | {item.hasOutlets ? "Outlets" : "No outlets"} | {item.openNow ? "Open now" : "Closed"} | {item.rating.toFixed(1)}
              </div>
            ) : null}
            {item.kind === "food-spot" ? (
              <div className="mt-1 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                {item.area} | {item.venueCategory} | {item.priceLevel} | {item.openNow ? "Open now" : "Closed"} | {item.rating.toFixed(1)}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {isAddOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsAddOpen(false)}
        >
          <section
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase">Add new spot</h2>

              <button
                className="rounded-full border px-3 py-1 text-xs font-bold"
                onClick={() => setIsAddOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              {["study-spot", "food-spot"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setAddKind(k as SpotKind)}
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{
                    borderColor: addKind === k ? "var(--accent-green)" : "var(--border)",
                    color: addKind === k ? "var(--accent-green)" : "var(--text)",
                  }}
                >
                  {k === "study-spot" ? "Study spot" : "Food spot"}
                </button>
              ))}
            </div>

            {addKind === "study-spot" ? (
              <div className="mt-4 space-y-3">
                <input
                  placeholder="Name"
                  value={newStudySpot.name}
                  onChange={(e) =>
                    setNewStudySpot({ ...newStudySpot, name: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <input
                  placeholder="Area"
                  value={newStudySpot.area}
                  onChange={(e) =>
                    setNewStudySpot({ ...newStudySpot, area: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <div className="flex gap-2">
                  <select
                    value={newStudySpot.spotType}
                    onChange={(e) =>
                      setNewStudySpot({
                        ...newStudySpot,
                        spotType: e.target.value as StudySpotType,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="mixed">Mixed</option>
                  </select>

                  <select
                    value={newStudySpot.noiseLevel}
                    onChange={(e) =>
                      setNewStudySpot({
                        ...newStudySpot,
                        noiseLevel: e.target.value as StudyNoiseLevel,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="quiet">Quiet</option>
                    <option value="moderate">Moderate</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newStudySpot.hasWifi}
                    onChange={(e) =>
                      setNewStudySpot({ ...newStudySpot, hasWifi: e.target.checked })
                    }
                  />
                  Wifi
                </label>

                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newStudySpot.hasOutlets}
                    onChange={(e) =>
                      setNewStudySpot({
                        ...newStudySpot,
                        hasOutlets: e.target.checked,
                      })
                    }
                  />
                  Outlets
                </label>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  placeholder="Name"
                  value={newFoodSpot.name}
                  onChange={(e) =>
                    setNewFoodSpot({ ...newFoodSpot, name: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <input
                  placeholder="Area"
                  value={newFoodSpot.area}
                  onChange={(e) =>
                    setNewFoodSpot({ ...newFoodSpot, area: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <select
                  value={newFoodSpot.category}
                  onChange={(e) =>
                    setNewFoodSpot({
                      ...newFoodSpot,
                      category: e.target.value as FoodVenueCategory,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="food">Food</option>
                  <option value="fast-food">Fast food</option>
                  <option value="bakery">Bakery</option>
                </select>

                <select
                  value={newFoodSpot.priceLevel}
                  onChange={(e) =>
                    setNewFoodSpot({
                      ...newFoodSpot,
                      priceLevel: e.target.value as PriceLevel,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="$">$ (Cheap)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                </select>
              </div>
            )}

            <button
              type="button"
              className="mt-4 w-full rounded-lg border px-3 py-2 font-bold"
              onClick={handleAddSpotSubmit}
            >
              Submit
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}