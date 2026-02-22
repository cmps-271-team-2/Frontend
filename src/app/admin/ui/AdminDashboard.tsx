"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AnalyticsDTO,
  PostDTO,
  PostStatusDTO,
  ProfileDTO,
  ProfileRoleDTO,
  ProfileStatusDTO,
} from "../dtos";
import { fetchAdminAnalytics, fetchAdminPosts, fetchAdminProfiles } from "../adminApi";

type TabId = "analytics" | "profiles" | "posts";

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

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("analytics");

  const [profiles, setProfiles] = useState<ProfileDTO[]>([]);
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);

  const [profilesState, setProfilesState] = useState<LoadState>({ loading: false, error: null });
  const [postsState, setPostsState] = useState<LoadState>({ loading: false, error: null });
  const [analyticsState, setAnalyticsState] = useState<LoadState>({ loading: false, error: null });

  const [profileSearch, setProfileSearch] = useState("");
  const [profileRole, setProfileRole] = useState<ProfileRoleDTO | "all">("all");
  const [profileStatus, setProfileStatus] = useState<ProfileStatusDTO | "all">("all");

  const [postSearch, setPostSearch] = useState("");
  const [postStatus, setPostStatus] = useState<PostStatusDTO | "all">("all");
  const [postTag, setPostTag] = useState<string | "all">("all");

  const debouncedProfileSearch = useDebouncedValue(profileSearch, 250);
  const debouncedPostSearch = useDebouncedValue(postSearch, 250);

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
        role: profileRole,
        status: profileStatus,
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
        status: postStatus,
        tag: postTag,
        limit: 200,
        offset: 0,
      });
      setPosts(data.items);
      setPostsState({ loading: false, error: null });
    } catch (e: any) {
      setPostsState({ loading: false, error: e?.message ?? "Failed to load posts" });
    }
  }

  useEffect(() => {
    // Load each tab lazily.
    if (tab === "analytics" && !analytics && !analyticsState.loading) loadAnalytics();
    if (tab === "profiles" && profiles.length === 0 && !profilesState.loading) loadProfiles();
    if (tab === "posts" && posts.length === 0 && !postsState.loading) loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "profiles") loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProfileSearch, profileRole, profileStatus]);

  useEffect(() => {
    if (tab === "posts") loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPostSearch, postStatus, postTag]);

  const postTagOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) for (const t of p.tags) set.add(t);
    return ["all", ...Array.from(set).sort()];
  }, [posts]);

  const totals = analytics?.totals;
  const series = analytics?.series7d ?? [];

  const maxPosts = useMemo(() => {
    return Math.max(1, ...series.map((d) => d.posts));
  }, [series]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
              <span className="rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-xs">mock</span>
            </div>
            <p className="text-sm opacity-80">Minimal dashboard for profiles, posts, and analytics.</p>
          </div>

          <nav className="inline-flex w-full rounded-xl border border-foreground/10 bg-foreground/5 p-1 sm:w-auto">
            {(
              [
                { id: "analytics" as const, label: "Analytics" },
                { id: "profiles" as const, label: "Profiles" },
                { id: "posts" as const, label: "Posts" },
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
                  <div className="text-xs opacity-70">Profiles</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.profilesTotal ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Active: {totals?.profilesActive ?? "—"}</div>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="text-xs opacity-70">Posts</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.postsTotal ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Drafts: {totals?.postsDraft ?? "—"}</div>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="text-xs opacity-70">Flagged</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.postsFlagged ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Suspended: {totals?.profilesSuspended ?? "—"}</div>
                </div>
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="text-xs opacity-70">Pending</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{totals?.profilesPending ?? "—"}</div>
                  <div className="mt-2 text-xs opacity-75">Review queue (mock)</div>
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
                    Avg signups/day: {series.length ? Math.round(series.reduce((a, b) => a + b.signups, 0) / series.length) : "—"}
                  </div>
                  <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                    Avg posts/day: {series.length ? Math.round(series.reduce((a, b) => a + b.posts, 0) / series.length) : "—"}
                  </div>
                  <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2">
                    Avg reports/day: {series.length ? Math.round(series.reduce((a, b) => a + b.reports, 0) / series.length) : "—"}
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

              <div className="grid gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-3 sm:grid-cols-3">
                <input
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder="Search name, email, id…"
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                />
                <select
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={profileStatus}
                  onChange={(e) => setProfileStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {profilesState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{profilesState.error}</div>
              )}

              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full min-w-215 border-collapse text-left text-sm">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.displayName}</div>
                          <div className="text-xs opacity-70">{p.id}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{p.email}</td>
                        <td className="px-4 py-3">
                          <StatusPill label={p.role} tone="neutral" />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={p.status}
                            tone={p.status === "active" ? "good" : p.status === "pending" ? "warn" : "bad"}
                          />
                        </td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(p.lastActiveAt)}</td>
                      </tr>
                    ))}

                    {!profilesState.loading && profiles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm opacity-70">
                          No profiles match your filters.
                        </td>
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
                  <p className="text-sm opacity-75">Search + filter mock posts.</p>
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
                  placeholder="Search title, author, tag…"
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
                />
                <select
                  value={postStatus}
                  onChange={(e) => setPostStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="flagged">Flagged</option>
                </select>
                <select
                  value={postTag}
                  onChange={(e) => setPostTag(e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  {postTagOptions.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "All tags" : t}
                    </option>
                  ))}
                </select>
              </div>

              {postsState.error && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-3 text-sm">{postsState.error}</div>
              )}

              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full min-w-245 border-collapse text-left text-sm">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Author</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Tags</th>
                      <th className="px-4 py-3 font-medium">Likes</th>
                      <th className="px-4 py-3 font-medium">Reports</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs opacity-70">{p.id}</div>
                        </td>
                        <td className="px-4 py-3">{p.authorName}</td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={p.status}
                            tone={p.status === "published" ? "good" : p.status === "draft" ? "neutral" : "bad"}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                              <span key={t} className="rounded-full border border-foreground/10 bg-background px-2 py-0.5 text-xs">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{p.likeCount}</td>
                        <td className="px-4 py-3 tabular-nums">{p.reportCount}</td>
                        <td className="px-4 py-3 text-xs opacity-80">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}

                    {!postsState.loading && posts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm opacity-70">
                          No posts match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs opacity-70">Showing {posts.length} posts (mock).{postsState.loading ? " Loading…" : ""}</div>
            </section>
          )}
        </div>

        <footer className="mt-6 text-xs opacity-60">
          Needs backend running at <span className="font-mono">NEXT_PUBLIC_BACKEND_URL</span>.
        </footer>
      </div>
    </div>
  );
}
