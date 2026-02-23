export type SpotKind = "study-spot" | "food-spot";
export type AcademicKind = "course" | "professor";

export type CatalogGroup = "spots" | "academics";

export type CatalogItem = {
  id: string;
  name: string;
  subtitle?: string;
};

type CatalogResponse = {
  ok: boolean;
  items: CatalogItem[];
  error?: string;
};

export async function fetchCatalogItems(
  group: CatalogGroup,
  kind: SpotKind | AcademicKind
): Promise<CatalogItem[]> {
  const response = await fetch(`/api/rating-catalog?group=${group}&kind=${kind}`);
  const data = (await response.json().catch(() => null)) as CatalogResponse | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to load list items.");
  }

  return data.items;
}
