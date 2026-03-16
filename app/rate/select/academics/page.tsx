"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AcademicKind, fetchCatalogItems } from "@/lib/rating-catalog";

type AcademicItem = {
  id: string;
  name: string;
  subtitle?: string;
};

export default function SelectAcademicPage() {
  const router = useRouter();
  const [kind, setKind] = useState<AcademicKind | "all">("all");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      setLoading(true);
      setError(null);
      try {
        let data: AcademicItem[];

        if (kind === "course") {
          // Fetch live from Firestore "courses" collection
          const snapshot = await getDocs(collection(db, "courses"));
          data = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().code as string,
            subtitle: doc.data().title as string | undefined,
          }));
        } else {
          // Professors from existing API route
          data = await fetchCatalogItems("academics", kind);
        }

        if (mounted) {
          setItems(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load academics.");
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
  }, []);

  const filteredItems = useMemo(() => {
    return filterAcademicItems(items, kind, search);
  }, [items, kind, search]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6" style={{ color: "var(--text)" }}>
      <h1 className="text-2xl font-black">Choose course or professor</h1>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
        Select from the available list, then continue to create your rating.
      </p>

      <div className="mt-4 flex gap-2">
        {[
          { label: "All", value: "all" as const },
          { label: "Courses", value: "course" as const },
          { label: "Professors", value: "professor" as const },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setKind(option.value)}
            className="rounded-full border px-4 py-2 text-sm font-bold"
            style={{
              borderColor: kind === option.value ? "var(--accent-blue)" : "var(--border)",
              background: kind === option.value ? "rgba(91,200,255,0.08)" : "transparent",
              color: kind === option.value ? "var(--accent-blue)" : "var(--text)",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by professor, course name, or code..."
        className="mt-4 w-full rounded-lg border px-3 py-2"
        style={{ borderColor: "var(--border)", background: "transparent", color: "var(--text)" }}
      />

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm">Loading...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No results found for your current search.
          </p>
        ) : null}

        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              router.push(
                `/rate/create?flow=course-professor&type=${item.kind}&id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`
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
            {item.kind === "course" ? (
              <div className="mt-1 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                {item.courseCode || "No code"}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </main>
  );
}
