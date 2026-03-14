"use client";

import React, { useEffect, useState, useCallback } from "react";

const NAV_LINKS = [
  { label: "How it works", id: "how", color: "orange" },
  { label: "Categories", id: "categories", color: "purple" },
  { label: "Reviews", id: "reviews", color: "blue" },
  { label: "Why UniTok", id: "why", color: "green" },
];

const NAVBAR_HEIGHT = 72; // px — accounts for top-4 offset + bar height

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── active section via IntersectionObserver ── */
  useEffect(() => {
    const ids = ["hero", ...NAV_LINKS.map((l) => l.id), "final-cta"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry that has the largest intersection ratio
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }
        if (best?.target.id) setActiveId(best.target.id);
      },
      { rootMargin: `-${NAVBAR_HEIGHT}px 0px -40% 0px`, threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── smooth-scroll click handler (offsets for fixed navbar) ── */
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[min(1100px,96%)] transition-all duration-300 ${
        scrolled ? "nav-glass backdrop-blur-md py-2 rounded-xl" : "py-4"
      }`}
      style={{ zIndex: 9999 }}    /* always above every stacked scene */
    >
      <nav className="flex items-center justify-between px-5">
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "hero")}
          className="neon-underline neon-underline--purple flex items-center gap-3 px-2 py-1 -ml-2 transition-colors duration-300 hover:text-white"
        >
          <img src="/UniTokLogo.png" alt="UniTok" className="h-9 w-auto object-contain" />
          <span className="text-sm font-semibold hidden md:inline" style={{ color: "inherit" }}>UniTok</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`neon-underline neon-underline--${link.color} transition-colors ${activeId === link.id ? "text-white" : "hover:text-white"}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#final-cta"
          onClick={(e) => handleNavClick(e, "final-cta")}
          className="explore-btn px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:text-white"
        >
          Explore
        </a>
      </nav>
    </header>
  );
}
