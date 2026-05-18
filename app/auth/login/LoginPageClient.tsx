"use client";

import { useSearchParams } from "next/navigation";
import { createClientBrowser } from "@/app/lib/supabase/browser";

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function handleGoogleLogin() {
    const supabase = createClientBrowser();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          window.location.origin
        }/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#020817] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Sign in</h1>

        <p className="mb-6 text-sm text-slate-400">
          Continue with Google to post listings and manage your account.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black hover:bg-emerald-400"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
