// Language: TypeScript (React in Next.js)
"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validators";

type Step = "form" | "otp";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestOtp() {
    setError(null);
    setMessage(null);

    const parsed = requestOtpSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    await apiFetch<{ message: string }>("/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setMessage("OTP requested. Check your email (or backend console in dev).");
    setStep("otp");
  }

  async function handleVerifyOtp() {
    setError(null);
    setMessage(null);

    const parsed = verifyOtpSchema.safeParse({ email, otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid OTP");
      return;
    }

    const res = await apiFetch<{ message: string }>("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    setMessage(res.message);
    // redirect to login after a short moment
    setTimeout(() => {
      window.location.href = "/login";
    }, 800);
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Register</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {step === "form" && (
        <>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ina06@mail.aub.edu"
          />

          <label>Password</label>
          <input
            style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 chars"
          />

          <button onClick={handleRequestOtp} style={{ padding: 10, width: "100%" }}>
            Request OTP
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <p>
            We sent a 6-digit code to: <b>{email}</b>
          </p>

          <label>OTP Code</label>
          <input
            style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            inputMode="numeric"
          />

          <button onClick={handleVerifyOtp} style={{ padding: 10, width: "100%" }}>
            Verify OTP
          </button>

          <button
            onClick={async () => {
              setError(null);
              setMessage(null);
              try {
                await apiFetch<{ message: string }>("/auth/register/resend-otp", {
                  method: "POST",
                  body: JSON.stringify({ email }),
                });
                setMessage("OTP resent. Check your email.");
              } catch (e: any) {
                setError(e.message || "Failed to resend OTP");
              }
            }}
            style={{ padding: 10, width: "100%", marginTop: 10 }}
          >
            Resend OTP
          </button>


          <button
            onClick={() => setStep("form")}
            style={{ padding: 10, width: "100%", marginTop: 10 }}
          >
            Back
          </button>
        </>
      )}
    </main>
  );
}
