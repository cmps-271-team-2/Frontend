"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  AnalyticsDTO,
  AdminModerationStatusDTO,
  AdminPostDTO,
  AdminUserDTO,
  AdminStatusDTO,
} from "../dtos";
import {
  deleteAdminPost,
  deleteAdminUser,
  setAdminPostModeration,
  setAdminUserBanned,
  fetchAdminAnalytics,
  fetchAdminPosts,
  fetchAdminUsers,
} from "../adminApi";
import TankPreview from "./TankPreview";

type TabId = "analytics" | "posts" | "users" | "spots";

type LoadState = {
  loading: boolean;
  error: string | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type PendingSpotDTO = {
  id: string;
  name: string;
  category: string;
  location: string;
  createdBy: string;
  status: string;
  createdAt: string;
  data: Record<string, unknown>;
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ label, tone }: { label: string; tone: "good" | "warn" | "bad" | "neutral" }) {
  const cls =
    tone === "good"
      ? "border-foreground/20 bg-foreground/10"
      : tone === "warn"
        ? "border-foreground/20 bg-foreground/5"
        : tone === "bad"
          ? "border-foreground/30 bg-foreground/15"
          : "border-foreground/15 bg-foreground/5";

  return (
    <span className={cx("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", cls)}>
      {label}
    </span>
  );
}

function moderationTone(status: AdminModerationStatusDTO): "good" | "warn" | "bad" | "neutral" {
  if (status === "approved") return "good";
  if (status === "rejected") return "bad";
  if (status === "review") return "warn";
  return "neutral";
}

function formatSpotCreatedAt(value: string) {
  try {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  } catch {
    return value || "—";
  }
}

function toDisplayString(value: unknown, fallback = "—"): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("analytics");

  const [posts, setPosts] = useState<AdminPostDTO[]>([]);
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);
  const [spots, setSpots] = useState<PendingSpotDTO[]>([]);

  const [postsState, setPostsState] = useState<LoadState>({ loading: false, error: null });
  const [usersState, setUsersState] = useState<LoadState>({ loading: false, error: null });
  const [analyticsState, setAnalyticsState] = useState<LoadState>({ loading: false, error: null });
  const [spotsState, setSpotsState] = useState<LoadState>({ loading: false, error: null });

  const [postSearch, setPostSearch] = useState("");
  const [postTargetType, setPostTargetType] = useState<string | "all">("all");
  const [postMinRating, setPostMinRating] = useState<number | "all">("all");
  const [postMinReports, setPostMinReports] = useState<number | "all">("all");

  const [userSearch, setUserSearch] = useState("");
  const [userVerified, setUserVerified] = useState<boolean | "all">("all");
  const [userStatus, setUserStatus] = useState<AdminStatusDTO | "all">("all");

  // Delete animation state
  const [screenFlash, setScreenFlash] = useState(false);
  const [tankFlashKey, setTankFlashKey] = useState(0);
  const [shatteringUserId, setShatteringUserId] = useState<string | null>(null);
  const [spotBusyId, setSpotBusyId] = useState<string | null>(null);
  const [spotFeedback, setSpotFeedback] = useState<FeedbackState>(null);

  const debouncedPostSearch = useDebouncedValue(postSearch, 250);
  const debouncedUserSearch = useDebouncedValue(userSearch, 250);

  useEffect(() => {
    if (!spotFeedback) {
      return;
    }

    const timer = window.setTimeout(() => setSpotFeedback(null), 2500);
    return () => window.clearTimeout(timer);
  }, [spotFeedback]);

  async function loadAnalytics() {
    setAnalyticsState({ loading: true, error: null });
    try {
      const data = await fetchAdminAnalytics();
      setAnalytics(data);
      setAnalyticsState({ loading: false, error: null });
    } catch (e: any) {
      setAnalyticsState({ loading: false, error: e?.message ?? "Failed to load analytics" });
    }
  }

  async function loadPosts() {
    setPostsState({ loading: true, error: null });
    try {
      const data = await fetchAdminPosts({
        search: debouncedPostSearch || undefined,
        targetType: postTargetType,
        minRating: postMinRating === "all" ? undefined : postMinRating,
        minReports: postMinReports === "all" ? undefined : postMinReports,
        limit: 200,
        offset: 0,
      });
      setPosts(data.items);
      setPostsState({ loading: false, error: null });
    } catch (e: any) {
      setPostsState({ loading: false, error: e?.message ?? "Failed to load posts" });
    }
  }

  async function loadUsers() {
    setUsersState({ loading: true, error: null });
    try {
      const data = await fetchAdminUsers({
        search: debouncedUserSearch || undefined,
        verified: userVerified,
        status: userStatus,
        limit: 200,
        offset: 0,
      });
      setUsers(data.items);
      setUsersState({ loading: false, error: null });
    } catch (e: any) {
      setUsersState({ loading: false, error: e?.message ?? "Failed to load users" });
    }
  }

  async function loadSpots() {
    setSpotsState({ loading: true, error: null });
    try {
      const snapshot = await getDocs(collection(db, "pending_spots"));
      const items = snapshot.docs.map((document) => {
        const data = document.data() as Record<string, unknown>;

        const createdAt =
          typeof data.createdAt === "string"
            ? data.createdAt
            : typeof data.createdAt === "number"
              ? new Date(data.createdAt).toISOString()
              : data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate().toISOString()
                : "";

        return {
          id: document.id,
          name: toDisplayString(data.name, document.id),
          category: toDisplayString(data.category),
          location: toDisplayString(data.location),
          createdBy: toDisplayString(data.createdBy),
          status: toDisplayString(data.status, "pending"),
          createdAt,
          data,
        };
      });

      setSpots(items);
      setSpotsState({ loading: false, error: null });
    } catch (e: any) {
      setSpotsState({ loading: false, error: e?.message ?? "Failed to load spots" });
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm(`Delete post ${postId}? This cannot be undone.`)) return;
    try {
      await deleteAdminPost(postId);
      await loadPosts();
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete post");
    }
  }

  async function handleSetPostModeration(postId: string, accepted: boolean) {
    try {
      await setAdminPostModeration(postId, accepted);
      await loadPosts();
    } catch (e: any) {
      alert(e?.message ?? "Failed to update post moderation");
    }
  }

  async function handleDeleteUser(userId: string) {
    // Trigger all three visual effects simultaneously
    setScreenFlash(true);
    setTankFlashKey((k) => k + 1);
    setShatteringUserId(userId);
    // Wait for shatter animation to finish before deleting
    await new Promise((r) => setTimeout(r, 680));
    setScreenFlash(false);
    try {
      await deleteAdminUser(userId);
      setShatteringUserId(null);
      await loadUsers();
    } catch (e: any) {
      setShatteringUserId(null);
      alert(e?.message ?? "Failed to delete user");
    }
  }

  async function handleToggleUserBanned(userId: string, banned: boolean) {
    try {
      await setAdminUserBanned(userId, banned);
      await loadUsers();
    } catch (e: any) {
      alert(e?.message ?? "Failed to update user status");
    }
  }

  async function handleApproveSpot(spot: PendingSpotDTO) {
    setSpotBusyId(spot.id);
    setSpotFeedback(null);
    try {
      const batch = writeBatch(db);
      const spotRef = doc(db, "spots", spot.id);
      batch.set(spotRef, {
        ...spot.data,
        name: spot.name,
        category: spot.category,
        location: spot.location,
        createdBy: spot.createdBy,
        status: "approved",
        approvedAt: serverTimestamp(),
        rating: typeof spot.data.rating === "number" ? spot.data.rating : 0,
        reviewCount: typeof spot.data.reviewCount === "number" ? spot.data.reviewCount : 0,
      });
      batch.delete(doc(db, "pending_spots", spot.id));
      await batch.commit();
      setSpots((current) => current.filter((item) => item.id !== spot.id));
      setSpotFeedback({ type: "success", message: `Approved ${spot.name}.` });
    } catch (e: any) {
      setSpotFeedback({ type: "error", message: e?.message ?? "Failed to approve spot" });
    } finally {
      setSpotBusyId(null);
    }
  }

  async function handleRejectSpot(spotId: string) {
    setSpotBusyId(spotId);
    setSpotFeedback(null);
    try {
      await deleteDoc(doc(db, "pending_spots", spotId));
      setSpots((current) => current.filter((item) => item.id !== spotId));
      setSpotFeedback({ type: "success", message: "Rejected spot submission." });
    } catch (e: any) {
      setSpotFeedback({ type: "error", message: e?.message ?? "Failed to reject spot" });
    } finally {
      setSpotBusyId(null);
    }
  }

  useEffect(() => {
    // Load each tab lazily.
    if (tab === "analytics" && !analytics && !analyticsState.loading) loadAnalytics();
    if (tab === "posts" && posts.length === 0 && !postsState.loading) loadPosts();
    if (tab === "users" && users.length === 0 && !usersState.loading) loadUsers();
    if (tab === "spots" && spots.length === 0 && !spotsState.loading) loadSpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "posts") loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPostSearch, postTargetType, postMinRating, postMinReports]);

  useEffect(() => {
    if (tab === "users") loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUserSearch, userVerified, userStatus]);

  const postTargetTypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) {
      const tt = (p.targetType ?? "").trim();
      if (tt) set.add(tt);
    }
    return ["all", ...Array.from(set).sort()];
  }, [posts]);

  const totals = analytics?.totals;
  const series = analytics?.series7d ?? [];

  const maxPosts = useMemo(() => Math.max(1, ...series.map((d) => d.posts)), [series]);

  return (
    <>
    {screenFlash && (
      <div
        className="screen-flash"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(255,255,255,0.22)",
          pointerEvents: "none",
        }}
      />
    )}
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
              <span className="rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-xs">live</span>
              <TankPreview className="ml-1 shrink-0 pointer-events-none" flashKey={tankFlashKey} />
            </div>
            <p className="text-sm opacity-80">FreedomBot 🦅</p>
          </div>

          <nav className="inline-flex w-full gap-1 border-b border-foreground/10 sm:w-auto">
            {(
              [
                { id: "analytics" as const, label: "Analytics" },
                { id: "posts" as const, label: "Posts" },
                { id: "users" as const, label: "Users" },
                { id: "spots" as const, label: "Spots" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "px-3 py-2 text-sm transition border-b-2 -mb-px",
                  tab === t.id ? "border-foreground font-medium" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="mt-6 rounded-2xl border border-foreground/10 bg-background p-5">
          {tab === "analytics" && (
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">Analytics</h2>
                  <p className="text-sm opacity-75">
                    {analytics ? `Generated: ${formatDate(analytics.generatedAt)}` : ""}
                  </p>
                </div>
                <button
                  onClick={loadAnalytics}
                  className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10"
                >
                  Refresh
                </button>
              </div>

              {analyticsState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">
                  {analyticsState.error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="text-xs opacity-70">Users</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.usersTotal ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Signups (7d): {series.reduce((a, b) => a + b.users, 0)}</div>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="text-xs opacity-70">Posts</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.postsTotal ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Avg/day: {series.length ? Math.round(series.reduce((a, b) => a + b.posts, 0) / series.length) : "—"}</div>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="text-xs opacity-70">Velocity</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {series.length ? Math.round(series.reduce((a, b) => a + b.users + b.posts, 0) / series.length) : "—"}
                  </div>
                  <div className="mt-2 text-xs opacity-75">Avg users+posts/day</div>
                </div>
              </div>

              <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Last 7 days</div>
                    <div className="text-xs opacity-70">Posts volume (mock)</div>
                  </div>
                </div>

                <div className="mt-4 flex h-24 items-end gap-2">
                  {series.map((d) => {
                    const h = Math.round((d.posts / maxPosts) * 100);
                    return (
                      <div key={d.day} className="flex w-full flex-col items-center gap-2">
                        <div className="relative h-20 w-full overflow-hidden rounded-lg bg-background">
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-lg bg-foreground/20"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                        <div className="text-[10px] opacity-70">{d.day.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2 text-xs opacity-80 sm:grid-cols-3">
                  <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                    Avg users/day: {series.length ? Math.round(series.reduce((a, b) => a + b.users, 0) / series.length) : "—"}
                  </div>
                  <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                    Avg posts/day: {series.length ? Math.round(series.reduce((a, b) => a + b.posts, 0) / series.length) : "—"}
                  </div>
                  <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                    Last day users: {series.length ? series[series.length - 1].users : "—"}
                  </div>
                </div>
              </div>
            </section>
          )}



          {tab === "posts" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Posts</h2>
                  <p className="text-sm opacity-75">Search posts, inspect moderation, and force approve or reject.</p>
                </div>
                <button
                  onClick={loadPosts}
                  className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-3 sm:grid-cols-3">
                <input
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Search text, target id, type…"
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                />
                <select
                  value={postTargetType}
                  onChange={(e) => setPostTargetType(e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  {postTargetTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "All target types" : t}
                    </option>
                  ))}
                </select>
                <select
                  value={postMinRating}
                  onChange={(e) => setPostMinRating(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Any rating</option>
                  <option value="0">≥ 0</option>
                  <option value="1">≥ 1</option>
                  <option value="2">≥ 2</option>
                  <option value="3">≥ 3</option>
                  <option value="4">≥ 4</option>
                  <option value="5">= 5</option>
                </select>
                <select
                  value={postMinReports}
                  onChange={(e) => setPostMinReports(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Any reports</option>
                  <option value="1">≥ 1</option>
                  <option value="2">≥ 2</option>
                  <option value="5">≥ 5</option>
                  <option value="10">≥ 10</option>
                </select>
              </div>

              {postsState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{postsState.error}</div>
              )}

              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full min-w-245 border-collapse text-left text-sm">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Text</th>
                      <th className="px-4 py-3 font-medium">Target</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Rating</th>
                      <th className="px-4 py-3 font-medium">Reports</th>
                      <th className="px-4 py-3 font-medium">Moderation</th>
                      <th className="px-4 py-3 font-medium">Indexed</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.text || "(no text)"}</div>
                          <div className="text-xs opacity-70">{p.id}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{p.targetId || "—"}</td>
                        <td className="px-4 py-3">
                          <StatusPill label={p.targetType || "—"} tone="neutral" />
                        </td>
                        <td className="px-4 py-3 tabular-nums">{p.rating}</td>
                        <td className="px-4 py-3 tabular-nums">{p.reports}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <StatusPill label={p.moderationStatus} tone={moderationTone(p.moderationStatus)} />
                            <div className="text-xs opacity-70">
                              {p.forcedByAdmin ? "Forced by admin" : p.moderationExplanation || "No explanation"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={p.indexed ? "indexed" : "not indexed"} tone={p.indexed ? "good" : "warn"} />
                        </td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSetPostModeration(p.id, true)}
                              className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                            >
                              Force accept
                            </button>
                            <button
                              onClick={() => handleSetPostModeration(p.id, false)}
                              className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                            >
                              Force reject
                            </button>
                            <button
                              onClick={() => handleDeletePost(p.id)}
                              className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!postsState.loading && posts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-sm opacity-70">No posts match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs opacity-70">Showing {posts.length} posts.{postsState.loading ? " Loading…" : ""}</div>
            </section>
          )}

          {tab === "users" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Users</h2>
                  <p className="text-sm opacity-75">Firestore users + delete (Auth + user doc).</p>
                </div>
                <button
                  onClick={loadUsers}
                  className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-3 sm:grid-cols-3">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search email or uid…"
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                />
                <select
                  value={String(userVerified)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUserVerified(v === "all" ? "all" : v === "true");
                  }}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Not verified</option>
                </select>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              {usersState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{usersState.error}</div>
              )}

              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full min-w-245 border-collapse text-left text-sm">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">UID</th>
                      <th className="px-4 py-3 font-medium">Verified</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className={cx(
                          "border-t border-foreground/10 hover:bg-foreground/5",
                          shatteringUserId === u.id ? "row-shattering" : ""
                        )}
                      >
                        <td className="px-4 py-3 tabular-nums">{u.email || "—"}</td>
                        <td className="px-4 py-3 text-xs opacity-80 tabular-nums">{u.id}</td>
                        <td className="px-4 py-3">
                          <StatusPill label={u.isVerified ? "verified" : "pending"} tone={u.isVerified ? "good" : "warn"} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={u.status} tone={u.status === "banned" ? "bad" : "good"} />
                        </td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleUserBanned(u.id, u.status !== "banned")}
                            className="mr-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                          >
                            {u.status === "banned" ? "Unban" : "Ban"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!usersState.loading && users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm opacity-70">No users match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs opacity-70">Showing {users.length} users.{usersState.loading ? " Loading…" : ""}</div>
            </section>
          )}

          {tab === "spots" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Spots</h2>
                  <p className="text-sm opacity-75">Review pending spot submissions before they are approved.</p>
                </div>
                <button
                  onClick={loadSpots}
                  className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10"
                >
                  Refresh
                </button>
              </div>

              {spotsState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{spotsState.error}</div>
              )}

              {spotFeedback && (
                <div
                  className="rounded-xl border p-3 text-sm"
                  style={{
                    borderColor: spotFeedback.type === "success" ? "rgba(105,242,140,0.35)" : "rgba(255,107,107,0.35)",
                    background: spotFeedback.type === "success" ? "rgba(105,242,140,0.08)" : "rgba(255,107,107,0.08)",
                  }}
                >
                  {spotFeedback.message}
                </div>
              )}

              {spots.length > 0 ? (
                <div className="space-y-3">
                  {spots.map((spot) => (
                    <article
                      key={spot.id}
                      className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 transition hover:bg-foreground/10"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="min-w-0 truncate text-base font-semibold">{spot.name}</h3>
                            <StatusPill label={spot.status} tone={spot.status === "pending" ? "warn" : "neutral"} />
                          </div>
                          <div className="grid gap-2 text-sm sm:grid-cols-3">
                            <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                              <div className="text-[10px] uppercase tracking-wide opacity-60">Location</div>
                              <div className="mt-1 font-medium">{spot.location}</div>
                            </div>
                            <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                              <div className="text-[10px] uppercase tracking-wide opacity-60">Category</div>
                              <div className="mt-1 font-medium">{spot.category}</div>
                            </div>
                            <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                              <div className="text-[10px] uppercase tracking-wide opacity-60">Created By</div>
                              <div className="mt-1 font-medium tabular-nums">{spot.createdBy}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs opacity-70 sm:text-right">
                          <div className="uppercase tracking-wide">Created</div>
                          <div className="mt-1 font-medium">{formatSpotCreatedAt(spot.createdAt)}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApproveSpot(spot)}
                          disabled={spotBusyId === spot.id}
                          className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10 disabled:opacity-50"
                        >
                          {spotBusyId === spot.id ? "Approving..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRejectSpot(spot.id)}
                          disabled={spotBusyId === spot.id}
                          className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10 disabled:opacity-50"
                        >
                          {spotBusyId === spot.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : !spotsState.loading ? (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-10 text-center text-sm opacity-70">
                  No pending spots found.
                </div>
              ) : null}

              <div className="text-xs opacity-70">Showing {spots.length} pending spots.{spotsState.loading ? " Loading…" : ""}</div>
            </section>
          )}
        </div>

        <footer className="mt-6 text-xs opacity-60">
          Needs backend running at <span className="font-mono">NEXT_PUBLIC_API_URL</span>.
        </footer>
      </div>
    </div>
    </>
  );
}
