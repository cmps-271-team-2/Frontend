"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type UserProfileDoc = {
  displayName?: string;
  major?: string;
  showDisplayName?: boolean;
};

const DEFAULT_DISPLAY_NAME = "Student";
const DEFAULT_MAJOR = "Unknown Major";

function normalizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export default function ProfilePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState(DEFAULT_DISPLAY_NAME);
  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [showDisplayName, setShowDisplayName] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [showMyRatingsPublicly, setShowMyRatingsPublicly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setDisplayName(DEFAULT_DISPLAY_NAME);
        setMajor(DEFAULT_MAJOR);
        setShowDisplayName(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = (snapshot.data() as UserProfileDoc | undefined) ?? {};
      const nextDisplayName = normalizeText(data.displayName, DEFAULT_DISPLAY_NAME);
      const nextMajor = normalizeText(data.major, DEFAULT_MAJOR);
      const nextShowDisplayName = data.showDisplayName === true;

      setDisplayName(nextDisplayName);
      setMajor(nextMajor);
      setShowDisplayName(nextShowDisplayName);

      if (!snapshot.exists() || !data.displayName || !data.major || typeof data.showDisplayName !== "boolean") {
        void setDoc(
          userRef,
          {
            displayName: nextDisplayName,
            major: nextMajor,
            showDisplayName: nextShowDisplayName,
          },
          { merge: true }
        );
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function persistUserDoc(patch: Partial<UserProfileDoc>) {
    if (!currentUser) {
      return;
    }

    await setDoc(doc(db, "users", currentUser.uid), patch, { merge: true });
  }

  function handleDisplayNameChange(nextValue: string) {
    setDisplayName(nextValue);
    void persistUserDoc({ displayName: nextValue.trim() || DEFAULT_DISPLAY_NAME });
  }

  function handleShowDisplayNameChange(nextValue: boolean) {
    setShowDisplayName(nextValue);
    void persistUserDoc({ showDisplayName: nextValue });
    setToast("Your preference will apply to future posts.");
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch {
      // Keep UX resilient even if sign out fails server-side.
    }
    router.push("/");
  }

  return (
    <main style={{ padding: 20, paddingBottom: 130, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Profile</h1>
      <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14, fontWeight: 500 }}>Manage your account settings</p>

      {toast ? (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(197,107,255,0.2)",
            background: "rgba(197,107,255,0.08)",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
        {/* Account card */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Account</h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0" }}>
            <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Display name</div>
            <input
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              style={{
                width: 200,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--card-elevated)",
                color: "var(--text)",
                outline: "none",
                fontSize: 14,
                fontWeight: 500,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(197,107,255,0.4)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0" }}>
            <div>
              <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Show my name on reviews</div>
              <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 12, fontWeight: 500 }}>Your preference will apply to future posts.</div>
            </div>
            <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={showDisplayName}
                onChange={(e) => handleShowDisplayNameChange(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  background: showDisplayName ? "var(--accent)" : "var(--card-elevated)",
                  border: `1px solid ${showDisplayName ? "var(--accent)" : "var(--border)"}`,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: showDisplayName ? 22 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </label>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0" }}>
            <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Show my ratings on my profile</div>
            <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={showMyRatingsPublicly}
                onChange={(e) => setShowMyRatingsPublicly(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  background: showMyRatingsPublicly ? "var(--accent)" : "var(--card-elevated)",
                  border: `1px solid ${showMyRatingsPublicly ? "var(--accent)" : "var(--border)"}`,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: showMyRatingsPublicly ? 22 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </label>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0" }}>
            <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Email notifications</div>
            <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  background: emailNotifs ? "var(--accent)" : "var(--card-elevated)",
                  border: `1px solid ${emailNotifs ? "var(--accent)" : "var(--border)"}`,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: emailNotifs ? 22 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </label>
          </div>
        </section>

        {/* Session card */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>My Ratings</h2>
          <p style={{ color: "var(--muted)", marginTop: 6, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
            Edit or delete your existing ratings.
          </p>

          <button
            onClick={() => router.push("/my-ratings")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(100,220,130,0.45)";
              e.currentTarget.style.background = "rgba(100,220,130,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Manage My Ratings
          </button>
        </section>

        {/* Session card */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Saved</h2>
          <p style={{ color: "var(--muted)", marginTop: 6, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
            Open your favorites list.
          </p>

          <button
            onClick={() => router.push("/favorites")}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(197,107,255,0.3)";
              e.currentTarget.style.background = "rgba(197,107,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            View Favorites
          </button>
        </section>

        {/* Session card */}
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            background: "var(--card)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Session</h2>
          <p style={{ color: "var(--muted)", marginTop: 6, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
            Log out of your account.
          </p>

          <button
            onClick={() => void handleLogout()}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "#ff6b6b",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,107,107,0.3)";
              e.currentTarget.style.background = "rgba(255,107,107,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Log out
          </button>
        </section>
      </div>
    </main>
  );
}
