import { z } from "zod";

export const profileRoleDtoSchema = z.enum(["student", "staff", "faculty", "admin"]);
export type ProfileRoleDTO = z.infer<typeof profileRoleDtoSchema>;

export const profileStatusDtoSchema = z.enum(["active", "suspended", "pending"]);
export type ProfileStatusDTO = z.infer<typeof profileStatusDtoSchema>;

export const postStatusDtoSchema = z.enum(["published", "draft", "flagged"]);
export type PostStatusDTO = z.infer<typeof postStatusDtoSchema>;

export const profileDtoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  role: profileRoleDtoSchema,
  status: profileStatusDtoSchema,
  createdAt: z.string(),
  lastActiveAt: z.string(),
});
export type ProfileDTO = z.infer<typeof profileDtoSchema>;

export const postDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  status: postStatusDtoSchema,
  tags: z.array(z.string()),
  createdAt: z.string(),
  likeCount: z.number(),
  reportCount: z.number(),
});
export type PostDTO = z.infer<typeof postDtoSchema>;

export const seriesPointDtoSchema = z.object({
  day: z.string(),
  signups: z.number(),
  posts: z.number(),
  reports: z.number(),
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
  role?: ProfileRoleDTO | "all";
  status?: ProfileStatusDTO | "all";
  offset?: number;
  limit?: number;
};

export type ListPostsQueryDTO = {
  search?: string;
  status?: PostStatusDTO | "all";
  tag?: string | "all";
  offset?: number;
  limit?: number;
};
