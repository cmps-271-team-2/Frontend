import { z } from "zod";

export const aubEmailSchema = z
  .string()
  .email("Enter a valid email")
  .endsWith("@mail.aub.edu", "Must be an @mail.aub.edu email");

export const requestOtpSchema = z.object({
  email: aubEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const verifyOtpSchema = z.object({
  email: aubEmailSchema,
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
