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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setShowGooglePrompt(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl });
  };

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {showGooglePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">DiCe Management</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Continuer avec Google
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Connectez-vous rapidement avec votre compte Google pour acceder a
                  votre espace.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setShowGooglePrompt(false)}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="h-11 w-full rounded-lg bg-blue-700 text-base font-semibold hover:bg-blue-600"
            >
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-700">
                G
              </span>
              Continuer avec Google
            </Button>
            <button
              type="button"
              onClick={() => setShowGooglePrompt(false)}
              className="mt-4 w-full text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Utiliser mon email
            </button>
          </div>
        </div>
      )}

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between bg-blue-800 px-6 py-8 text-white sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-800 shadow-lg">
              <Diamond className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-normal">DiCe Management</h1>
              <p className="text-sm text-blue-100">Diamond Center</p>
            </div>
          </div>

          <div className="my-14 max-w-2xl">
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

          <p className="text-sm text-blue-100">
            (c) 2026 DiCe Management. Tous droits reserves.
          </p>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-9 lg:hidden">
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

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="mb-6 h-11 w-full rounded-lg border-slate-200 bg-white text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-blue-700">
                G
              </span>
              Continuer avec Google
            </Button>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase text-slate-400">
                ou avec email
              </span>
              <div className="h-px flex-1 bg-slate-200" />
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
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
      </div>
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
