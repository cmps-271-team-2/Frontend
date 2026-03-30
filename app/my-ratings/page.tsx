"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";

import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { deletePost, getMyPosts, updatePost } from "@/lib/posts";

type ToastState = { type: "success" | "error"; message: string } | null;

type MyPost = {
  id: string;
  title: string;
  targetType: string;
  text: string;
  rating: number | null;
  createdAt: string;
};

function toText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function toRating(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.min(5, value));
  }
  const asNum = Number(value);
  if (!Number.isFinite(asNum)) return null;
  return Math.max(1, Math.min(5, asNum));
}

function normalizePost(raw: Record<string, unknown>): MyPost | null {
  const id = toText(raw.id);
  if (!id) return null;

  const targetType = toText(raw.targetType) || "rating";
  const title =
    toText(raw.title) ||
    toText(raw.spotName) ||
    toText(raw.code) ||
    toText(raw.courseCode) ||
    toText(raw.courseName) ||
    toText(raw.professorName) ||
    toText(raw.targetId) ||
    "Untitled";

  return {
    id,
    title,
    targetType,
    text: toText(raw.text) || toText(raw.review) || toText(raw.comment),
    rating: toRating(raw.rating),
    createdAt: toText(raw.createdAt),
  };
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function isOwnedByCurrentUser(raw: Record<string, unknown>, user: User): boolean {
  const uid = (user.uid || "").trim();
  const email = (user.email || "").trim().toLowerCase();
  const emailLocal = email ? email.split("@", 1)[0] : "";
  const displayName = (user.displayName || "").trim().toLowerCase();

  const postUserId = toText(raw.userId);
  const postCreatedBy = toText(raw.createdBy).toLowerCase();
  const postUserEmail = toText(raw.userEmail).toLowerCase();
  const postDisplayName = (toText(raw.displayName) || toText(raw.authorName)).toLowerCase();

  if (uid && (postUserId === uid || postCreatedBy === uid)) {
    return true;
  }

  if (email && (postUserEmail === email || postCreatedBy === email)) {
    return true;
  }

  if (emailLocal && postCreatedBy === emailLocal) {
    return true;
  }

  if (displayName && (postDisplayName === displayName || postCreatedBy === displayName)) {
    return true;
  }

  return false;
}

export default function MyRatingsPage() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [editDialog, setEditDialog] = useState<{ post: MyPost; text: string; rating: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<MyPost | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!authUser) {
      setPosts([]);
      setLoading(false);
      return;
    }

    void loadMyRatings();
  }, [authReady, authUser]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function getToken(): Promise<string | null> {
    if (!authUser) {
      setToast({ type: "error", message: "Please sign in first." });
      return null;
    }
    try {
      return await authUser.getIdToken();
    } catch {
      setToast({ type: "error", message: "Could not validate your session. Please sign in again." });
      return null;
    }
  }

  async function loadMyRatings() {
    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      let data = await getMyPosts(token);

      if (data.length === 0 && authUser) {
        const allPosts = await apiFetch<Array<Record<string, unknown>>>("/posts", { cache: "no-store", authToken: token });
        data = allPosts.filter((item) => isOwnedByCurrentUser(item, authUser));
      }

      const normalized = data
        .map((item) => normalizePost(item))
        .filter((item): item is MyPost => Boolean(item));
      setPosts(normalized);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to load your ratings." });
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(post: MyPost) {
    setEditDialog({ post, text: post.text, rating: String(post.rating ?? "") });
  }

  async function handleDelete(post: MyPost) {
    setDeleteDialog(post);
  }

  async function submitEditDialog() {
    if (!editDialog) return;

    const token = await getToken();
    if (!token) return;

    const nextText = editDialog.text.trim();
    if (!nextText) {
      setToast({ type: "error", message: "Review text cannot be empty." });
      return;
    }

    const parsedRating = Number(editDialog.rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      setToast({ type: "error", message: "Rating must be between 1 and 5." });
      return;
    }

    const post = editDialog.post;
    setBusyId(post.id);
    try {
      await updatePost(post.id, { text: nextText, rating: parsedRating }, token);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, text: nextText, rating: parsedRating } : p)));
      setEditDialog(null);
      setToast({ type: "success", message: "Rating updated." });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to update rating." });
    } finally {
      setBusyId(null);
    }
  }

  async function submitDeleteDialog() {
    if (!deleteDialog) return;

    const token = await getToken();
    if (!token) return;

    const post = deleteDialog;
    setBusyId(post.id);
    try {
      await deletePost(post.id, token);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setDeleteDialog(null);
      setToast({ type: "success", message: "Rating deleted." });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to delete rating." });
    } finally {
      setBusyId(null);
    }
  }

  const ratingCountText = useMemo(() => `${posts.length} rating${posts.length === 1 ? "" : "s"}`, [posts.length]);

  return (
    <main style={{ padding: 20, paddingBottom: 120, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--text)" }}>My Ratings</h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14, fontWeight: 500 }}>
            Manage your own posts in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "10px 12px",
          background: "var(--card)",
          color: "var(--muted)",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {ratingCountText}
      </div>

      {toast ? (
        <div
          style={{
            marginTop: 12,
            borderRadius: 12,
            padding: "10px 12px",
            border: `1px solid ${toast.type === "success" ? "rgba(100,220,130,0.4)" : "rgba(255,120,120,0.45)"}`,
            background: toast.type === "success" ? "rgba(100,220,130,0.1)" : "rgba(255,120,120,0.12)",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {toast.message}
        </div>
      ) : null}

      {!authReady || loading ? (
        <section
          style={{
            marginTop: 18,
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
            color: "var(--muted)",
            fontWeight: 600,
          }}
        >
          Loading your ratings...
        </section>
      ) : !authUser ? (
        <section
          style={{
            marginTop: 18,
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
            color: "var(--text)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Sign in required</h2>
          <p style={{ marginTop: 8, color: "var(--muted)", fontWeight: 500 }}>
            You need to sign in to access your ratings.
          </p>
          <button
            type="button"
            onClick={() => router.push("/landing")}
            style={{
              marginTop: 10,
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--text)",
              color: "var(--bg)",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Go to Sign In
          </button>
        </section>
      ) : posts.length === 0 ? (
        <section
          style={{
            marginTop: 18,
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
            color: "var(--text)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>No ratings yet</h2>
          <p style={{ marginTop: 8, color: "var(--muted)", fontWeight: 500 }}>
            Once you post a rating, it will show up here.
          </p>
          <button
            type="button"
            onClick={() => router.push("/rate")}
            style={{
              marginTop: 10,
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Create Rating
          </button>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
          {posts.map((post) => {
            const isBusy = busyId === post.id;
            return (
              <article
                key={post.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 16,
                  background: "var(--card)",
                }}
              >
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        margin: 0,
                        color: "var(--text)",
                        fontSize: 17,
                        fontWeight: 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.title}
                    </h2>
                    <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>
                      {post.targetType || "rating"}
                      {post.createdAt ? ` • ${formatDate(post.createdAt)}` : ""}
                    </p>
                  </div>
                  {post.rating !== null ? (
                    <div
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "6px 9px",
                        color: "var(--text)",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {post.rating.toFixed(1)} / 5
                    </div>
                  ) : null}
                </div>

                <p style={{ margin: "10px 0 0", color: "var(--text)", fontSize: 14, lineHeight: 1.5 }}>
                  {post.text || "No review text."}
                </p>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => void handleEdit(post)}
                    disabled={isBusy}
                    style={{
                      padding: "8px 11px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text)",
                      cursor: isBusy ? "default" : "pointer",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {isBusy ? "Working..." : "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(post)}
                    disabled={isBusy}
                    style={{
                      padding: "8px 11px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,120,120,0.45)",
                      background: "rgba(255,120,120,0.08)",
                      color: "#ff9f9f",
                      cursor: isBusy ? "default" : "pointer",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editDialog ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setEditDialog(null)}>
          <div style={{ width: "100%", maxWidth: 620, borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18, fontWeight: 800 }}>Edit rating</h3>
            <p style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>Update your text and score.</p>
            <textarea
              value={editDialog.text}
              onChange={(e) => setEditDialog((prev) => (prev ? { ...prev, text: e.target.value } : prev))}
              rows={4}
              style={{ width: "100%", marginTop: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", padding: 10 }}
            />
            <input
              type="number"
              min={1}
              max={5}
              step={1}
              value={editDialog.rating}
              onChange={(e) => setEditDialog((prev) => (prev ? { ...prev, rating: e.target.value } : prev))}
              style={{ width: "100%", marginTop: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", padding: 10 }}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setEditDialog(null)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 700 }}>Cancel</button>
              <button type="button" onClick={() => void submitEditDialog()} disabled={busyId === editDialog.post.id} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontWeight: 700 }}>{busyId === editDialog.post.id ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteDialog ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDeleteDialog(null)}>
          <div style={{ width: "100%", maxWidth: 460, borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18, fontWeight: 800 }}>Delete rating</h3>
            <p style={{ marginTop: 8, color: "var(--muted)", fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setDeleteDialog(null)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 700 }}>Cancel</button>
              <button type="button" onClick={() => void submitDeleteDialog()} disabled={busyId === deleteDialog.id} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,120,120,0.45)", background: "rgba(255,120,120,0.08)", color: "#ff9f9f", fontWeight: 700 }}>{busyId === deleteDialog.id ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
