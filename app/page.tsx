"use client";

import Landing from "./landing/page";

export default function Home() {
  // "/" = Landing page only (public route)
  // Authenticated feed is at "/home"
  return <Landing onLoginSuccess={() => {
    // After login, redirect to /home
    window.location.href = "/home";
  }} />;
}

