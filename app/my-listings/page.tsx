import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, any>;

type ModuleKey =
  | "buyers"
  | "produce"
  | "logistics"
  | "consultants"
  | "agri-inputs";

type MyListing = {
  id: string;
  module: string;
  moduleKey: ModuleKey;
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

  return row.image_url || row.cover_image || row.first_image || null;
}

function statusClass(status: string) {
  if (status === "published") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "draft") return "bg-slate-100 text-slate-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function mapRows({
  rows,
  module,
  moduleKey,
  productKeys,
}: {
  rows: AnyRow[] | null;
  module: string;
  moduleKey: ModuleKey;
  productKeys: string[];
}): MyListing[] {
  return (rows || []).map((item) => ({
    id: item.id,
    module,
    moduleKey,
    title: pick(item, ["title", "buyer_title", "requirement_title"]),
    product: pick(item, productKeys),
    city: pick(item, ["city", "location", "service_area"]),
    status: pick(item, ["status"], "pending").toLowerCase(),
    slug: item.slug || null,
    created_at: item.created_at || null,
    coverImage: getCoverImage(item),
  }));
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

  const [
    buyersResult,
    produceResult,
    logisticsResult,
    consultantsResult,
    inputsResult,
  ] = await Promise.all([
    supabase
      .from("buyer_listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("produce_listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("logistics_listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("service_listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("input_supplier_listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const firstError =
    buyersResult.error ||
    produceResult.error ||
    logisticsResult.error ||
    consultantsResult.error ||
    inputsResult.error;

  if (firstError) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {firstError.message}
          </div>
        </section>
      </main>
    );
  }

  const listings = [
    ...mapRows({
      rows: buyersResult.data,
      module: "Buyers",
      moduleKey: "buyers",
      productKeys: [
        "product_needed",
        "product",
        "product_name",
        "required_product",
        "requirement",
        "description",
      ],
    }),

    ...mapRows({
      rows: produceResult.data,
      module: "Produce",
      moduleKey: "produce",
      productKeys: [
        "crop",
        "variety",
        "product",
        "product_name",
        "description",
      ],
    }),

    ...mapRows({
      rows: logisticsResult.data,
      module: "Logistics",
      moduleKey: "logistics",
      productKeys: [
        "vehicle_type",
        "service_type",
        "category",
        "service_category",
        "description",
      ],
    }),

    ...mapRows({
      rows: consultantsResult.data,
      module: "Consultants",
      moduleKey: "consultants",
      productKeys: [
        "service_type",
        "service_category",
        "consulting_type",
        "category",
        "description",
      ],
    }),

    ...mapRows({
      rows: inputsResult.data,
      module: "Agri Inputs",
      moduleKey: "agri-inputs",
      productKeys: [
        "category",
        "brand_name",
        "input_type",
        "product_name",
        "description",
      ],
    }),
  ].sort((a, b) => {
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
              Manage all your submitted ads, approvals, edits and deletion.
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
                <th className="px-4 py-3 text-left">Product / Type</th>
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
                  <tr key={`${item.moduleKey}-${item.id}`} className="border-t">
                    <td className="px-4 py-3">
                      {item.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
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
