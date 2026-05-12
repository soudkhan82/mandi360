import Link from "next/link";
import { createClientServer } from "@/app/lib/supabase/server";

export default async function AppHeader() {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = "";
  let role = "user";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    fullName =
      profile?.full_name ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      "User";

    role = profile?.role || "user";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#101827]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-white"
        >
          Agribusiness 360
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white">
                {fullName}
              </div>

              <Link
                href="/"
                className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Home
              </Link>

              <Link
                href="/my-listings"
                className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                My Listings
              </Link>

              {role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Admin
                </Link>
              )}

              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Home
              </Link>

              <Link
                href="/auth/login"
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
