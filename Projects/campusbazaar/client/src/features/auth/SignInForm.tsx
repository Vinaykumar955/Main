import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, KeyRound } from "lucide-react";
import { signInSchema, type SignInInput } from "./authService";
import { useSignIn } from "./useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DEMO_ADMIN = { email: "aarav_x@hostel.edu", password: "password123" };

export function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const [params] = useSearchParams();
  const initial = useMemo(
    () => ({
      email: params.get("email") ?? "",
      password: params.get("password") ?? "",
    }),
    [params],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: initial,
  });
  const signIn = useSignIn();

  useEffect(() => {
    if (initial.email) setValue("email", initial.email);
    if (initial.password) setValue("password", initial.password);
  }, [initial, setValue]);

  const handleDemoAdmin = () => {
    setValue("email", DEMO_ADMIN.email, { shouldValidate: true });
    setValue("password", DEMO_ADMIN.password, { shouldValidate: true });
    signIn.mutate(DEMO_ADMIN);
  };

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const isDemoFilled = watchedEmail === DEMO_ADMIN.email && watchedPassword === DEMO_ADMIN.password;

  return (
    <form
      onSubmit={handleSubmit((data) => signIn.mutate(data))}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="EMAIL"
        type="email"
        placeholder="you@hostel.edu"
        leftAddon={<Mail className="h-3.5 w-3.5" strokeWidth={1.5} />}
        error={errors.email?.message}
        monospace
        autoComplete="email"
        {...register("email")}
      />
      <Input
        label="PASSWORD"
        type="password"
        placeholder="••••••••"
        leftAddon={<Lock className="h-3.5 w-3.5" strokeWidth={1.5} />}
        error={errors.password?.message}
        monospace
        autoComplete="current-password"
        {...register("password")}
      />

      <div className="flex items-center justify-between text-mono text-[10px] uppercase tracking-[0.18em]">
        <label className="inline-flex items-center gap-2 text-fg-subtle">
          <input
            type="checkbox"
            className="h-3 w-3 appearance-none rounded-none border border-line bg-surface checked:border-signal checked:bg-signal"
            defaultChecked
          />
          REMEMBER
        </label>
        <a href="#" className="text-fg-muted hover:text-signal">
          FORGOT_PASSWORD?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        block
        loading={isSubmitting || signIn.isPending}
        rightIcon={<ArrowRight className="h-3 w-3" strokeWidth={2} />}
        className={cn(signIn.isPending && "animate-glitch-x")}
      >
        SIGN IN
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-line" />
        </div>
        <span className="relative bg-ink-100 px-2 font-mono text-[9px] uppercase tracking-[0.22em] text-fg-subtle">
          OR
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="md"
        block
        onClick={handleDemoAdmin}
        loading={signIn.isPending && isDemoFilled}
        leftIcon={<KeyRound className="h-3 w-3" strokeWidth={1.5} />}
      >
        SIGN_IN_AS_DEMO_ADMIN
      </Button>

      <div className="rounded border border-line bg-surface-raised p-2 text-left font-mono text-[10px] tracking-wide text-fg-muted">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-signal">
          <KeyRound className="h-3 w-3" strokeWidth={1.5} /> DEMO_CREDENTIALS
        </div>
        <div className="mt-1 text-fg-subtle">
          <span className="text-fg-ghost">EMAIL</span> {DEMO_ADMIN.email}
        </div>
        <div className="text-fg-subtle">
          <span className="text-fg-ghost">PASS</span> {DEMO_ADMIN.password}
        </div>
      </div>

      <div className="text-center text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
        NEW HERE?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-signal hover:underline"
        >
          CREATE_ACCOUNT →
        </button>
      </div>
    </form>
  );
}
