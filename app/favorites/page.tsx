"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getMyFavorites, removeFavorite, type FavoriteItem } from "@/lib/posts";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function FavoritesPage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

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
      setLoading(false);
      return;
    }

    void loadFavorites();
  }, [authReady, authUser]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function withAuthToken(): Promise<string | null> {
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

  async function loadFavorites() {
    const token = await withAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await getMyFavorites(token);
      setFavorites(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load favorites.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(item: FavoriteItem) {
    const token = await withAuthToken();
    if (!token) return;

    const key = `${item.targetType}:${item.targetId}`;
    setBusyKey(key);
    try {
      await removeFavorite(item.targetType, item.targetId, token);
      setFavorites((prev) => prev.filter((fav) => !(fav.targetType === item.targetType && fav.targetId === item.targetId)));
      setToast({ type: "success", message: "Removed from favorites." });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to remove favorite.",
      });
    } finally {
      setBusyKey(null);
    }
  }

  const professorsAndCourses = useMemo(
    () => favorites.filter((item) => item.targetType === "professor" || item.targetType === "course"),
    [favorites],
  );
  const spots = useMemo(() => favorites.filter((item) => item.targetType === "spot"), [favorites]);

  function openInFeed(item: FavoriteItem) {
    const params = new URLSearchParams({
      targetType: item.targetType,
      targetId: item.targetId,
    });
    router.push(`/home?${params.toString()}`);
  }

  return (
    <main style={{ padding: 20, paddingBottom: 120, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--text)" }}>Favorites</h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14, fontWeight: 500 }}>
            Quick access to your saved professors, courses, and spots.
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

      {toast ? (
        <div
          style={{
            marginTop: 14,
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
          Loading favorites...
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
            You need to sign in to view your favorites.
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
      ) : favorites.length === 0 ? (
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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>No favorites yet</h2>
          <p style={{ marginTop: 8, color: "var(--muted)", fontWeight: 500 }}>
            Save professors, courses, or spots from the feed and they will appear here.
          </p>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          <FavoriteSection title="Professors/Courses" items={professorsAndCourses} busyKey={busyKey} onRemove={handleRemove} onOpen={openInFeed} />
          <FavoriteSection title="Spots" items={spots} busyKey={busyKey} onRemove={handleRemove} onOpen={openInFeed} />
        </div>
      )}
    </main>
  );
}

type FavoriteSectionProps = {
  title: string;
  items: FavoriteItem[];
  busyKey: string | null;
  onRemove: (item: FavoriteItem) => Promise<void>;
  onOpen: (item: FavoriteItem) => void;
};

function FavoriteSection({ title, items, busyKey, onRemove, onOpen }: FavoriteSectionProps) {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        background: "var(--card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{title}</h2>
        <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p style={{ margin: 0, padding: 16, color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>
          Nothing saved in this section.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => {
            const key = `${item.targetType}:${item.targetId}`;
            const isBusy = busyKey === key;
            return (
              <li
                key={key}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  style={{ minWidth: 0, textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text)",
                      fontSize: 14,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.targetName || item.targetId}
                  </p>
                  <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>
                    {item.targetType === "professor" ? "Professor" : item.targetType === "course" ? "Course" : "Spot"}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void onRemove(item)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: isBusy ? "rgba(255,255,255,0.06)" : "transparent",
                    color: "var(--text)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: isBusy ? "default" : "pointer",
                  }}
                >
                  {isBusy ? "Removing..." : "Remove"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
