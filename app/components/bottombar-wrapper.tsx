"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./bottombar";

export default function BottomBarWrapper() {
  const pathname = usePathname() || "/";

  // Hide bottom nav on public/auth routes and creation flows
  const hide =
    pathname === "/" || // Landing page
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/admin") || // Admin pages
    pathname.startsWith("/rate"); // Create post flow

  if (hide) return null;
  return <BottomBar />;
}
