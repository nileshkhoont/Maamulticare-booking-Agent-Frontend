"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBanner } from "@/components/common/error-banner";
import { useLogin } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api-client";
import { siteConfig } from "@/config/site";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginForm) {
    login.mutate(values, {
      onSuccess: () => {
        const next = searchParams.get("next") ?? "/";
        router.push(next);
      },
    });
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <Card className="w-full overflow-hidden border-none shadow-xl shadow-primary/10">
        {/* Brand accent bar — a quiet nod to the logo's own red-into-teal palette, rather than a
            plain single-color strip. */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary to-secondary" />
        <CardHeader className="items-center pb-2 pt-8 text-center">
          <div className="relative mb-3 flex h-24 w-24 items-center justify-center">
            {/* Soft brand-colored glow behind the logo, instead of the logo just sitting flat on
                the card — same red/teal pairing as the accent bar above. */}
            <div
              className="absolute inset-[-18px] rounded-full bg-gradient-to-br from-primary/40 via-primary/15 to-secondary/40 blur-lg"
              aria-hidden="true"
            />
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <Image src="/assets/logo-mark.png" alt="" width={96} height={96} className="h-full w-full object-cover" priority />
            </div>
          </div>
          <CardTitle className="text-lg font-semibold text-foreground">{siteConfig.name}</CardTitle>
          <p className="text-xs text-muted-foreground">Welcome back — sign in to the admin portal</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            {login.isError && (
              <ErrorBanner
                message={login.error instanceof ApiError ? login.error.message : "Login failed"}
              />
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={login.isPending} className="mt-2">
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <a
        href="https://www.movya.com/"
        target="_blank"
        rel="noopener noreferrer"
        title="Powered by Movya"
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Image src="/assets/movya-mark.png" alt="" width={24} height={24} className="rounded-full" />
        <span>
          Powered by <span className="font-semibold">Movya</span>
        </span>
      </a>
    </div>
  );
}
