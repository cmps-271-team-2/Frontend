"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";

type AuthStateContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthStateContext = createContext<AuthStateContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/landing"];
const PROTECTED_ROUTE_PREFIXES = [
  "/home",
  "/favorites",
  "/my-ratings",
  "/profile",
  "/rate",
  "/change-password",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user && isPublicRoute(pathname)) {
      router.replace("/home");
      return;
    }

    if (!user && isProtectedRoute(pathname)) {
      router.replace("/landing");
    }
  }, [loading, pathname, router, user]);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error("useAuthState must be used within an AuthProvider.");
  }

  return context;
}