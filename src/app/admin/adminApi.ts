import { apiFetch } from "@/lib/api";
import {
  analyticsDtoSchema,
  pagedResponseDtoSchema,
  postDtoSchema,
  profileDtoSchema,
  type AnalyticsDTO,
  type ListPostsQueryDTO,
  type ListProfilesQueryDTO,
  type PagedResponseDTO,
  type PostDTO,
  type ProfileDTO,
} from "./dtos";

export async function fetchAdminProfiles(params: ListProfilesQueryDTO): Promise<PagedResponseDTO<ProfileDTO>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/mock/profiles?${qs.toString()}`;
  const raw = await apiFetch<unknown>(path);
  return pagedResponseDtoSchema(profileDtoSchema).parse(raw);
}

export async function fetchAdminPosts(params: ListPostsQueryDTO): Promise<PagedResponseDTO<PostDTO>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.tag) qs.set("tag", params.tag);
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/mock/posts?${qs.toString()}`;
  const raw = await apiFetch<unknown>(path);
  return pagedResponseDtoSchema(postDtoSchema).parse(raw);
}

export async function fetchAdminAnalytics(): Promise<AnalyticsDTO> {
  const raw = await apiFetch<unknown>("/admin/mock/analytics");
  return analyticsDtoSchema.parse(raw);
}
