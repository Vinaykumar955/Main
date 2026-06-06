import { z } from "zod";
import type { User, AuthSession } from "@/types/domain";
import { api, fetcher } from "@/services/api";
import { localStore } from "@/data/localStore";
import { env } from "@/config/env";

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(60),
    username: z
      .string()
      .min(3, "Min 3 chars")
      .max(24, "Max 24 chars")
      .regex(/^[a-z0-9_]+$/, "lowercase, digits, _ only"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
    hostel: z.string().min(1, "Pick your hostel"),
    room: z.string().max(12).optional().or(z.literal("")),
    yearOfStudy: z.coerce.number().int().min(1).max(6).optional(),
    course: z.string().max(60).optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Detects whether the real backend is reachable. Used as a one-shot probe
 * so we can fall through to the in-memory store when the server is down.
 */
let backendOnline: boolean | null = null;
async function isBackendOnline(): Promise<boolean> {
  if (backendOnline !== null) return backendOnline;
  try {
    await api.get("/health", { timeout: 1500 });
    backendOnline = true;
  } catch {
    backendOnline = false;
  }
  return backendOnline;
}

export const authService = {
  me: () => fetcher<{ user: User }>({ url: "/auth/me" }),

  signIn: async (input: SignInInput): Promise<AuthSession> => {
    if (await isBackendOnline()) {
      try {
        return await fetcher<AuthSession>({
          url: "/auth/sign-in",
          method: "POST",
          data: input,
        });
      } catch (err) {
        // network/server glitch → fall through
        if (!import.meta.env.DEV) throw err;
      }
    }
    const session = await localStore.signIn(input);
    return {
      user: session.user,
      token: session.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  signUp: async (input: SignUpInput): Promise<AuthSession> => {
    if (await isBackendOnline()) {
      try {
        return await fetcher<AuthSession>({
          url: "/auth/sign-up",
          method: "POST",
          data: input,
        });
      } catch (err) {
        if (!import.meta.env.DEV) throw err;
      }
    }
    const { confirmPassword: _cp, ...payload } = input;
    const session = await localStore.signUp(payload);
    return {
      user: session.user,
      token: session.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  signOut: () => api.post("/auth/sign-out").catch(() => null),
  requestOtp: (email: string) => api.post("/auth/otp/request", { email }),
  verifyOtp: (email: string, code: string) =>
    api.post("/auth/otp/verify", { email, code }),
};

export const SUPABASE_ENABLED =
  Boolean((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? false) &&
  env.VITE_API_URL !== "/api";
