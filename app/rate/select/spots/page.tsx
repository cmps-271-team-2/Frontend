"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCatalogItems, SpotKind } from "@/lib/rating-catalog";

type SpotItem = {
  id: string;
  name: string;
  subtitle?: string;
};

export default function SelectSpotPage() {
  const router = useRouter();
  const [kind, setKind] = useState<SpotKind>("study-spot");
  const [items, setItems] = useState<SpotItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCatalogItems("spots", kind);
        if (mounted) {
          setItems(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load spots.");
          setItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      mounted = false;
    };
  }, [kind]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const text = `${item.name} ${item.subtitle || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [items, search]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6" style={{ color: "var(--text)" }}>
      <h1 className="text-2xl font-black">Choose a study/food spot</h1>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
        Select from the available list, then continue to create your rating.
      </p>

      <div className="mt-4 flex gap-2">
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
              borderColor: kind === option.value ? "#3b82f6" : "var(--border)",
              background: kind === option.value ? "rgba(59, 130, 246, 0.18)" : "transparent",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search list..."
        className="mt-4 w-full rounded-lg border px-3 py-2"
        style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
      />

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
          </button>
        ))}
      </div>
    </main>
  );
}
