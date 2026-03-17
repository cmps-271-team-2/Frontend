export type SpotKind = "study-spot" | "food-spot";
export type AcademicKind = "course" | "professor";
export type CatalogKind = SpotKind | AcademicKind;

export type StudySpotType = "indoor" | "outdoor" | "mixed";
export type StudyNoiseLevel = "quiet" | "moderate" | "busy";
export type FoodVenueCategory = "restaurant" | "food" | "fast-food" | "bakery";
export type PriceLevel = "$" | "$$" | "$$$";

export type CatalogGroup = "spots" | "academics";

type CatalogItemBase = {
  id: string;
  name: string;
  subtitle?: string;
  kind: CatalogKind;
};

export type StudySpotCatalogItem = CatalogItemBase & {
  kind: "study-spot";
  area: string;
  spotType: StudySpotType;
  noiseLevel: StudyNoiseLevel;
  hasWifi: boolean;
  hasOutlets: boolean;
  openNow: boolean;
  rating: number;
};

export type FoodSpotCatalogItem = CatalogItemBase & {
  kind: "food-spot";
  area: string;
  venueCategory: FoodVenueCategory;
  priceLevel: PriceLevel;
  openNow: boolean;
  rating: number;
};

export type CourseCatalogItem = CatalogItemBase & {
  kind: "course";
  courseCode?: string;
  department?: string;
};

export type ProfessorCatalogItem = CatalogItemBase & {
  kind: "professor";
  department?: string;
};

export type CatalogItem =
  | StudySpotCatalogItem
  | FoodSpotCatalogItem
  | CourseCatalogItem
  | ProfessorCatalogItem;

export type StudySpotFilters = {
  search: string;
  types: StudySpotType[];
  noiseLevels: StudyNoiseLevel[];
  requireWifi: boolean;
  requireOutlets: boolean;
  openNowOnly: boolean;
  areas: string[];
  minRating: number;
};

export type FoodSpotFilters = {
  search: string;
  categories: FoodVenueCategory[];
};

type CatalogResponse = {
  ok: boolean;
  items: CatalogItem[];
  error?: string;
};

function normalizedText(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

function includesQuery(parts: Array<string | undefined>, query: string): boolean {
  const normalizedQuery = normalizedText(query);
  if (!normalizedQuery) {
    return true;
  }

  return parts.some((part) => normalizedText(part).includes(normalizedQuery));
}

export async function fetchCatalogItems(
  group: CatalogGroup,
  kind: SpotKind | AcademicKind | "all"
): Promise<CatalogItem[]> {
  const response = await fetch(`/api/rating-catalog?group=${group}&kind=${kind}`);
  const data = (await response.json().catch(() => null)) as CatalogResponse | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to load list items.");
  }

  return data.items;
}

export function filterStudySpotItems(
  items: StudySpotCatalogItem[],
  filters: StudySpotFilters
): StudySpotCatalogItem[] {
  return items.filter((item) => {
    if (!includesQuery([item.name, item.subtitle, item.area], filters.search)) {
      return false;
    }

    if (filters.types.length > 0 && !filters.types.includes(item.spotType)) {
      return false;
    }

    if (filters.noiseLevels.length > 0 && !filters.noiseLevels.includes(item.noiseLevel)) {
      return false;
    }

    if (filters.areas.length > 0 && !filters.areas.includes(item.area)) {
      return false;
    }

    if (filters.requireWifi && !item.hasWifi) {
      return false;
    }

    if (filters.requireOutlets && !item.hasOutlets) {
      return false;
    }

    if (filters.openNowOnly && !item.openNow) {
      return false;
    }

    if (item.rating < filters.minRating) {
      return false;
    }

    return true;
  });
}

export function filterFoodSpotItems(
  items: FoodSpotCatalogItem[],
  filters: FoodSpotFilters
): FoodSpotCatalogItem[] {
  return items.filter((item) => {
    if (!includesQuery([item.name, item.subtitle, item.area], filters.search)) {
      return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(item.venueCategory)) {
      return false;
    }

    return true;
  });
}

export function filterAcademicItems(
  items: CatalogItem[],
  kind: AcademicKind | "all",
  search: string
): CatalogItem[] {
  const scopedItems = kind === "all" ? items : items.filter((item) => item.kind === kind);

  return scopedItems.filter((item) => {
    if (item.kind !== "course" && item.kind !== "professor") {
      return false;
    }

    return includesQuery(
      [
        item.name,
        item.subtitle,
        item.kind === "course" ? item.courseCode : undefined,
        item.department,
      ],
      search
    );
  });
}
