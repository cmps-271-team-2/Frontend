import { apiFetch } from "@/lib/api";

export type ReactionType = "like" | "dislike";

export type ReactionResponse = {
  ok: boolean;
  postId: string;
  currentUserReaction: "liked" | "disliked" | null;
  likes: number;
  dislikes: number;
};

export type FavoriteTargetType = "professor" | "course" | "spot";

export type FavoriteItem = {
  id: string;
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
  targetName: string;
  createdAt?: string;
};

export type FavoritesResponse = {
  items: FavoriteItem[];
  professors: FavoriteItem[];
  courses: FavoriteItem[];
  spots: FavoriteItem[];
};

export type PostUpdatePayload = {
  text?: string;
  rating?: number;
  title?: string;
  semesterTaken?: string;
  attendanceMandatory?: boolean;
  wouldRecommend?: boolean;
  location?: string;
  priceRange?: string;
  bestTimeToGo?: string;
  courseCode?: string;
  courseName?: string;
  professorName?: string;
  spotName?: string;
  department?: string;
  attributes?: string[];
};

export async function setPostReaction(postId: string, type: ReactionType, authToken: string): Promise<ReactionResponse> {
  return apiFetch<ReactionResponse>(`/posts/${encodeURIComponent(postId)}/reaction`, {
    method: "POST",
    body: JSON.stringify({ type }),
    authToken,
  });
}

export async function clearPostReaction(postId: string, authToken: string): Promise<ReactionResponse> {
  return apiFetch<ReactionResponse>(`/posts/${encodeURIComponent(postId)}/reaction`, {
    method: "DELETE",
    authToken,
  });
}

export async function updatePost(postId: string, payload: PostUpdatePayload, authToken: string): Promise<{ ok: boolean; post: Record<string, unknown> }> {
  return apiFetch<{ ok: boolean; post: Record<string, unknown> }>(`/posts/${encodeURIComponent(postId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authToken,
  });
}

export async function deletePost(postId: string, authToken: string): Promise<{ ok: boolean; id: string }> {
  return apiFetch<{ ok: boolean; id: string }>(`/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    authToken,
  });
}

export async function reportSpot(spotId: string, text: string, authToken: string): Promise<{ ok: boolean; id: string; message: string }> {
  return apiFetch<{ ok: boolean; id: string; message: string }>(`/spots/${encodeURIComponent(spotId)}/report`, {
    method: "POST",
    body: JSON.stringify({ text }),
    authToken,
  });
}

export async function reportPost(postId: string, text: string, authToken: string): Promise<{ ok: boolean; id: string; message: string }> {
  return apiFetch<{ ok: boolean; id: string; message: string }>(`/posts/${encodeURIComponent(postId)}/report`, {
    method: "POST",
    body: JSON.stringify({ text }),
    authToken,
  });
}

export async function addFavorite(targetType: FavoriteTargetType, targetId: string, targetName: string, authToken: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/favorites", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId, targetName }),
    authToken,
  });
}

export async function removeFavorite(targetType: FavoriteTargetType, targetId: string, authToken: string): Promise<{ ok: boolean }> {
  const params = new URLSearchParams({ targetType, targetId });
  return apiFetch<{ ok: boolean }>(`/favorites?${params.toString()}`, {
    method: "DELETE",
    authToken,
  });
}

export async function getMyFavorites(authToken: string): Promise<FavoritesResponse> {
  return apiFetch<FavoritesResponse>("/favorites/me", {
    method: "GET",
    authToken,
  });
}

export async function getMyPosts(authToken: string): Promise<Array<Record<string, unknown>>> {
  return apiFetch<Array<Record<string, unknown>>>("/posts/mine", {
    method: "GET",
    authToken,
  });
}
