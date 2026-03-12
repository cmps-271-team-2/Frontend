"use client";

import React from "react";

export default function SectionWrapper({ id, children, className = "" }: any) {
  return (
    <section id={id} className={`w-full py-28 px-6 ${className}`} style={{ background: 'var(--background)' }}> 
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
