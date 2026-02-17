"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./bottombar";

export default function BottomBarWrapper() {
  const pathname = usePathname() || "/";

  const hide =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (hide) return null;
  return <BottomBar />;
}
