export type ProfileRole = "student" | "staff" | "faculty" | "admin";
export type ProfileStatus = "active" | "suspended" | "pending";
export type PostStatus = "published" | "draft" | "flagged";

export type Profile = {
  id: string;
  displayName: string;
  email: string;
  role: ProfileRole;
  status: ProfileStatus;
  createdAt: string;
  lastActiveAt: string;
};

export type Post = {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  status: PostStatus;
  tags: string[];
  createdAt: string;
  likeCount: number;
  reportCount: number;
};

export type PagedResponse<T> = {
  total: number;
  items: T[];
  offset: number;
  limit: number;
  nextOffset: number | null;
};

export type Analytics = {
  generatedAt: string;
  totals: Record<string, number>;
  series7d: Array<{ day: string; signups: number; posts: number; reports: number }>;
};
