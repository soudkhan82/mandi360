"use client";

import { createClientBrowser } from "@/app/lib/supabase/browser";

type Props = {
  nextPath?: string;
  label?: string;
};

export default function GoogleSignInButton({
  nextPath = "/",
  label = "Continue with Google",
}: Props) {
  async function handleLogin() {
    try {
      const supabase = createClientBrowser();

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        nextPath,
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch {
      alert("Unable to start Google sign-in.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
    >
      {label}
    </button>
  );
}
