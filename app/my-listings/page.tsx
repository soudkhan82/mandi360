import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, any>;

type MyListing = {
  id: string;
  module: "Buyers" | "Produce";
  moduleKey: "buyers" | "produce";
  title: string;
  product: string;
  city: string;
  status: string;
  slug: string | null;
  created_at: string | null;
  coverImage: string | null;
};

function pick(row: AnyRow, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value);
    }
  }
  return fallback;
}

function getCoverImage(row: AnyRow) {
  if (Array.isArray(row.image_urls) && row.image_urls.length > 0) {
    return row.image_urls[0];
  }

  if (Array.isArray(row.images) && row.images.length > 0) {
    return row.images[0];
  }

  return row.image_url || row.cover_image || null;
}

function statusClass(status: string) {
  if (status === "published") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-slate-100 text-slate-700";
  if (status === "draft") return "bg-slate-100 text-slate-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default async function MyListingsPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: buyerRows, error: buyerError } = await supabase
    .from("buyer_listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: produceRows, error: produceError } = await supabase
    .from("produce_listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (buyerError || produceError) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {buyerError?.message || produceError?.message}
          </div>
        </section>
      </main>
    );
  }

  const buyers: MyListing[] = (buyerRows || []).map((item: AnyRow) => ({
    id: item.id,
    module: "Buyers",
    moduleKey: "buyers",
    title: pick(item, ["title", "buyer_title", "requirement_title"]),
    product: pick(item, [
      "product",
      "product_name",
      "required_product",
      "requirement",
      "category",
      "description",
      "details",
    ]),
    city: pick(item, ["city", "location"]),
    status: pick(item, ["status"], "pending").toLowerCase(),
    slug: item.slug || null,
    created_at: item.created_at || null,
    coverImage: getCoverImage(item),
  }));

  const produce: MyListing[] = (produceRows || []).map((item: AnyRow) => ({
    id: item.id,
    module: "Produce",
    moduleKey: "produce",
    title: pick(item, ["title"]),
    product:
      [item.crop, item.variety].filter(Boolean).join(" / ") ||
      pick(item, ["product", "product_name", "description"]),
    city: pick(item, ["city", "location"]),
    status: pick(item, ["status"], "pending").toLowerCase(),
    slug: item.slug || null,
    created_at: item.created_at || null,
    coverImage: getCoverImage(item),
  }));

  const listings = [...buyers, ...produce].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const db = b.created_at ? new Date(b.created_at).getTime() : 0;
    return db - da;
  });

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-950">My Listings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your submitted ads and approval status.
            </p>
          </div>

          <Link
            href="/post-ad"
            className="rounded-lg bg-green-600 px-5 py-3 text-sm font-black text-white hover:bg-green-700"
          >
            Post Ad
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-24 px-4 py-3 text-left">Ad</th>
                <th className="px-4 py-3 text-left">Module</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={`${item.module}-${item.id}`} className="border-t">
                    <td className="px-4 py-3">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-800">
                      {item.module}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-950">
                      {item.title}
                    </td>

                    <td className="px-4 py-3 text-slate-700">{item.product}</td>

                    <td className="px-4 py-3 text-slate-700">{item.city}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        {item.slug ? (
                          <Link
                            href={`/listing/${item.slug}`}
                            className="font-black text-green-700 hover:text-green-800"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-slate-400">View</span>
                        )}

                        <Link
                          href={`/my-listings/${item.moduleKey}/${item.id}/edit`}
                          className="font-black text-slate-700 hover:text-slate-950"
                        >
                          Edit
                        </Link>

                        <form
                          action={`/my-listings/${item.moduleKey}/${item.id}/delete`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="font-black text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
