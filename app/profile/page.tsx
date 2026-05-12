import { redirect } from "next/navigation";
import Link from "next/link";
import { createClientServer } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

type PageProps = {
  searchParams?: Promise<{
    updated?: string;
    error?: string;
  }>;
};

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName || null,
    phone: phone || null,
  });

  if (profileError) {
    redirect(`/profile?error=${encodeURIComponent(profileError.message)}`);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      name: fullName,
      phone,
    },
  });

  if (authError) {
    redirect(`/profile?error=${encodeURIComponent(authError.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/post-ad");

  redirect("/profile?updated=1");
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ||
    String(
      user.user_metadata?.full_name || user.user_metadata?.name || "",
    ).trim();

  const phone =
    profile?.phone ||
    String(user.user_metadata?.phone || user.phone || "").trim();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-2 text-sm text-slate-400">
              View and update your profile details.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
          >
            Back
          </Link>
        </div>

        {params.updated === "1" ? (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Profile updated successfully.
          </div>
        ) : null}

        {params.error ? (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {decodeURIComponent(params.error)}
          </div>
        ) : null}

        <form
          action={updateProfile}
          className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              value={user.email || ""}
              disabled
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>
            <input
              name="full_name"
              defaultValue={fullName}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Phone Number
            </label>
            <input
              name="phone"
              defaultValue={phone}
              placeholder="03XX-XXXXXXX"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Save Changes
            </button>

            <Link
              href="/my-listings"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
            >
              My Listings
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
