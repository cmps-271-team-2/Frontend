import { apiFetch } from "@/lib/api";
import type { Analytics, PagedResponse, Post, PostStatus, Profile, ProfileRole, ProfileStatus } from "./types";

export async function fetchAdminProfiles(params: {
  search?: string;
  role?: ProfileRole | "all";
  status?: ProfileStatus | "all";
  offset?: number;
  limit?: number;
}): Promise<PagedResponse<Profile>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/mock/profiles?${qs.toString()}`;
  return apiFetch<PagedResponse<Profile>>(path);
}

export async function fetchAdminPosts(params: {
  search?: string;
  status?: PostStatus | "all";
  tag?: string | "all";
  offset?: number;
  limit?: number;
}): Promise<PagedResponse<Post>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.tag) qs.set("tag", params.tag);
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const path = `/admin/mock/posts?${qs.toString()}`;
  return apiFetch<PagedResponse<Post>>(path);
}

export async function fetchAdminAnalytics(): Promise<Analytics> {
  return apiFetch<Analytics>("/admin/mock/analytics");
}
