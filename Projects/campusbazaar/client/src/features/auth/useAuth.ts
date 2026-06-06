import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "./authService";
import { useAuthStore } from "@/store";
import { useToastStore } from "@/store";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authService.me,
    enabled: options?.enabled ?? useAuthStore.getState().isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSignIn() {
  const signInStore = useAuthStore((s) => s.signIn);
  const setStatus = useAuthStore((s) => s.setStatus);
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const parsed = signInSchema.parse(input);
      return authService.signIn(parsed);
    },
    onMutate: () => setStatus("loading"),
    onSuccess: (session) => {
      signInStore(session.user, session.token);
      push({ type: "success", title: "SIGNED_IN", body: `Welcome back, ${session.user.name}` });
    },
    onError: (err) => {
      setStatus("error");
      push({ type: "danger", title: "AUTH_FAILED", body: err.message });
    },
    onSettled: () => setStatus("idle"),
  });
}

export function useSignUp() {
  const signInStore = useAuthStore((s) => s.signIn);
  const setStatus = useAuthStore((s) => s.setStatus);
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const parsed = signUpSchema.parse(input);
      return authService.signUp(parsed);
    },
    onMutate: () => setStatus("loading"),
    onSuccess: (session) => {
      signInStore(session.user, session.token);
      push({ type: "success", title: "ACCOUNT_CREATED", body: `Welcome to the floor, ${session.user.name}` });
    },
    onError: (err) => {
      setStatus("error");
      push({ type: "danger", title: "SIGNUP_FAILED", body: err.message });
    },
    onSettled: () => setStatus("idle"),
  });
}
