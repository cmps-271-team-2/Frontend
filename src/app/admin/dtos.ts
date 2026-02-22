import { z } from "zod";

export const adminProfileDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable().optional(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  createdAt: z.string(),
});
export type AdminProfileDTO = z.infer<typeof adminProfileDtoSchema>;

export const adminPostDtoSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  targetType: z.string(),
  text: z.string(),
  rating: z.number(),
  createdAt: z.string(),
});
export type AdminPostDTO = z.infer<typeof adminPostDtoSchema>;

export const seriesPointDtoSchema = z.object({
  day: z.string(),
  users: z.number(),
  posts: z.number(),
});
export type SeriesPointDTO = z.infer<typeof seriesPointDtoSchema>;

export const analyticsDtoSchema = z.object({
  generatedAt: z.string(),
  totals: z.record(z.string(), z.number()),
  series7d: z.array(seriesPointDtoSchema),
});
export type AnalyticsDTO = z.infer<typeof analyticsDtoSchema>;

export function pagedResponseDtoSchema<TItem extends z.ZodTypeAny>(itemSchema: TItem) {
  return z.object({
    total: z.number(),
    items: z.array(itemSchema),
    offset: z.number(),
    limit: z.number(),
    nextOffset: z.number().nullable(),
  });
}

export type PagedResponseDTO<TItem> = {
  total: number;
  items: TItem[];
  offset: number;
  limit: number;
  nextOffset: number | null;
};

export type ListProfilesQueryDTO = {
  search?: string;
  location?: string | "all";
  offset?: number;
  limit?: number;
};

export type ListPostsQueryDTO = {
  search?: string;
  targetType?: string | "all";
  minRating?: number;
  maxRating?: number;
  offset?: number;
  limit?: number;
};
