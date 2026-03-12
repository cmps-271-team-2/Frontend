"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema, requestOtpSchema, verifyOtpSchema } from "@/lib/validators";
import { Star, Coffee, BookOpen, ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import CategoryCard from "../components/landing/CategoryCard";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import HowItWorks from "../components/landing/HowItWorks";
import ReviewsSection from "../components/landing/ReviewsSection";
import StackedScene from "../components/landing/StackedScene";
import FloatingBackground from "../components/landing/FloatingBackground";

interface LandingProps {
  onLoginSuccess: () => void;
}

export default function Landing({ onLoginSuccess }: LandingProps) {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<"auth" | "verify">("auth");
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = () => {
    setShowLogin(false);
    router.push("/forgot-password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const parsed = requestOtpSchema.safeParse({ email: formData.email, password: formData.password });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Invalid input");
        setLoading(false);
        return;
      }
      try {
        await apiFetch("/auth/register/request-otp", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        setStep("verify"); //show OTP screen
      } catch (err: any) {
        setError(err.message || "Failed to request OTP");
      }
    } else {
      const emailCheck = aubEmailSchema.safeParse(formData.email);
      if (!emailCheck.success) {
        setError(emailCheck.error.issues[0].message);
        setLoading(false);
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onLoginSuccess();
      } catch (e: any) {
        setError(e.message || "Login failed.");
      }
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, otp: verificationCode }),
      });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Lock body scroll when auth modal is open
    if (showLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showLogin]);

  return (
    <div style={{ background: 'var(--background)' }}>
      {/* Navbar floats above everything */}
      <Navbar />

      {/* ── Panel 1: Hero ─────────────────────────────── z:10 */}
      <StackedScene
        id="hero"
        zIndex={10}
        sceneHeightVh={140}
        overlapVh={0}
        isFirst
        panelBackground="var(--background)"
        glowGradient="radial-gradient(circle at 50% 100%, rgba(197,107,255,0.24) 0%, rgba(91,200,255,0.16) 42%, transparent 74%)"
      >
        <Hero onOpenAuth={() => setShowLogin(true)} />
      </StackedScene>

      {/* ── Panel 2: Categories ───────────────────────── z:20 */}
      <StackedScene
        id="categories"
        zIndex={20}
        sceneHeightVh={150}
        overlapVh={30}
        panelBackground="var(--background-soft)"
        glowGradient="radial-gradient(circle at 50% 100%, rgba(197,107,255,0.22) 0%, rgba(255,79,203,0.14) 38%, transparent 72%)"
      >
        <section
          className="w-full flex items-center justify-center px-6 relative overflow-hidden"
          style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '7rem' }}
        >
          {/* Ambient radial glow */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_40%,_rgba(197,107,255,0.12)_0%,transparent_70%)]" />

          {/* Floating UniTok symbol particles (Star / Coffee / Book) */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <FloatingBackground variant="symbols" count={24} />
          </div>

          <div className="max-w-6xl w-full mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.2, 0.9, 0.3, 1] }}
            >
              <p style={{ color: 'var(--neon-purple)' }} className="font-bold tracking-[0.3em] text-xs mb-4 uppercase">What you can do</p>
              <h2 className="text-4xl md:text-6xl font-black mb-16 display-font">
                Three categories, <span className="accent-phrase">endless reviews</span>
              </h2>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                <CategoryCard
                  icon={<Star fill="currentColor" />}
                  color="purple"
                  title="Professors"
                  desc="Share honest reviews about teaching style, grading, and more."
                  backText="Rate teaching quality, fairness, and accessibility — help classmates choose wisely."
                />
                <CategoryCard
                  icon={<Coffee fill="currentColor" />}
                  color="orange"
                  title="Cafeterias"
                  desc="Find the best food, coffee, and hangout spots on campus."
                  backText="Compare menus, ambiance, and value across every campus eatery."
                />
                <CategoryCard
                  icon={<BookOpen />}
                  color="green"
                  title="Study Spots"
                  desc="Uncover quiet libraries, cozy corners, and productive spaces."
                  backText="Discover the best places to focus, collaborate, and recharge."
                />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </StackedScene>

      {/* ── Panel 3: How it works ─────────────────────── z:30 */}
      <StackedScene
        id="how"
        zIndex={30}
        sceneHeightVh={150}
        overlapVh={30}
        panelBackground="var(--background)"
        glowGradient="radial-gradient(circle at 50% 100%, rgba(255,155,84,0.24) 0%, rgba(255,216,77,0.16) 44%, transparent 75%)"
      >
        <HowItWorks />
      </StackedScene>

      {/* ── Panel 4: Reviews ──────────────────────────── z:40 */}
      <StackedScene
        id="reviews"
        zIndex={40}
        sceneHeightVh={150}
        overlapVh={30}
        panelBackground="var(--background-soft)"
        glowGradient="radial-gradient(circle at 50% 100%, rgba(105,242,140,0.24) 0%, rgba(91,200,255,0.14) 42%, transparent 75%)"
      >
        <ReviewsSection />
      </StackedScene>

      {/* ── Panel 5: Why UniTok ───────────────────────── z:50 */}
      <StackedScene
        id="why"
        zIndex={50}
        sceneHeightVh={150}
        overlapVh={30}
        panelBackground="var(--background)"
        glowGradient="radial-gradient(circle at 50% 100%, rgba(91,200,255,0.18) 0%, rgba(197,107,255,0.14) 42%, transparent 74%)"
      >
        <section
          className="w-full flex items-center justify-center px-6"
          style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '7rem' }}
        >
          <div className="max-w-6xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.2, 0.9, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-block px-4 py-1 rounded-full border text-sm font-bold uppercase tracking-widest mb-6" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>Why UniTok</div>
              <h2 className="text-3xl md:text-5xl font-black display-font mb-6">Trusted student <span className="accent-phrase-blue">voices</span> for better campus decisions</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto">Real students, honest ratings, and quick insights so you can pick the best spots and professors faster.</p>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-surface p-6 rounded-lg text-left">
                  <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ background: 'rgba(197,107,255,0.1)', color: 'var(--neon-purple)' }}>💬</div>
                  <h4 className="font-bold">Real Voices</h4><p style={{ color: 'var(--text-muted)' }} className="mt-2 text-sm">Anonymous, verified student reviews you can trust.</p>
                </div>
                <div className="card-surface p-6 rounded-lg text-left">
                  <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ background: 'rgba(255,216,77,0.1)', color: 'var(--neon-yellow)' }}>⚡</div>
                  <h4 className="font-bold">Save Time</h4><p style={{ color: 'var(--text-muted)' }} className="mt-2 text-sm">Discover top-rated spots and courses quickly.</p>
                </div>
                <div className="card-surface p-6 rounded-lg text-left">
                  <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ background: 'rgba(105,242,140,0.1)', color: 'var(--neon-green)' }}>🎓</div>
                  <h4 className="font-bold">Built for Campus</h4><p style={{ color: 'var(--text-muted)' }} className="mt-2 text-sm">Designed around student needs and AUB life.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </StackedScene>

      {/* ── Panel 6: Final CTA ────────────────────────── z:60 */}
      <StackedScene
        id="final-cta"
        zIndex={60}
        sceneHeightVh={140}
        overlapVh={30}
        panelBackground="var(--background)"
        glowGradient="radial-gradient(circle at 50% 100%, rgba(197,107,255,0.22) 0%, rgba(255,79,203,0.14) 36%, transparent 72%)"
      >
        <FinalCTA onOpenAuth={() => setShowLogin(true)} />
      </StackedScene>

      {/* ── Footer: free flow after all stacked panels ─ z:70 */}
      <div style={{ position: "relative", zIndex: 100 }}>
        <Footer />
      </div>


      {/*auth*/}
      {showLogin && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowLogin(false)} />
          
          <div
            className="relative w-full max-w-[880px] min-h-[560px] rounded-[2rem] overflow-hidden flex"
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 0 80px rgba(197,107,255,0.08), 0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-5 right-5 z-50 p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={22}/>
            </button>

            {/* ── OTP verification overlay ── */}
            {step === "verify" && (
              <div
                className="absolute inset-0 z-[60] flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-300 text-center"
                style={{ background: 'var(--background)' }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(91,200,255,0.08)', border: '1px solid rgba(91,200,255,0.15)' }}
                >
                  <ShieldCheck style={{ color: 'var(--neon-blue)' }} size={38}/>
                </div>
                <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Confirm OTP</h3>
                <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>Sent to <b style={{ color: 'var(--text-secondary)' }}>{formData.email}</b></p>
                <form onSubmit={handleVerify} className="w-full max-w-xs">
                  <input
                    required maxLength={6} placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full rounded-xl py-4 text-center text-3xl font-black tracking-[0.3em] outline-none mb-6 transition-colors duration-200"
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      caretColor: 'var(--neon-blue)',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(91,200,255,0.5)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                    style={{
                      background: 'white',
                      color: 'var(--text-on-light)',
                      boxShadow: '0 4px 24px rgba(91,200,255,0.12)',
                    }}
                  >
                    Verify &amp; Enter
                  </button>
                </form>
              </div>
            )}

            {/* ── Sign In form ── */}
            <div className={`w-1/2 flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}>
              <h3 className="text-3xl font-black mb-8 display-font" style={{ color: 'var(--text-primary)' }}>
                Sign <span className="accent-phrase">In</span>
              </h3>
              {error && !isSignUp && (
                <p className="text-xs mb-4 font-bold px-3 py-2 rounded-lg" style={{ background: 'rgba(255,80,80,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.15)' }}>{error}</p>
              )}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <input
                  name="email" type="email" placeholder="abc00@mail.aub.edu"
                  value={formData.email} onChange={handleChange} required
                  className="auth-field w-full p-4 rounded-xl outline-none transition-colors duration-200"
                />
                <div className="relative w-full">
                  <input
                    name="password" type={showPassword ? "text" : "password"} placeholder="Password"
                    value={formData.password} onChange={handleChange} required
                    className="auth-field w-full p-4 pr-12 rounded-xl outline-none transition-colors duration-200"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-purple)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                <button
                  type="button" onClick={handleForgotPassword}
                  className="text-xs font-bold uppercase tracking-tight transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-purple)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Forgot password?
                </button>
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                  style={{
                    background: 'white',
                    color: 'var(--text-on-light)',
                    boxShadow: '0 4px 24px rgba(197,107,255,0.10)',
                  }}
                >
                  Sign In
                </button>
              </form>
            </div>

            {/* ── Sign Up form ── */}
            <div className={`w-1/2 flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}>
              <h3 className="text-3xl font-black mb-8 display-font" style={{ color: 'var(--text-primary)' }}>
                Sign <span className="accent-phrase-blue">Up</span>
              </h3>
              {error && isSignUp && (
                <p className="text-xs mb-4 font-bold px-3 py-2 rounded-lg" style={{ background: 'rgba(255,80,80,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.15)' }}>{error}</p>
              )}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <input
                  name="email" type="email" placeholder="abc00@mail.aub.edu"
                  value={formData.email} onChange={handleChange} required
                  className="auth-field w-full p-4 rounded-xl outline-none transition-colors duration-200"
                />
                <div className="relative w-full">
                  <input
                    name="password" type={showPassword ? "text" : "password"} placeholder="Password"
                    value={formData.password} onChange={handleChange} required
                    className="auth-field w-full p-4 pr-12 rounded-xl outline-none transition-colors duration-200"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-purple)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                  style={{
                    background: 'white',
                    color: 'var(--text-on-light)',
                    boxShadow: '0 4px 24px rgba(91,200,255,0.10)',
                  }}
                >
                  Request OTP
                </button>
              </form>
            </div>

            {/* ── Animated switch panel ── */}
            <div
              className={`absolute top-0 left-1/2 w-1/2 h-full transition-transform duration-700 ease-in-out z-40 flex flex-col items-center justify-center p-12 text-center
                ${isSignUp ? "-translate-x-full rounded-r-[3rem]" : "translate-x-0 rounded-l-[3rem]"}`}
              style={{
                background: 'var(--background)',
                borderLeft: isSignUp ? 'none' : '1px solid var(--border-subtle)',
                borderRight: isSignUp ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {isSignUp ? (
                <>
                  <h3 className="text-2xl font-black mb-4 display-font" style={{ color: 'var(--text-primary)' }}>
                    Welcome <span className="accent-phrase">Back!</span>
                  </h3>
                  <p className="mb-8 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Login to see your ratings and discover more</p>
                  <button
                    onClick={() => {setIsSignUp(false); setStep("auth"); setError(null);}}
                    className="auth-switch-btn px-10 py-3 rounded-full font-bold uppercase tracking-widest transition-all"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black mb-4 display-font" style={{ color: 'var(--text-primary)' }}>
                    New <span className="accent-phrase-blue">here?</span>
                  </h3>
                  <p className="mb-8 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Create an account and join the AUB rating community!</p>
                  <button
                    onClick={() => {setIsSignUp(true); setStep("auth"); setError(null);}}
                    className="auth-switch-btn-blue px-10 py-3 rounded-full font-bold uppercase tracking-widest transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
