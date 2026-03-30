"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validators";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { X, Eye, EyeOff, Mail, ArrowLeft, Loader2, Star, Coffee, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

//components
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import CategoryCard from "../components/landing/CategoryCard";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import HowItWorks from "../components/landing/HowItWorks";
import ReviewsSection from "../components/landing/ReviewsSection";
import FloatingBackground from "../components/landing/FloatingBackground";
import ThemeToggle from "../components/theme-toggle";

export default function Landing({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authView, setAuthView] = useState<"auth" | "forgot">("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ email: "", password: "" });
  const [major, setMajor] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [forgotCodeSent, setForgotCodeSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const friendlyFirebaseAuthError = (err: unknown): string => {
    const code = (err as { code?: string } | null)?.code;
    if (!code) return "Sign in failed. Please try again.";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-email":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return "Sign in failed. Please try again.";
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowSignUpPassword(false);
    setOtp("");
    setOtpRequested(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email.toLowerCase().trim(), formData.password);
      setSuccessMessage("Signed in successfully. Redirecting...");
      setTimeout(() => {
        onLoginSuccess();
        setShowLogin(false);
      }, 350);
    } catch (err: unknown) {
      setError(friendlyFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!major.trim()) {
      setError("MAJOR IS REQUIRED");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase().trim(),
        formData.password
      );
      const { user } = userCredential;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email ?? formData.email.toLowerCase().trim(),
        ...(user.displayName ? { displayName: user.displayName } : {}),
        major: major.trim(),
        createdAt: serverTimestamp(),
      });

      onLoginSuccess();
      setShowLogin(false);
    } catch (err: any) {
      setError(err?.message || "SIGN UP FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const email = formData.email.toLowerCase().trim();
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setForgotCodeSent(true);
      setSuccessMessage("Reset code sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const email = formData.email.toLowerCase().trim();
    if (!forgotOtp.trim().match(/^\d{6}$/)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }
    if (forgotNewPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp: forgotOtp.trim(),
          new_password: forgotNewPassword,
        }),
      });
      setSuccessMessage(res.message || "Password reset successful.");
      setForgotCodeSent(false);
      setForgotOtp("");
      setForgotNewPassword("");
      setAuthView("auth");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const payload = {
      email: signUpData.email.toLowerCase().trim(),
      password: signUpData.password,
    };
    const parsed = requestOtpSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setOtpRequested(true);
      setSuccessMessage(res.message || "OTP sent. Check your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const payload = {
      email: signUpData.email.toLowerCase().trim(),
      otp: otp.trim(),
    };
    const parsed = verifyOtpSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setSuccessMessage(res.message || "Email verified successfully.");
      setFormData({ email: signUpData.email.toLowerCase().trim(), password: signUpData.password });
      setIsSignUp(false);
      setOtpRequested(false);
      setOtp("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/register/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: signUpData.email.toLowerCase().trim() }),
      });
      setSuccessMessage(res.message || "OTP resent. Check your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full transition-colors duration-300" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <ThemeToggle />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <FloatingBackground variant="stars" count={40} />
      </div>

      <div className="relative z-10 w-full">
        <Navbar />
        
        <div id="hero" className="scroll-mt-20">
          <Hero onOpenAuth={() => { setAuthView("auth"); setIsSignUp(false); setShowLogin(true); setError(null); setSuccessMessage(null); }} />
        </div>

        <section id="categories" className="py-24 px-6 text-center scroll-mt-20">
          <h2 className="text-4xl md:text-6xl font-black mb-16 display-font italic">Three categories, <span className="accent-phrase pr-4">endless reviews</span></h2>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard icon={<Star fill="currentColor" />} color="purple" title="Professors" desc="Share honest reviews about teaching style and grading." />
            <CategoryCard icon={<Coffee fill="currentColor" />} color="orange" title="Food" desc="Find the best coffee and hangout spots on campus." />
            <CategoryCard icon={<BookOpen />} color="green" title="Study Spots" desc="Uncover quiet libraries and productive corners." />
          </div>
        </section>

        <section id="how" className="scroll-mt-20"><HowItWorks /></section>
        <section id="reviews" className="scroll-mt-20"><ReviewsSection /></section>
        <section id="start" className="scroll-mt-20"><FinalCTA onOpenAuth={() => { setAuthView("auth"); setIsSignUp(true); setShowLogin(true); setError(null); setSuccessMessage(null); }} /></section>
        <Footer />
      </div>

      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !loading && setShowLogin(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[920px] min-h-[600px] rounded-[2.5rem] overflow-hidden flex shadow-2xl transition-colors duration-300"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: "0px 25px 60px rgba(0, 0, 0, 0.4)" }}
            >
              <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 z-[110] text-zinc-500 hover:text-red-500 transition-colors">
                <X size={24}/>
              </button>

              {authView === "forgot" ? (
                <div className="w-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20"><Mail className="text-[#C56BFF]" size={28} /></div>
                  <h2 className="text-5xl font-black mb-2 italic"><span style={{ color: 'var(--text)' }} className="mr-2">Reset</span><span className="accent-phrase pr-4">Password</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-10" style={{ color: 'var(--text-muted)' }}>Enter your AUB email</p>

                  <form onSubmit={forgotCodeSent ? handleResetPassword : handleForgotPassword} className="w-full max-w-sm space-y-6">
                    {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
                    {successMessage && <p className="text-green-400 text-xs font-bold uppercase tracking-widest">{successMessage}</p>}
                    <input
                      name="email"
                      type="email"
                      placeholder="abc00@mail.aub.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl outline-none font-bold border-2"
                      style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                      required
                      readOnly={forgotCodeSent}
                    />

                    {forgotCodeSent ? (
                      <>
                        <input
                          name="forgotOtp"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit reset code"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-5 py-4 rounded-xl outline-none font-bold border-2"
                          style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                          required
                        />
                        <div className="relative">
                          <input
                            name="forgotNewPassword"
                            type={showForgotNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl outline-none font-bold border-2"
                            style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                            required
                          />
                          <button type="button" onClick={() => setShowForgotNewPassword(!showForgotNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                            {showForgotNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                        <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>{loading ? <Loader2 className="animate-spin" /> : "Reset Password"}</button>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="w-full py-3 rounded-xl font-bold uppercase tracking-widest border"
                          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                          disabled={loading}
                        >
                          Resend Code
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotCodeSent(false);
                            setForgotOtp("");
                            setForgotNewPassword("");
                            setError(null);
                            setSuccessMessage(null);
                          }}
                          className="text-xs font-black uppercase tracking-widest opacity-50 block mx-auto"
                          style={{ color: 'var(--text)' }}
                        >
                          Edit Email
                        </button>
                      </>
                    ) : (
                      <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>{loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}</button>
                    )}

                    <button type="button" onClick={() => { setAuthView("auth"); setForgotCodeSent(false); setForgotOtp(""); setForgotNewPassword(""); }} className="text-xs font-black uppercase tracking-widest opacity-50 block mx-auto" style={{ color: 'var(--text)' }}>{forgotCodeSent ? "Back to login" : "Cancel"}</button>
                  </form>
                </div>
              ) : (
                <>
                  {/*sign in side*/}
                  <div className={`w-1/2 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}>
                    <h2 className="text-5xl font-black mb-8 italic">Sign <span className="accent-phrase pr-6">In</span></h2>
                    <form onSubmit={handleSignIn} className="w-full max-w-sm space-y-4">
                      {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
                      {successMessage && <p className="text-green-400 text-xs font-bold uppercase tracking-widest">{successMessage}</p>}
                      <input name="email" type="email" placeholder="abc00@mail.aub.edu" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required />
                      <div className="relative">
                        <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      <div className="text-right"><button type="button" onClick={() => setAuthView("forgot")} className="text-[11px] font-bold uppercase tracking-widest accent-phrase pr-2">Forgot password?</button></div>
                      <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>Sign In</button>
                    </form>
                  </div>

                  {/*sign up side*/}
                  <div className={`w-1/2 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}>
                    <h2 className="text-5xl font-black mb-8 italic">Sign <span className="accent-phrase pr-6">Up</span></h2>
                    <form onSubmit={handleSignUp} className="w-full max-w-sm space-y-4">
                      <input name="email" type="email" placeholder="abc00@mail.aub.edu" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required />
                      <input name="major" type="text" placeholder="Major" value={major} onChange={(e) => setMajor(e.target.value)} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required />
                      <div className="relative">
                        <input name="password" type={showSignUpPassword ? "text" : "password"} placeholder="Create Password" value={formData.password} onChange={handleChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required />
                        <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                          {showSignUpPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>{loading ? "Please wait..." : "Sign Up"}</button>
                    </form>
                  </div>

                  {/* OVERLAY PANEL */}
                  <div className={`absolute top-0 left-1/2 w-1/2 h-full transition-transform duration-700 ease-in-out z-50 flex flex-col items-center justify-center p-8 text-center pointer-events-none border-[4px] border-zinc-200 rounded-[2.5rem] ${isSignUp ? "-translate-x-full" : "translate-x-0"}`} style={{ background: 'var(--bg)' }}>
                    <div className="pointer-events-auto">
                      <h3 className="text-3xl font-black mb-4 italic leading-tight">{isSignUp ? "Welcome " : "New "}<span className="accent-phrase pr-6">{isSignUp ? "Back!" : "here?"}</span></h3>
                      <button onClick={toggleAuthMode} className="px-8 py-3 border-2 rounded-full font-bold italic uppercase tracking-widest transition-all text-xs" style={{ color: 'var(--text)', borderColor: 'var(--text)' }}>{isSignUp ? "Sign In" : "Sign Up"}</button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}