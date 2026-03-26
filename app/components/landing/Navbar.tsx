"use client";
import React, { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Categories", id: "categories" },
  { label: "How it works", id: "how" },
  { label: "Reviews", id: "reviews" },
  { label: "Get started", id: "start" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("hero");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    const hero = document.getElementById("hero");
    if (hero) observer.observe(hero);

    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[min(1100px,96%)] transition-all duration-300 z-[9999] ${
        scrolled
          ? "nav-glass backdrop-blur-md py-2 rounded-xl border border-white/10"
          : "py-4"
      }`}
    >
      <nav className="flex items-center justify-between px-5">
        {/* LOGO */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "hero")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/UniTokLogo.png"
            alt="UniTok"
            className="h-9 w-auto object-contain"
          />
          <span
            className="text-sm font-bold transition-colors duration-300"
            style={{ color: "var(--text)" }}
          >
            UniTok
          </span>
        </a>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="neon-underline transition-all duration-300 font-medium cursor-pointer relative py-1"
              style={{
                color:
                  activeId === link.id
                    ? "var(--text)"
                    : "var(--text-muted)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}