"use client";
import React from "react";
import { motion, Variants } from "framer-motion";

type Props = { onOpenAuth?: () => void };

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] } },
};

export default function Hero({ onOpenAuth }: Props) {
  return (
    <section className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-10">
      {/* Using flex-nowrap on desktop to prevent clipping. 
          Reduced gap to lg:gap-8 to keep them close. 
      */}
      <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row md:flex-nowrap items-center justify-center gap-6 lg:gap-8">
        
        {/* Left Side: Content */}
        <motion.div 
          variants={container} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          className="w-full md:w-auto flex-1 min-w-[320px] md:min-w-[500px] z-10"
        >
          <motion.p 
            variants={fadeUp} 
            className="inline-block mb-4 px-4 py-1 rounded-full text-xs md:text-sm uppercase tracking-widest border font-bold" 
            style={{ background: 'var(--card)', color: 'var(--text)', borderColor: 'var(--border)' }}
          >
            Your campus, your voice
          </motion.p>
          
          <motion.h1 
            variants={fadeUp} 
            /* Reduced font size slightly to prevent clipping on smaller laptops */
            className="display-font text-[2.5rem] sm:text-[3.2rem] md:text-[4.2rem] lg:text-[4.8rem] font-black tracking-tight leading-[1.1]" 
            style={{ color: 'var(--text)' }}
          >
            <span className="block whitespace-nowrap">Find it. Rate it.</span>
            <span className="accent-phrase pr-4 inline-block">UniTok</span> it.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-base md:text-lg font-medium max-w-md" style={{ color: 'var(--text)', opacity: 1 }}>
            Honest student reviews for professors, food, and study spots.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4">
            <button onClick={onOpenAuth} className="px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl italic" 
                    style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              Explore Reviews
            </button>
            <button onClick={() => onOpenAuth?.()} className="px-8 py-4 rounded-full font-bold border-2 transition-all hover:scale-105 italic" 
                    style={{ borderColor: 'var(--text)', color: 'var(--text)' }}>
              Write a Review
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: BIG LOGO */}
        <motion.div 
          variants={fadeUp} 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="w-full md:w-auto flex-1 flex items-center justify-center"
        >
          {/* Constrained max-width to prevent the logo from eating the whole screen */}
          <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[480px] md:h-[480px] lg:w-[580px] lg:h-[580px] flex items-center justify-center">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-[var(--neon-purple)]/20 blur-[80px] md:blur-[120px] rounded-full" />
            
            <motion.img 
              src="/UniTokLogo.png" 
              alt="UniTok Big Logo" 
              className="w-full h-auto object-contain relative z-30 drop-shadow-[0_0_30px_rgba(197,107,255,0.2)]"
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}