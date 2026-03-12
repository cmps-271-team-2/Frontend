"use client";

import React from "react";
import { motion } from "framer-motion";
import ReviewCard from "./ReviewCard";
import StarsBackground from "./StarsBackground";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] as const } } };

export default function ReviewsSection() {
  const sample = [
    { title: "Great professor—clear lectures", quote: "Explains concepts well and holds helpful office hours.", score: 4.8, tag: "Professors" },
    { title: "Cheap lunch, big portions", quote: "Cafeteria food is solid and affordable.", score: 4.4, tag: "Cafeterias" },
    { title: "Quiet study corner", quote: "Found a cozy corner that’s perfect for exam prep.", score: 4.6, tag: "Study Spots" },
  ];

  return (
    <section className="w-full flex items-center justify-center px-6 py-28 relative overflow-hidden" style={{ background: 'var(--background-soft)', minHeight: '100vh' }}>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <StarsBackground />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="text-center md:text-left">
          <motion.div variants={item} className="inline-block px-4 py-1 rounded-full border text-sm font-bold uppercase tracking-widest mb-6" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>Community</motion.div>
          <motion.h3 variants={item} className="text-5xl md:text-6xl font-black display-font mb-4"><span className="accent-phrase-blue">1,200+</span> reviews</motion.h3>
          <motion.p variants={item} style={{ color: 'var(--text-secondary)' }} className="max-w-md">Students are rating professors, cafeterias, and study spots — real feedback from campus communities.</motion.p>

          <motion.div variants={item} className="mt-8 flex gap-4 flex-wrap">
            <div className="card-surface p-4 rounded-lg">
              <div className="text-2xl font-black">3</div>
              <div className="text-xs" style={{ color: 'var(--muted-on-dark)' }}>Categories</div>
            </div>
            <div className="card-surface p-4 rounded-lg">
              <div className="text-2xl font-black">4.5</div>
              <div className="text-xs" style={{ color: 'var(--muted-on-dark)' }}>Avg. rating</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="flex flex-col items-center md:items-end gap-6">
          {sample.map((r, i) => (
            <motion.div key={i} variants={item} className={`transform-gpu hover:scale-[1.02] transition-all`}>
              <ReviewCard title={r.title} quote={r.quote} score={r.score} tag={r.tag} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
