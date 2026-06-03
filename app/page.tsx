"use client";

import { useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Diamond,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Mic2,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MobileStep = "splash" | "intro" | "form";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mobileStep, setMobileStep] = useState<MobileStep>("splash");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileStep("intro"), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez reessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const activities = [
    { label: "Entrepreneuriat", icon: BriefcaseBusiness },
    { label: "Motivation", icon: Diamond },
    { label: "Vente", icon: UsersRound },
    { label: "Art oratoire", icon: Mic2 },
  ];

  const brandPanel = (
    <section className="flex min-h-screen flex-col justify-between bg-blue-800 px-6 py-8 text-white sm:px-10 lg:px-14">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-800 shadow-lg">
          <Diamond className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-normal">DiCe Management</h1>
          <p className="text-sm text-blue-100">Diamond Center</p>
        </div>
      </div>

      <div className="my-12 max-w-2xl">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-50">
          <GraduationCap className="h-4 w-4 text-amber-300" />
          Organisation de formations et conferences
        </div>
        <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
          Pilotez les activites DiCe avec clarte.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
          Une plateforme pour organiser les programmes, suivre les equipes,
          coordonner les conferences et accompagner les participants dans des
          domaines comme l&apos;entrepreneuriat, la motivation, la vente et l&apos;art
          oratoire.
        </p>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          {activities.map((activity) => (
            <div
              key={activity.label}
              className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4"
            >
              <activity.icon className="h-5 w-5 text-amber-300" />
              <span className="font-semibold text-white">{activity.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          onClick={() => setMobileStep("form")}
          className="h-12 w-full rounded-lg bg-white text-base font-semibold text-blue-800 hover:bg-blue-50 lg:hidden"
        >
          Se connecter
          <ArrowRight className="h-5 w-5" />
        </Button>
        <p className="text-sm text-blue-100">
          (c) 2026 DiCe Management. Tous droits reserves.
        </p>
      </div>
    </section>
  );

  const formPanel = (
    <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-9 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileStep("intro")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Retour
          </button>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white shadow-lg shadow-blue-700/20">
              <Diamond className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">DiCe Management</h1>
              <p className="text-sm text-slate-500">Diamond Center</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">Bienvenue</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Connexion</h2>
          <p className="mt-3 text-slate-500">
            Accedez a votre espace de gestion des formations et conferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Adresse email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 rounded-lg border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 rounded-lg border-slate-200 bg-slate-50 px-4 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600/20"
              />
              <button
                type="button"
                aria-label={
                  showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-blue-700 text-base font-semibold shadow-lg shadow-blue-700/20 hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {mobileStep === "splash" && (
        <section className="flex min-h-screen items-center justify-center bg-blue-800 text-white lg:hidden">
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-2xl bg-white text-blue-800 shadow-2xl shadow-blue-950/30">
              <Diamond className="h-12 w-12" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">DiCe</h1>
              <p className="mt-1 text-sm font-medium text-blue-100">
                Diamond Center Management
              </p>
            </div>
            <div className="h-1 w-28 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-1/2 animate-[slideIn_1.1s_ease-in-out_infinite] rounded-full bg-amber-300" />
            </div>
          </div>
        </section>
      )}

      <div className="hidden min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        {brandPanel}
        {formPanel}
      </div>

      {mobileStep === "intro" && <div className="lg:hidden">{brandPanel}</div>}
      {mobileStep === "form" && <div className="lg:hidden">{formPanel}</div>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
