"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Loader2, Star, Coffee, BookOpen } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema, requestOtpSchema, verifyOtpSchema } from "@/lib/validators";

// components
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import CategoryCard from "../components/landing/CategoryCard";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import HowItWorks from "../components/landing/HowItWorks";
import ReviewsSection from "../components/landing/ReviewsSection";
import FloatingBackground from "../components/landing/FloatingBackground";
import ThemeToggle from "../components/theme-toggle";

type AuthView = "auth" | "forgot";

interface LandingProps {
  onLoginSuccess?: () => void;
}

const normalizeEmail = (value: string) => value.toLowerCase().trim();

const getFriendlyAuthError = (error: unknown): string => {
  if (error instanceof TypeError) {
    return "Network error. Check your connection and try again.";
  }

  const message = error instanceof Error ? error.message : "";
  if (!message || message.startsWith("Request failed")) {
    return "Something went wrong. Please try again.";
  }

  switch (message) {
    case "EMAIL_EXISTS":
      return "An account already exists for this email.";
    case "No OTP request found. Request OTP again.":
      return "Request a new OTP before verifying.";
    case "No OTP request found. Register again.":
      return "Request a new OTP before resending.";
    case "OTP expired. Request a new OTP.":
      return "That OTP expired. Request a new one.";
    case "OTP data corrupted. Request OTP again.":
      return "We could not verify that OTP. Request a new one.";
    case "OTP already used. Request a new OTP.":
      return "That OTP has already been used. Request a new one.";
    case "Too many attempts. Request a new OTP.":
      return "Too many attempts. Request a new OTP.";
    case "Incorrect OTP.":
      return "The OTP you entered is incorrect.";
    case "Please wait 30 seconds before resending.":
      return "Please wait 30 seconds before requesting another code.";
    case "Too many resends. Try again later.":
      return "You have requested too many OTP resends. Try again later.";
    case "Invalid or expired code.":
      return "That reset code is invalid or expired.";
    case "Code expired.":
      return "That reset code has expired. Request a new one.";
    case "Code already used.":
      return "That reset code has already been used.";
    case "Only @mail.aub.edu emails are allowed.":
      return "Use your @mail.aub.edu email address.";
    default:
      return message;
  }
};

const getFriendlyFirebaseAuthError = (error: unknown): string => {
  const code = (error as { code?: string } | null)?.code;

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
    case "auth/missing-password":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return "Sign in failed. Please try again.";
  }
};

export default function Landing({ onLoginSuccess }: LandingProps) {
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
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

  useEffect(() => {
    document.body.style.overflow = showLogin ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogin]);

  const clearTransientAuthState = () => {
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowSignUpPassword(false);
    setShowForgotNewPassword(false);
    setOtp("");
    setOtpRequested(false);
    setForgotCodeSent(false);
    setForgotOtp("");
    setForgotNewPassword("");
  };

  const clearAuthFormData = () => {
    setLoginData({ email: "", password: "" });
    setSignUpData({ email: "", password: "" });
    setMajor("");
  };

  const closeAuthModal = () => {
    if (loading) {
      return;
    }

    setShowLogin(false);
    setAuthView("auth");
    setIsSignUp(false);
    clearTransientAuthState();
  };

  const openAuthModal = (nextIsSignUp: boolean) => {
    setAuthView("auth");
    setIsSignUp(nextIsSignUp);
    setShowLogin(true);
    clearTransientAuthState();
  };

  const toggleAuthMode = () => {
    if (loading) {
      return;
    }

    setIsSignUp((current) => !current);
    setAuthView("auth");
    clearTransientAuthState();
  };

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLoginData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSignUpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSignUpData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const finishAuth = () => {
    setShowLogin(false);
    setAuthView("auth");
    setIsSignUp(false);
    clearTransientAuthState();
    clearAuthFormData();

    if (onLoginSuccess) {
      onLoginSuccess();
      return;
    }

    router.replace("/home");
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const normalizedEmail = normalizeEmail(loginData.email);
    const emailCheck = aubEmailSchema.safeParse(normalizedEmail);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0]?.message || "Enter a valid AUB email.");
      return;
    }

    if (!loginData.password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailCheck.data, loginData.password);
      finishAuth();
    } catch (authError) {
      setError(getFriendlyFirebaseAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  const requestForgotPasswordCode = async () => {
    const normalizedEmail = normalizeEmail(loginData.email);
    const emailCheck = aubEmailSchema.safeParse(normalizedEmail);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0]?.message || "Enter a valid AUB email.");
      return false;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: emailCheck.data }),
      });
      setForgotCodeSent(true);
      setForgotOtp("");
      setShowForgotNewPassword(false);
      setSuccessMessage(response.message || "Reset code sent to your email.");
      return true;
    } catch (apiError) {
      setError(getFriendlyAuthError(apiError));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    await requestForgotPasswordCode();
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const normalizedEmail = normalizeEmail(loginData.email);
    const emailCheck = aubEmailSchema.safeParse(normalizedEmail);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0]?.message || "Enter a valid AUB email.");
      return;
    }

    if (!/^\d{6}$/.test(forgotOtp.trim())) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    if (forgotNewPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: emailCheck.data,
          otp: forgotOtp.trim(),
          new_password: forgotNewPassword,
        }),
      });

      setSuccessMessage(response.message || "Password reset successful.");
      setForgotCodeSent(false);
      setForgotOtp("");
      setForgotNewPassword("");
      setShowForgotNewPassword(false);
      setAuthView("auth");
      setLoginData({ email: emailCheck.data, password: "" });
    } catch (apiError) {
      setError(getFriendlyAuthError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const majorValue = major.trim();
    if (!majorValue) {
      setError("Major is required.");
      return;
    }

    const payload = {
      email: normalizeEmail(signUpData.email),
      password: signUpData.password,
    };
    const parsed = requestOtpSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });

      setOtpRequested(true);
      setOtp("");
      setSuccessMessage(response.message || "OTP sent. Check your email.");
    } catch (apiError) {
      setError(getFriendlyAuthError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const payload = {
      email: normalizeEmail(signUpData.email),
      otp: otp.trim(),
    };
    const parsed = verifyOtpSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });

      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          parsed.data.email,
          signUpData.password
        );
      } catch (authError) {
        setError(getFriendlyFirebaseAuthError(authError));
        return;
      }

      try {
        await setDoc(
          doc(db, "users", userCredential.user.uid),
          {
            email: userCredential.user.email ?? parsed.data.email,
            ...(userCredential.user.displayName ? { displayName: userCredential.user.displayName } : {}),
            major: major.trim(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (profileError) {
        console.error("[OTP] profile sync error", profileError);
      }

      setSuccessMessage(response.message || "Email verified successfully.");
      setOtpRequested(false);
      setOtp("");
      setSignUpData({ email: "", password: "" });
      setMajor("");
      finishAuth();
    } catch (apiError) {
      setError(getFriendlyAuthError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const normalizedEmail = normalizeEmail(signUpData.email);
    const emailCheck = aubEmailSchema.safeParse(normalizedEmail);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0]?.message || "Enter a valid AUB email.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>("/auth/register/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: emailCheck.data }),
      });
      setOtpRequested(true);
      setOtp("");
      setSuccessMessage(response.message || "OTP resent. Check your email.");
    } catch (apiError) {
      setError(getFriendlyAuthError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotCode = async () => {
    if (loading) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    await requestForgotPasswordCode();
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
          <Hero onOpenAuth={() => openAuthModal(false)} />
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
        <section id="start" className="scroll-mt-20"><FinalCTA onOpenAuth={() => openAuthModal(true)} /></section>
        <Footer />
      </div>

      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeAuthModal}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[920px] min-h-[600px] rounded-[2.5rem] overflow-hidden flex shadow-2xl transition-colors duration-300"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: "0px 25px 60px rgba(0, 0, 0, 0.4)" }}
            >
              <button
                type="button"
                onClick={closeAuthModal}
                className="absolute top-6 right-6 z-[110] text-zinc-500 hover:text-red-500 transition-colors"
                disabled={loading}
              >
                <X size={24}/>
              </button>

              {authView === "forgot" ? (
                <div className="w-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20"><Mail className="text-[#C56BFF]" size={28} /></div>
                  <h2 className="text-5xl font-black mb-2 italic"><span style={{ color: 'var(--text)' }} className="mr-2">Reset</span><span className="accent-phrase pr-4">Password</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-10" style={{ color: 'var(--text-muted)' }}>Enter your AUB email</p>

                  <form onSubmit={forgotCodeSent ? handleResetPassword : handleForgotPasswordSubmit} className="w-full max-w-sm space-y-6">
                    {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
                    {successMessage && <p className="text-green-400 text-xs font-bold uppercase tracking-widest">{successMessage}</p>}
                    <input
                      name="email"
                      type="email"
                      placeholder="abc00@mail.aub.edu"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full px-5 py-4 rounded-xl outline-none font-bold border-2"
                      style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                      required
                      readOnly={forgotCodeSent}
                      autoComplete="email"
                    />

                    {forgotCodeSent ? (
                      <>
                        <input
                          name="forgotOtp"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit reset code"
                          value={forgotOtp}
                          onChange={(event) => setForgotOtp(event.target.value.replace(/\D/g, ""))}
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
                            onChange={(event) => setForgotNewPassword(event.target.value)}
                            className="w-full px-5 py-4 rounded-xl outline-none font-bold border-2"
                            style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
                            required
                            autoComplete="new-password"
                          />
                          <button type="button" onClick={() => setShowForgotNewPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                            {showForgotNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                        <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Reset Password"}</button>
                        <button
                          type="button"
                          onClick={handleResendForgotCode}
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
                            setShowForgotNewPassword(false);
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
                      <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}</button>
                    )}

                    <button type="button" onClick={() => { setAuthView("auth"); setForgotCodeSent(false); setForgotOtp(""); setForgotNewPassword(""); setShowForgotNewPassword(false); setError(null); setSuccessMessage(null); }} className="text-xs font-black uppercase tracking-widest opacity-50 block mx-auto" style={{ color: 'var(--text)' }}>{forgotCodeSent ? "Back to login" : "Cancel"}</button>
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
                      <input name="email" type="email" placeholder="abc00@mail.aub.edu" value={loginData.email} onChange={handleLoginChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required autoComplete="email" />
                      <div className="relative">
                        <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={loginData.password} onChange={handleLoginChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      <div className="text-right"><button type="button" onClick={() => setAuthView("forgot")} className="text-[11px] font-bold uppercase tracking-widest accent-phrase pr-2">Forgot password?</button></div>
                      <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Sign In"}</button>
                    </form>
                  </div>

                  {/*sign up side*/}
                  <div className={`w-1/2 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}>
                    <h2 className="text-5xl font-black mb-8 italic">Sign <span className="accent-phrase pr-6">Up</span></h2>
                    <form onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp} className="w-full max-w-sm space-y-4">
                      {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
                      {successMessage && <p className="text-green-400 text-xs font-bold uppercase tracking-widest">{successMessage}</p>}
                      <input name="email" type="email" placeholder="abc00@mail.aub.edu" value={signUpData.email} onChange={handleSignUpChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required readOnly={otpRequested} autoComplete="email" />
                      <input name="major" type="text" placeholder="Major" value={major} onChange={(event) => setMajor(event.target.value)} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required />
                      <div className="relative">
                        <input name="password" type={showSignUpPassword ? "text" : "password"} placeholder="Create Password" value={signUpData.password} onChange={handleSignUpChange} className="w-full px-5 py-4 rounded-xl outline-none" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} required readOnly={otpRequested} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowSignUpPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                          {showSignUpPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      {otpRequested && (
                        <input
                          name="otp"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                          className="w-full px-5 py-4 rounded-xl outline-none"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                          required
                        />
                      )}
                      <button type="submit" className="w-full py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }} disabled={loading}>{loading ? "Please wait..." : otpRequested ? "Verify OTP" : "Request OTP"}</button>
                      {otpRequested && (
                        <button type="button" onClick={handleResendOtp} className="w-full py-3 rounded-xl font-bold uppercase tracking-widest border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} disabled={loading}>
                          Resend OTP
                        </button>
                      )}
                    </form>
                  </div>

                  {/* OVERLAY PANEL */}
                  <div className={`absolute top-0 left-1/2 w-1/2 h-full transition-transform duration-700 ease-in-out z-50 flex flex-col items-center justify-center p-8 text-center pointer-events-none border-[4px] border-zinc-200 rounded-[2.5rem] ${isSignUp ? "-translate-x-full" : "translate-x-0"}`} style={{ background: 'var(--bg)' }}>
                    <div className="pointer-events-auto">
                      <h3 className="text-3xl font-black mb-4 italic leading-tight">{isSignUp ? "Welcome " : "New "}<span className="accent-phrase pr-6">{isSignUp ? "Back!" : "here?"}</span></h3>
                      <button type="button" onClick={toggleAuthMode} className="px-8 py-3 border-2 rounded-full font-bold italic uppercase tracking-widest transition-all text-xs" style={{ color: 'var(--text)', borderColor: 'var(--text)' }}>{isSignUp ? "Sign In" : "Sign Up"}</button>
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
