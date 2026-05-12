import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClientServer } from "@/app/lib/supabase/server";

type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

const ROOT_ADMIN_EMAIL = "soudkhan82@gmail.com";

async function toggleAdminRole(formData: FormData) {
  "use server";

  const targetUserId = String(formData.get("targetUserId") || "");
  const makeAdmin = String(formData.get("makeAdmin") || "") === "true";

  if (!targetUserId) return;

  const supabase = await createClientServer();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/auth/login?next=/admin/users");
  }

  const { data: me } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("id", currentUser.id)
    .maybeSingle();

  const isRootAdmin =
    currentUser.email?.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  if (me?.role !== "admin" && !isRootAdmin) {
    redirect("/");
  }

  const { data: targetUser } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (!targetUser) return;

  const targetIsRoot =
    targetUser.email?.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  if (!makeAdmin && targetIsRoot) {
    return;
  }

  if (!makeAdmin && targetUser.id === currentUser.id) {
    return;
  }

  await supabase
    .from("users")
    .update({ role: makeAdmin ? "admin" : "user" })
    .eq("id", targetUserId);

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/users");
  }

  const { data: me } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  const isRootAdmin =
    user.email?.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  if (me?.role !== "admin" && !isRootAdmin) {
    redirect("/");
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("id,email,full_name,role,is_active,created_at")
    .order("created_at", { ascending: false });

  const rows: AdminUserRow[] = users ?? [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Admin Users
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage platform users and assign admin access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/listings"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Review Listings
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-300">
            Signed in as{" "}
            <span className="font-medium text-white">
              {user.email || "Unknown user"}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Root admin email protected: {ROOT_ADMIN_EMAIL}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold">All Users</h2>
          </div>

          {error ? (
            <div className="p-5 text-sm text-red-400">
              Failed to load users. Please verify the{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-red-300">
                public.users
              </code>{" "}
              table contains these columns:{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-red-300">
                id, email, full_name, role, is_active, created_at
              </code>
              .
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-sm text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-4 font-medium">Name</th>
                    <th className="px-5 py-4 font-medium">Email</th>
                    <th className="px-5 py-4 font-medium">Role</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Created</th>
                    <th className="px-5 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const email = row.email || "—";
                    const isRoot =
                      row.email?.toLowerCase() ===
                      ROOT_ADMIN_EMAIL.toLowerCase();
                    const isAdmin = row.role === "admin" || isRoot;

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-800/80 hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">
                            {row.full_name || "Unnamed User"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            ID: {row.id}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-300">{email}</td>

                        <td className="px-5 py-4">
                          {isRoot ? (
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                              Root Admin
                            </span>
                          ) : isAdmin ? (
                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                              Admin
                            </span>
                          ) : (
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                              User
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {row.is_active === false ? (
                            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                              Inactive
                            </span>
                          ) : (
                            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {isRoot ? (
                            <span className="text-xs text-slate-500">
                              Protected
                            </span>
                          ) : isAdmin ? (
                            <form action={toggleAdminRole}>
                              <input
                                type="hidden"
                                name="targetUserId"
                                value={row.id}
                              />
                              <input
                                type="hidden"
                                name="makeAdmin"
                                value="false"
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                              >
                                Remove Admin
                              </button>
                            </form>
                          ) : (
                            <form action={toggleAdminRole}>
                              <input
                                type="hidden"
                                name="targetUserId"
                                value={row.id}
                              />
                              <input
                                type="hidden"
                                name="makeAdmin"
                                value="true"
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                              >
                                Make Admin
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
