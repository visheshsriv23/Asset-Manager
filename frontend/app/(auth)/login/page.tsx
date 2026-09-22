"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Check, Box, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;

      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      if (keepSignedIn) {
        localStorage.setItem("token", access_token);
      } else {
        sessionStorage.setItem("token", access_token);
      }

      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#062423]">
      {/* Left Panel: Branding & Value Proposition */}
      <div
        className="relative flex flex-2 flex-col justify-between p-8 sm:p-12 lg:p-16 text-white overflow-hidden"
        style={{
            backgroundColor: "#031514",
            backgroundImage: `
            radial-gradient(circle 600px at 75% 85%, #0d5f57 0%, #06312e 45%, transparent 100%),
            radial-gradient(circle 800px at 50% 100%, #094741 0%, transparent 70%),
            linear-gradient(135deg, #021110 0%, #031c1a 50%, #062b28 100%)
            `,
        }}
        >
        {/* Ambient Corner Flare */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10">
            {/* Logo & Brand Header */}
            <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e5852] border border-emerald-400/20 text-emerald-300 shadow-inner">
                <Box className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
                <h2 className="text-base font-semibold tracking-tight leading-none text-white">
                AssetDesk
                </h2>
                <p className="text-[10px] font-medium tracking-widest text-emerald-400/80 uppercase mt-1">
                ABM • INTERNAL
                </p>
            </div>
            </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 my-16 md:my-0 max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            Every asset, in <br />
            one place.
            </h1>
            <p className="mt-5 text-sm sm:text-base text-emerald-100/70 font-normal leading-relaxed">
            Track configuration, billing, condition and full assignment history —
            no more spreadsheets.
            </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-3.5 pt-4 text-xs sm:text-sm text-emerald-100/90 font-medium">
            <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5]" />
            <span>Live dashboard of what&apos;s available</span>
            </div>
            <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5]" />
            <span>Complete assignment history</span>
            </div>
            <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5]" />
            <span>Invoice records attached to each asset</span>
            </div>
        </div>
        </div>

      {/* Right Panel: Sign In Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-sm space-y-7">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in
            </h2>
            <p className="mt-2 text-xs text-slate-500 font-normal">
              Welcome back. Use your work account.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="mt-1.5 w-full rounded-md border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-700 focus:ring-1 focus:ring-teal-700 pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none font-medium">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-700 focus:ring-0"
                />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 transition"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-md bg-[#0f766e] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115e59] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 font-normal">
            Single-user internal workspace • ABM Technologies
          </p>
        </div>
      </div>
    </div>
  );
}