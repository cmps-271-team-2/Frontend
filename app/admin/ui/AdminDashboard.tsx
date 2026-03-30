"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AnalyticsDTO,
  AdminJobDTO,
  AdminModerationStatusDTO,
  AdminPostDTO,
  AdminProfileDTO,
  AdminUserDTO,
  AdminStatusDTO,
  JobKindDTO,
  JobStatusDTO,
} from "../dtos";
import {
  deleteAdminPost,
  deleteAdminUser,
  setAdminProfileBanned,
  setAdminPostModeration,
  setAdminUserBanned,
  fetchAdminAnalytics,
  fetchAdminJobs,
  fetchAdminPosts,
  fetchAdminProfiles,
  fetchAdminUsers,
} from "../adminApi";
import TankPreview from "./TankPreview";

type TabId = "analytics" | "profiles" | "posts" | "jobs" | "users";

type LoadState = {
  loading: boolean;
  error: string | null;
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

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("analytics");

  const [profiles, setProfiles] = useState<AdminProfileDTO[]>([]);
  const [posts, setPosts] = useState<AdminPostDTO[]>([]);
  const [jobs, setJobs] = useState<AdminJobDTO[]>([]);
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);

  const [profilesState, setProfilesState] = useState<LoadState>({ loading: false, error: null });
  const [postsState, setPostsState] = useState<LoadState>({ loading: false, error: null });
  const [jobsState, setJobsState] = useState<LoadState>({ loading: false, error: null });
  const [usersState, setUsersState] = useState<LoadState>({ loading: false, error: null });
  const [analyticsState, setAnalyticsState] = useState<LoadState>({ loading: false, error: null });

  const [profileSearch, setProfileSearch] = useState("");
  const [profileLocation, setProfileLocation] = useState<string | "all">("all");
  const [profileMinReports, setProfileMinReports] = useState<number | "all">("all");
  const [profileStatus, setProfileStatus] = useState<AdminStatusDTO | "all">("all");

  const [postSearch, setPostSearch] = useState("");
  const [postTargetType, setPostTargetType] = useState<string | "all">("all");
  const [postMinRating, setPostMinRating] = useState<number | "all">("all");
  const [postMinReports, setPostMinReports] = useState<number | "all">("all");

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatus, setJobStatus] = useState<JobStatusDTO | "all">("all");
  const [jobKind, setJobKind] = useState<JobKindDTO | "all">("all");

  const [userSearch, setUserSearch] = useState("");
  const [userVerified, setUserVerified] = useState<boolean | "all">("all");
  const [userStatus, setUserStatus] = useState<AdminStatusDTO | "all">("all");

  // Delete animation state
  const [screenFlash, setScreenFlash] = useState(false);
  const [tankFlashKey, setTankFlashKey] = useState(0);
  const [shatteringUserId, setShatteringUserId] = useState<string | null>(null);

  const debouncedProfileSearch = useDebouncedValue(profileSearch, 250);
  const debouncedPostSearch = useDebouncedValue(postSearch, 250);
  const debouncedJobSearch = useDebouncedValue(jobSearch, 250);
  const debouncedUserSearch = useDebouncedValue(userSearch, 250);

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

  async function loadProfiles() {
    setProfilesState({ loading: true, error: null });
    try {
      const data = await fetchAdminProfiles({
        search: debouncedProfileSearch || undefined,
        location: profileLocation,
        status: profileStatus,
        minReports: profileMinReports === "all" ? undefined : profileMinReports,
        limit: 200,
        offset: 0,
      });
      setProfiles(data.items);
      setProfilesState({ loading: false, error: null });
    } catch (e: any) {
      setProfilesState({ loading: false, error: e?.message ?? "Failed to load profiles" });
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

  async function loadJobs() {
    setJobsState({ loading: true, error: null });
    try {
      const data = await fetchAdminJobs({
        search: debouncedJobSearch || undefined,
        status: jobStatus,
        kind: jobKind,
        limit: 200,
        offset: 0,
      });
      setJobs(data.items);
      setJobsState({ loading: false, error: null });
    } catch (e: any) {
      setJobsState({ loading: false, error: e?.message ?? "Failed to load jobs" });
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

  async function handleToggleProfileBanned(profileId: string, banned: boolean) {
    try {
      await setAdminProfileBanned(profileId, banned);
      await loadProfiles();
    } catch (e: any) {
      alert(e?.message ?? "Failed to update profile status");
    }
  }

  useEffect(() => {
    // Load each tab lazily.
    if (tab === "analytics" && !analytics && !analyticsState.loading) loadAnalytics();
    if (tab === "profiles" && profiles.length === 0 && !profilesState.loading) loadProfiles();
    if (tab === "posts" && posts.length === 0 && !postsState.loading) loadPosts();
    if (tab === "jobs" && jobs.length === 0 && !jobsState.loading) loadJobs();
    if (tab === "users" && users.length === 0 && !usersState.loading) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "profiles") loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProfileSearch, profileLocation, profileMinReports, profileStatus]);

  useEffect(() => {
    if (tab === "posts") loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPostSearch, postTargetType, postMinRating, postMinReports]);

  useEffect(() => {
    if (tab === "jobs") loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedJobSearch, jobStatus, jobKind]);

  useEffect(() => {
    if (tab === "users") loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUserSearch, userVerified, userStatus]);

  const profileLocationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of profiles) {
      const loc = (p.location ?? "").trim();
      if (loc) set.add(loc);
    }
    return ["all", ...Array.from(set).sort()];
  }, [profiles]);

  const postTargetTypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) {
      const tt = (p.targetType ?? "").trim();
      if (tt) set.add(tt);
    }
    return ["all", ...Array.from(set).sort()];
  }, [posts]);

  const jobKinds = useMemo(() => ["all", "ai", "etl", "indexing", "cron", "other"] as const, []);
  const jobStatuses = useMemo(() => ["all", "queued", "running", "succeeded", "failed", "canceled"] as const, []);

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

          <nav className="inline-flex w-full rounded-xl border border-foreground/10 bg-foreground/5 p-1 sm:w-auto">
            {(
              [
                { id: "analytics" as const, label: "Analytics" },
                { id: "profiles" as const, label: "Profiles" },
                { id: "posts" as const, label: "Posts" },
                { id: "jobs" as const, label: "Jobs" },
                { id: "users" as const, label: "Users" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "rounded-lg px-3 py-2 text-sm transition",
                  tab === t.id ? "bg-foreground text-background" : "hover:bg-foreground/10"
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
                  <div className="text-xs opacity-70">Profiles</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.profilesTotal ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Targets to rate</div>
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

          {tab === "profiles" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Profiles</h2>
                  <p className="text-sm opacity-75">Search + filter mock user profiles.</p>
                </div>
                <button
                  onClick={loadProfiles}
                  className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-3 sm:grid-cols-4">
                <input
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder="Search name, location, id…"
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                />
                <select
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  {profileLocationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === "all" ? "All locations" : loc}
                    </option>
                  ))}
                </select>
                <select
                  value={profileMinReports}
                  onChange={(e) => setProfileMinReports(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Any reports</option>
                  <option value="1">≥ 1</option>
                  <option value="2">≥ 2</option>
                  <option value="5">≥ 5</option>
                  <option value="10">≥ 10</option>
                </select>
                <select
                  value={profileStatus}
                  onChange={(e) => setProfileStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              {profilesState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{profilesState.error}</div>
              )}

              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full min-w-215 border-collapse text-left text-sm">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Profile</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Rating</th>
                      <th className="px-4 py-3 font-medium">Count</th>
                      <th className="px-4 py-3 font-medium">Reports</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs opacity-70">{p.id}</div>
                        </td>
                        <td className="px-4 py-3">{p.location ?? "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{p.ratingAvg.toFixed(2)}</td>
                        <td className="px-4 py-3 tabular-nums">{p.ratingCount}</td>
                        <td className="px-4 py-3 tabular-nums">{p.reports}</td>
                        <td className="px-4 py-3">
                          <StatusPill label={p.status} tone={p.status === "banned" ? "bad" : "good"} />
                        </td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleProfileBanned(p.id, p.status !== "banned")}
                            className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs hover:bg-foreground/10"
                          >
                            {p.status === "banned" ? "Unban" : "Ban"}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!profilesState.loading && profiles.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm opacity-70">No profiles match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs opacity-70">
                Showing {profiles.length} profiles (mock).{profilesState.loading ? " Loading…" : ""}
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

          {tab === "jobs" && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Jobs</h2>
                  <p className="text-sm opacity-75">Ongoing compute jobs (mock).</p>
                </div>
                <button
                  onClick={loadJobs}
                  className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-3 sm:grid-cols-3">
                <input
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search job name, id…"
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                />
                <select
                  value={jobKind}
                  onChange={(e) => setJobKind(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  {jobKinds.map((k) => (
                    <option key={k} value={k}>
                      {k === "all" ? "All kinds" : k}
                    </option>
                  ))}
                </select>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  {jobStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All statuses" : s}
                    </option>
                  ))}
                </select>
              </div>

              {jobsState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{jobsState.error}</div>
              )}

              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full min-w-245 border-collapse text-left text-sm">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Job</th>
                      <th className="px-4 py-3 font-medium">Kind</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">ETA</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => (
                      <tr key={j.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{j.name}</div>
                          <div className="text-xs opacity-70">{j.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={j.kind} tone="neutral" />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={j.status}
                            tone={
                              j.status === "running"
                                ? "good"
                                : j.status === "queued"
                                  ? "warn"
                                  : j.status === "succeeded"
                                    ? "neutral"
                                    : "bad"
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-40 overflow-hidden rounded-full bg-foreground/10">
                              <div
                                className="h-full bg-foreground/30"
                                style={{ width: `${Math.max(0, Math.min(100, j.progress))}%` }}
                              />
                            </div>
                            <div className="tabular-nums text-xs opacity-80">{j.progress}%</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs opacity-80 tabular-nums">
                          {typeof j.etaSeconds === "number" ? `${Math.round(j.etaSeconds / 60)}m` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(j.updatedAt)}</td>
                      </tr>
                    ))}

                    {!jobsState.loading && jobs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm opacity-70">No jobs match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs opacity-70">Showing {jobs.length} jobs (mock).{jobsState.loading ? " Loading…" : ""}</div>
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
        </div>

        <footer className="mt-6 text-xs opacity-60">
          Needs backend running at <span className="font-mono">NEXT_PUBLIC_API_URL</span>.
        </footer>
      </div>
    </div>
    </>
  );
}
