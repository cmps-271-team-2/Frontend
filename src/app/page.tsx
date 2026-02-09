// Language: TSX (TypeScript + React JSX)

import { auth } from "@/lib/firebase";

export default function Home() {
  const apiKeyLoaded = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Firebase Setup Check</h1>

      <p>Env loaded (API key exists): {apiKeyLoaded ? "YES ✅" : "NO ❌"}</p>

      <p>Firebase Auth object exists: {auth ? "YES ✅" : "NO ❌"}</p>

      <p style={{ marginTop: 20, opacity: 0.7 }}>
        If both are YES ✅, we move to /register next.
      </p>
    </main>
  );
}
