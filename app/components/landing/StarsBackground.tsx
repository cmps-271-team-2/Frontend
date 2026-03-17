"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function StarsBackground() {
  const [mounted, setMounted] = useState(false);
  const [starData, setStarData] = useState<any[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 50 }).map(() => ({
      size: Math.random() * 20 + 10,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
      isPurple: Math.random() > 0.5,
    }));

    setStarData(generatedStars);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {starData.map((star, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animation: `floatStar ${star.duration}s ease-in-out infinite alternate`,
            animationDelay: `${star.delay}s`,
          }}
        >
          <Star size={star.size} fill={star.isPurple ? "#C56BFF" : "#5BC8FF"} className="blur-[1px] transform rotate-12" />
        </div>
      ))}

      <style jsx>{`
        @keyframes floatStar {
          0% {
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 0.1;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: translateY(-40px) rotate(20deg) scale(1.1);
            opacity: 0.08;
          }
        }
      `}</style>
    </div>
  );
}
