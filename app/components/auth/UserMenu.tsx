"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClientBrowser } from "@/app/lib/supabase/browser";
import { useAuthStore } from "@/app/lib/store/auth-store";
import { isAdminUser } from "@/app/lib/auth/admin";

export default function UserMenu() {
  const router = useRouter();
  const supabase = createClientBrowser();

  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const initials =
    user.full_name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  const isAdmin = isAdminUser(user.email, user.role);

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      clearUser();
      setOpen(false);

      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("Logout error:", error.message);
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Unexpected logout error:", err);
      router.replace("/");
      router.refresh();
    } finally {
      setTimeout(() => setIsLoggingOut(false), 800);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-black">
          {initials}
        </div>
        <span className="hidden text-sm font-medium sm:block">
          {user.full_name || user.email}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="border-b border-slate-800 px-4 py-4">
            <div className="text-sm font-semibold text-white">
              {user.full_name || "User"}
            </div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-white hover:bg-slate-900"
            >
              Profile
            </Link>

            <Link
              href="/my-listings"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-white hover:bg-slate-900"
            >
              My Listings
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-white hover:bg-slate-900"
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="block w-full px-4 py-3 text-left text-sm text-rose-400 hover:bg-slate-900 disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
