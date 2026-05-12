import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClientServer } from "@/app/lib/supabase/server";

const ROOT_ADMIN_EMAIL = "soudkhan82@gmail.com";

type ListingRow = {
  id: string;
  title: string | null;
  description: string | null;
  city_id: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  quantity: number | null;
  status: string | null;
  created_at: string | null;
  slug: string | null;
  user_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
};

async function updateListingStatus(formData: FormData) {
  "use server";

  const listingId = String(formData.get("listingId") || "");
  const nextStatus = String(formData.get("nextStatus") || "");

  if (!listingId || !nextStatus) return;

  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/listings");
  }

  const { data: me, error: meError } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  if (meError) {
    throw new Error(`Failed to verify admin user: ${meError.message}`);
  }

  const isRootAdmin =
    user.email?.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  if (me?.role !== "admin" && !isRootAdmin) {
    redirect("/");
  }

  const { error: updateError } = await supabase
    .from("produce_listings")
    .update({ status: nextStatus })
    .eq("id", listingId);

  if (updateError) {
    throw new Error(`Failed to update listing status: ${updateError.message}`);
  }

  revalidatePath("/admin/listings");
  revalidatePath("/my-listings");
  revalidatePath("/");
}

export default async function AdminListingsPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/listings");
  }

  const { data: me, error: meError } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  if (meError) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-red-400">
          Failed to verify admin user: {meError.message}
        </div>
      </main>
    );
  }

  const isRootAdmin =
    user.email?.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  if (me?.role !== "admin" && !isRootAdmin) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("produce_listings")
    .select(
      `
      id,
      title,
      description,
      city_id,
      price_per_unit,
      price_unit,
      quantity,
      status,
      created_at,
      slug,
      user_id,
      contact_name,
      contact_phone
    `,
    )
    .in("status", ["pending", "rejected"])
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as ListingRow[];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Admin Listings Review
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Review, approve, and reject marketplace listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Manage Users
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
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Listings Requiring Review</h2>
          </div>

          {error ? (
            <div className="p-5 text-sm text-red-400">
              Failed to load listings: {error.message}
            </div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-sm text-slate-400">
              No pending or rejected listings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-4 font-medium">Listing</th>
                    <th className="px-5 py-4 font-medium">Seller</th>
                    <th className="px-5 py-4 font-medium">City ID</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 font-medium">Qty</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Created</th>
                    <th className="px-5 py-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {listings.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-800/80 align-top hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">
                          {item.title || "Untitled Listing"}
                        </div>
                        <div className="mt-1 line-clamp-2 max-w-sm text-xs text-slate-400">
                          {item.description || "No description"}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          ID: {item.id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-white">
                          {item.contact_name || "Unknown Seller"}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {item.contact_phone || "No phone"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {item.city_id || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {item.price_per_unit != null
                          ? `${item.price_per_unit} / ${item.price_unit || ""}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {item.quantity ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        {item.status === "rejected" ? (
                          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                            Rejected
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <form action={updateListingStatus}>
                            <input
                              type="hidden"
                              name="listingId"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="nextStatus"
                              value="published"
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                            >
                              Approve
                            </button>
                          </form>

                          {item.status !== "rejected" && (
                            <form action={updateListingStatus}>
                              <input
                                type="hidden"
                                name="listingId"
                                value={item.id}
                              />
                              <input
                                type="hidden"
                                name="nextStatus"
                                value="rejected"
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                              >
                                Reject
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
