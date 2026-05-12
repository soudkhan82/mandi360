"use client";

import { createClientBrowser } from "@/app/lib/supabase/browser";

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClientBrowser();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#020817] px-4 py-16 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-[#050b18] p-8 shadow-2xl">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-3 text-slate-400">
          Continue with your Google account to post and manage listings.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
