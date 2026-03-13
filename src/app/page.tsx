"use client";

import { useState, useEffect } from "react";
import GlobalHeader from "./Components/SearchBar";
import ReviewCard from "./Components/ReviewCard";
import Landing from "./landing/Landing";
import SortBar from "./Components/sortBar";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("recent");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("http://localhost:8000/reviews?user_id=myUser123");
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (isLoggedIn) fetchReviews();
  }, [isLoggedIn]);

  //filtering
  let displayReviews = activeCategory === "All" 
    ? [...reviews] 
    : reviews.filter(r => r.category === activeCategory);

  //sorting
  displayReviews.sort((a, b) => {
    if (activeSort === "liked") return b.likes - a.likes;
    if (activeSort === "detailed") return b.text.length - a.text.length;
    if (activeSort === "positive") return b.rating - a.rating;
    return b.id - a.id;
  });

  if (!isLoggedIn) return <Landing onLoginSuccess={() => setIsLoggedIn(true)} />;

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase italic">Loading AUB Rate...</div>;

  return (
    <main className="snap-container bg-[#f8f9fa] min-h-screen">
      <GlobalHeader activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <SortBar activeSort={activeSort} setActiveSort={setActiveSort} />
      
      <div className="w-full pt-24">
        {displayReviews.map((review) => (
          <ReviewCard key={review.id} review={review} setReviews={setReviews} />
        ))}
      </div>
    </main>
  );
}