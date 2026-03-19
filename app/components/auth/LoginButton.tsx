"use client";

import { createClientBrowser } from "@/app/config/supabase-client";

type Props = {
  next?: string;
  label?: string;
};

export default function LoginButton({
  next = "/",
  label = "Continue with Google",
}: Props) {
  async function handleLogin() {
    const supabase = createClientBrowser();

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
    >
      {label}
    </button>
  );
}
