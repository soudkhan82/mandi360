import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";
import AuthUserBadge from "@/app/auth/components/AuthUserBadge";
import LogoutButton from "@/app/auth/components/LogoutButton";

export default async function AccountPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">My Account</h1>
            <p className="mt-2 text-slate-400">
              Manage your profile and marketplace activity.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <AuthUserBadge />
        </div>
      </div>
    </main>
  );
}
