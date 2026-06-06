import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Building2, Hash, GraduationCap, ArrowRight } from "lucide-react";
import { signUpSchema, type SignUpInput } from "./authService";
import { useSignUp } from "./useAuth";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const HOSTELS = [
  { value: "NC 1", label: "NC 1 · North Campus 1" },
  { value: "NC 2", label: "NC 2 · North Campus 2" },
  { value: "NC 3", label: "NC 3 · North Campus 3" },
  { value: "NC 4", label: "NC 4 · North Campus 4" },
  { value: "NC 5", label: "NC 5 · North Campus 5" },
  { value: "NC 6", label: "NC 6 · North Campus 6" },
  { value: "Zakir A", label: "Zakir A · Zakir Hostel A" },
  { value: "Zakir B", label: "Zakir B · Zakir Hostel B" },
  { value: "Zakir C", label: "Zakir C · Zakir Hostel C" },
  { value: "Zakir D", label: "Zakir D · Zakir Hostel D" },
];

export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      hostel: "",
      room: "",
      yearOfStudy: undefined as unknown as number,
      course: "",
    },
  });
  const signUp = useSignUp();

  return (
    <form
      onSubmit={handleSubmit((data) => signUp.mutate(data))}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="FULL NAME"
          placeholder="Ada Lovelace"
          leftAddon={<User className="h-3.5 w-3.5" strokeWidth={1.5} />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="USERNAME"
          placeholder="ada_x"
          leftAddon={<span className="font-mono text-[10px]">@</span>}
          error={errors.username?.message}
          monospace
          {...register("username")}
        />
      </div>

      <Input
        label="EMAIL"
        type="email"
        placeholder="ada@hostel.edu"
        leftAddon={<Mail className="h-3.5 w-3.5" strokeWidth={1.5} />}
        error={errors.email?.message}
        monospace
        autoComplete="email"
        {...register("email")}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="PASSWORD"
          type="password"
          placeholder="••••••••"
          leftAddon={<Lock className="h-3.5 w-3.5" strokeWidth={1.5} />}
          error={errors.password?.message}
          monospace
          autoComplete="new-password"
          {...register("password")}
        />
        <Input
          label="CONFIRM"
          type="password"
          placeholder="••••••••"
          leftAddon={<Lock className="h-3.5 w-3.5" strokeWidth={1.5} />}
          error={errors.confirmPassword?.message}
          monospace
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="HOSTEL"
          options={[{ value: "", label: "Select your hostel" }, ...HOSTELS]}
          leftAddon={<Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
          error={errors.hostel?.message}
          {...register("hostel")}
        />
        <Input
          label="ROOM (OPTIONAL)"
          placeholder="B-204"
          leftAddon={<Hash className="h-3.5 w-3.5" strokeWidth={1.5} />}
          error={errors.room?.message}
          monospace
          {...register("room")}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="YEAR"
          options={[
            { value: "", label: "Select year" },
            { value: "1", label: "1st year" },
            { value: "2", label: "2nd year" },
            { value: "3", label: "3rd year" },
            { value: "4", label: "4th year" },
            { value: "5", label: "5th year" },
          ]}
          leftAddon={<GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />}
          error={errors.yearOfStudy?.message}
          {...register("yearOfStudy")}
        />
        <Input
          label="COURSE (OPTIONAL)"
          placeholder="B.Tech CSE"
          error={errors.course?.message}
          {...register("course")}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        block
        loading={isSubmitting || signUp.isPending}
        rightIcon={<ArrowRight className="h-3 w-3" strokeWidth={2} />}
        className={cn(signUp.isPending && "animate-glitch-x")}
      >
        CREATE ACCOUNT
      </Button>

      <div className="text-center text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
        ALREADY ON THE FLOOR?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-signal hover:underline"
        >
          SIGN IN →
        </button>
      </div>
    </form>
  );
}
