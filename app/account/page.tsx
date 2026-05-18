import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "User";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Account
              </p>

              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                {displayName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                User ID
              </p>
              <p className="mt-2 break-all text-sm text-slate-800">{user.id}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Login Provider
              </p>
              <p className="mt-2 text-sm text-slate-800">
                {user.app_metadata?.provider || "email"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Home
            </Link>

            <Link
              href="/my-listings"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              My Listings
            </Link>

            <Link
              href="/post-ad"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Post Ad
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
