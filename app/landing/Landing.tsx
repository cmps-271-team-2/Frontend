"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { aubEmailSchema, requestOtpSchema, verifyOtpSchema } from "@/lib/validators";
import { 
  Star, Coffee, BookOpen, Eye, EyeOff, ShieldCheck, X
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-black bg-gradient-to-b from-black via-[#1a0b2e] to-black text-white scrollbar-hide">
      
      {/*our website's logo*/}
      <div className="fixed top-2 left-8 z-[100] cursor-pointer">
        <img src="/logo.png" alt="Logo" className="h-40 md:h-48 w-auto object-contain" />
      </div>

      {/*first page*/}
        <section className="snap-start h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_30%,_rgba(147,51,234,0.4)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,_rgba(192,38,211,0.2)_0%,transparent_50%)]" />
        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="text-pink-500 text-sm">📍</span>
            <span className="text-zinc-400 text-sm font-medium tracking-wide">Your campus, your voice</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 italic">
            RATE <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">EVERYTHING</span> <br />
            ON CAMPUS
          </h1>
          <p className="text-white text-lg md:text-2xl max-w-xl mx-auto font-medium leading-relaxed">
            Professors, cafeterias, study spots — honest reviews from students who've been there.
          </p>
          <div className="mt-12 animate-bounce text-zinc-600 font-bold">
             <p className="text-xs uppercase tracking-[0.2em] mb-2">Scroll to explore</p>
             <span>↓</span>
          </div>
        </div>
      </section>


      {/*page 2*/}
      <section className="snap-start h-screen w-full flex items-center justify-center bg-[#0d0612] px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,_rgba(147,51,234,0.2)_0%,transparent_70%)]" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <p className="text-purple-500 font-bold tracking-[0.3em] text-xs mb-4 uppercase">What you can do</p>
          <h2 className="text-4xl md:text-6xl font-black mb-16 italic">
            Three categories, <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">endless reviews</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard icon={<Star fill="currentColor"/>} color="bg-purple-600" title="Rate Professors" desc="Share honest reviews about teaching style, grading, and more." />
            <CategoryCard icon={<Coffee fill="currentColor"/>} color="bg-orange-500" title="Review Cafeterias" desc="Find the best food, coffee, and hangout spots on campus." />
            <CategoryCard icon={<BookOpen />} color="bg-green-600" title="Discover Study Spots" desc="Uncover quiet libraries, cozy corners, and productive spaces." />
          </div>
        </div>
      </section>


      {/*page 3: how it works section*/}
      <section className="snap-start h-screen w-full flex items-center justify-center bg-[#08040a] px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,_rgba(147,51,234,0.3)_0%,transparent_60%)]" />
      <div className="max-w-6xl mx-auto w-full text-center relative z-10">
      <h2 className="text-4xl md:text-6xl font-black mb-16 italic text-white">
        How it <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">works</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <FeatureCard 
        img="/feature1.png" 
        label="Post and edit your ratings" 
        glowColor="group-hover:shadow-purple-500/50"
      />
      <FeatureCard 
        img="/feature2.jpg" 
        label="The ratings are anonymous" 
        glowColor="group-hover:shadow-pink-500/50"
      />
      <FeatureCard 
        img="/feature3.png" 
        label="Like and dislike ratings" 
        glowColor="group-hover:shadow-purple-500/50"
      />
      </div>
    </div>
    </section>

      
 {/*page 4*/}
<section className="snap-start h-screen w-full flex items-center justify-center bg-[#0a050a] relative overflow-hidden px-6 md:px-20">
  
  {/*the stars background*/}
  <div className="absolute inset-0 z-0 pointer-events-none">
    <StarsBackground />
  </div>
  
  <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
    <div className="hidden md:flex flex-col items-center justify-center relative">

      {/*glow behind the star */}
      <div className="absolute w-[300px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
      
      {/*a big star*/}
      <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-500">
        <Star 
          size={240} 
          fill="url(#starGradient)" 
          className="drop-shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-[bounce_4s_easeInOut_infinite]"
        />
        <svg width="0" height="0">
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </svg>
      </div>
      
      {/*labels around the star*/}
      <div className="absolute top-0 -right-4 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-bounce delay-75">
        ⭐ Top Rated
      </div>
      <div className="absolute bottom-10 -left-10 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-bounce delay-300">
        🔥 Best Spot!
      </div>
    </div>

    {/*the right side of the big star*/}
    <div className="text-center md:text-left space-y-8">
      <div className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold uppercase tracking-widest">
        Join the community
      </div>
      
      <h2 className="text-5xl md:text-8xl font-black italic leading-[1.1] text-white">
        READY TO <br />
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent px-4 -ml-4">
        RATE?
        </span>
      </h2>
      
      <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-md md:mx-0 mx-auto leading-relaxed">
        Share your experience and help others find the best of campus life!
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
        <button 
          onClick={() => { setStep("auth"); setIsSignUp(false); setShowLogin(true); setError(null); }}
          className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(147,51,234,0.4)] active:scale-95 uppercase tracking-widest"
        >
          Get Started →
        </button>
      </div>
    </div>

  </div>
</section>


      {/*auth*/}
      {showLogin && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
          
          <div className="relative w-full max-w-[850px] min-h-[550px] bg-[#f0f2f5] rounded-[2.5rem] shadow-2xl overflow-hidden text-zinc-900 flex">
            
            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 z-50 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><X size={24}/></button>

            {/*OTP page overlay*/}
            {step === "verify" && (
              <div className="absolute inset-0 z-[60] bg-white flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-300 text-center">
                    <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mb-6"><ShieldCheck className="text-purple-600" size={40}/></div>
                    <h3 className="text-2xl font-black mb-2">Confirm OTP</h3>
                    <p className="text-zinc-500 mb-8 text-sm">Sent to <b>{formData.email}</b></p>
                    <form onSubmit={handleVerify} className="w-full max-w-xs">
                        <input required maxLength={6} placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="auth-input w-full bg-zinc-100 border-2 border-transparent rounded-2xl py-4 text-center text-4xl font-black tracking-widest focus:border-purple-500 outline-none mb-6" />
                        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-purple-200">Verify & Enter</button>
                    </form>
              </div>
            )}

            {/*login*/}
            <div className={`w-1/2 flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}>
               <h3 className="text-4xl font-black mb-8 italic">Sign In</h3>
               {error && !isSignUp && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}
               <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <input name="email" type="email" placeholder="abc00@mail.aub.edu" value={formData.email} onChange={handleChange} className="auth-input w-full bg-zinc-100 p-4 rounded-xl outline-none border border-transparent focus:border-purple-300" required />
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className="auth-input w-full bg-zinc-100 p-4 rounded-xl outline-none border border-transparent focus:border-purple-300" required />
                  <button type="button" onClick={handleForgotPassword} className="auth-muted-link text-xs font-bold uppercase transition-colors tracking-tight">Forgot password?</button>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-200 active:scale-95 transition-all">Sign In</button>
               </form>
            </div>

            {/*sign up*/}
            <div className={`w-1/2 flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}>
               <h3 className="text-4xl font-black mb-8 italic">Sign Up</h3>
               {error && isSignUp && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}
               <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <input name="email" type="email" placeholder="abc00@mail.aub.edu" value={formData.email} onChange={handleChange} className="auth-input w-full bg-zinc-100 p-4 rounded-xl outline-none border border-transparent focus:border-purple-300" required />
                  <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="auth-input w-full bg-zinc-100 p-4 rounded-xl outline-none border border-transparent focus:border-purple-300" required />
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-200 active:scale-95 transition-all">Request OTP</button>
               </form>
            </div>

            {/*animation for the login/sign up pages*/}
            <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-br from-purple-600 to-pink-600 text-white transition-transform duration-700 ease-in-out z-40 flex flex-col items-center justify-center p-12 text-center
              ${isSignUp ? "-translate-x-full rounded-r-[80px]" : "translate-x-0 rounded-l-[80px]"}`}>
              
              {isSignUp ? (
                <>
                  <h3 className="text-3xl font-black mb-4 italic">Welcome Back!</h3>
                  <p className="mb-8 text-purple-100 font-medium italic">Login to see your ratings and discover more</p>
                  <button onClick={() => {setIsSignUp(false); setStep("auth"); setError(null);}} className="px-12 py-3 border-2 border-white rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-purple-600 transition-all">Sign In</button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black mb-4 italic">New here?</h3>
                  <p className="mb-8 text-purple-100 font-medium italic">Create an account and join the AUB rating community!</p>
                  <button onClick={() => {setIsSignUp(true); setStep("auth"); setError(null);}} className="px-12 py-3 border-2 border-white rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-purple-600 transition-all">Sign Up</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

{/*the design of the cards*/}
function CategoryCard({ icon, color, title, desc }: any) {
  return (
    <div className="relative group">
      {/* This is the "Lightening Border" / Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      
      {/* The Actual Card */}
      <div className="relative bg-[#111] border border-white/10 p-10 rounded-[2.5rem] text-left hover:border-white/20 transition-all group-hover:-translate-y-2 flex flex-col h-full">
        <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform text-white`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 italic text-white">{title}</h3>
        <p className="text-zinc-500 text-lg leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureItem({ img, label, color }: any) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8">
      <div className="w-full aspect-square mb-6 overflow-hidden rounded-2xl bg-zinc-900">
        <img src={img} alt={label} className="w-full h-full object-cover" />
      </div>
      <span className={`inline-block px-4 py-2 rounded-full bg-white text-black text-xs font-black uppercase shadow-[5px_5px_0px_#7c3aed] ${color}`}>{label}</span>
    </div>
  );
}


{/* FLIPPING CARD COMPONENT */}
function FeatureCard({ img, label, glowColor }: any) {
  return (
    <div className="group h-[400px] w-full [perspective:1000px]">
      
      <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        
        {/*picture on the front side*/}
        <div className="absolute inset-0">
            <div className={`h-full w-full bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${glowColor}`}>
                <img 
                    src={img} 
                    alt="Feature" 
                    className="h-full w-full object-cover p-2 rounded-[2.5rem]" 
                />
            </div>
        </div>

        {/*writing on the back side*/}
        <div className="absolute inset-0 h-full w-full rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-white/20 p-4">
               <Star className="text-white" fill="white" size={32} />
            </div>
            <p className="text-2xl font-black uppercase tracking-wider leading-tight">
              {label}
            </p>
            <div className="mt-6 h-1 w-12 bg-white/50 rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}


function StarsBackground() {
  const [mounted, setMounted] = useState(false);
  const [starData, setStarData] = useState<any[]>([]);

  useEffect(() => {
    // Generate star data only once on the client
    const generatedStars = Array.from({ length: 50 }).map(() => ({
      size: Math.random() * 20 + 10,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
      isPurple: Math.random() > 0.5
    }));
    
    setStarData(generatedStars);
    setMounted(true);
  }, []);

  // Don't render anything on the server to avoid the mismatch
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
          <Star 
            size={star.size} 
            fill={star.isPurple ? "#9333ea" : "#db2777"}
            className="blur-[1px] transform rotate-12"
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes floatStar {
          0% {
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 0.1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-40px) rotate(20deg) scale(1.2);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
}
