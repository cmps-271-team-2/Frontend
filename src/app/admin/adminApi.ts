import { apiFetch } from "@/lib/api";
import {
  analyticsDtoSchema,
  pagedResponseDtoSchema,
  adminPostDtoSchema,
  adminProfileDtoSchema,
  adminJobDtoSchema,
  type AnalyticsDTO,
  type AdminJobDTO,
  type ListPostsQueryDTO,
  type ListProfilesQueryDTO,
  type ListJobsQueryDTO,
  type PagedResponseDTO,
  type AdminPostDTO,
  type AdminProfileDTO,
} from "./dtos";

export async function fetchAdminProfiles(params: ListProfilesQueryDTO): Promise<PagedResponseDTO<AdminProfileDTO>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.location) qs.set("location", params.location);
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/profiles?${qs.toString()}`;
  const raw = await apiFetch<unknown>(path);
  return pagedResponseDtoSchema(adminProfileDtoSchema).parse(raw);
}

export async function fetchAdminPosts(params: ListPostsQueryDTO): Promise<PagedResponseDTO<AdminPostDTO>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.targetType) qs.set("targetType", params.targetType);
  if (typeof params.minRating === "number") qs.set("minRating", String(params.minRating));
  if (typeof params.maxRating === "number") qs.set("maxRating", String(params.maxRating));
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/posts?${qs.toString()}`;
  const raw = await apiFetch<unknown>(path);
  return pagedResponseDtoSchema(adminPostDtoSchema).parse(raw);
}

export async function fetchAdminAnalytics(): Promise<AnalyticsDTO> {
  const raw = await apiFetch<unknown>("/admin/analytics");
  return analyticsDtoSchema.parse(raw);
}

export async function fetchAdminJobs(params: ListJobsQueryDTO): Promise<PagedResponseDTO<AdminJobDTO>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.kind) qs.set("kind", params.kind);
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/jobs?${qs.toString()}`;
  const raw = await apiFetch<unknown>(path);
  return pagedResponseDtoSchema(adminJobDtoSchema).parse(raw);
}
