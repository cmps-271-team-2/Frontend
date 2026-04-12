"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./bottombar";
import { useAuthState } from "./auth-provider";

const APP_ROUTE_PREFIXES = ["/home", "/feed", "/favorites", "/my-ratings", "/profile", "/rate"];

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function BottomBarWrapper() {
  const pathname = usePathname() || "/";
  const { loading, user } = useAuthState();

  if (loading || !user || !isAppRoute(pathname)) {
    return null;
  }

  return <BottomBar />;
}
