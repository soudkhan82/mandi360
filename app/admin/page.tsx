import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, any>;

type AdminListing = {
  id: string;
  table: string;
  module: string;
  title: string;
  productType: string;
  city: string;
  status: string;
  slug: string | null;
  created_at: string | null;
};

const LISTING_SOURCES = [
  {
    module: "Buyers",
    table: "buyer_listings",
    typeFields: ["product_type", "product", "category", "crop_type"],
  },
  {
    module: "Produce",
    table: "produce_listings",
    typeFields: ["product_type", "produce_type", "category", "crop_type"],
  },
  {
    module: "Logistics",
    table: "logistics_listings",
    typeFields: ["vehicle_type", "service_type", "logistics_type", "category"],
  },
  {
    module: "Consultants",
    table: "service_listings",
    typeFields: [
      "service_type",
      "consultancy_type",
      "expertise",
      "category",
      "category_name",
    ],
  },
  {
    module: "Agri Inputs",
    table: "agri_input_listings",
    typeFields: ["input_type", "product_type", "category"],
  },
];

const ALLOWED_TABLES = LISTING_SOURCES.map((item) => item.table);

function pick(row: AnyRow, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row?.[key];

    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value);
    }
  }

  return fallback;
}

function normalizeListing(
  row: AnyRow,
  source: (typeof LISTING_SOURCES)[number],
): AdminListing {
  return {
    id: String(row.id),
    table: source.table,
    module: source.module,
    title: pick(row, ["title", "name", "ad_title"], "Untitled"),
    productType: pick(row, source.typeFields, "-"),
    city: pick(row, ["city", "city_name", "location"], "-"),
    status: pick(row, ["status"], "pending"),
    slug: row.slug ? String(row.slug) : null,
    created_at: row.created_at ? String(row.created_at) : null,
  };
}

async function getPendingListings(): Promise<AdminListing[]> {
  const supabase = await createClientServer();

  const results = await Promise.all(
    LISTING_SOURCES.map(async (source) => {
      const { data, error } = await supabase
        .from(source.table)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(`Admin queue skipped ${source.table}: ${error.message}`);
        return [];
      }

      return (data ?? []).map((row) => normalizeListing(row, source));
    }),
  );

  return results.flat().sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

async function approveListing(formData: FormData) {
  "use server";

  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");

  if (!ALLOWED_TABLES.includes(table) || !id) {
    throw new Error("Invalid approval request.");
  }

  const supabase = await createClientServer();

  const { error } = await supabase
    .from(table)
    .update({ status: "published" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/my-listings");
  revalidatePath("/");
  redirect("/admin");
}

async function rejectListing(formData: FormData) {
  "use server";

  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");

  if (!ALLOWED_TABLES.includes(table) || !id) {
    throw new Error("Invalid rejection request.");
  }

  const supabase = await createClientServer();

  const { error } = await supabase
    .from(table)
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/my-listings");
  revalidatePath("/");
  redirect("/admin");
}

export default async function AdminPage() {
  const listings = await getPendingListings();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          Admin Approval Queue
        </h1>

        <p className="mt-2 text-sm text-slate-700">
          Review pending marketplace listings.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {listings.length === 0 ? (
            <div className="flex min-h-[140px] flex-col items-center justify-center px-6 py-10 text-center">
              <h2 className="text-xl font-bold text-slate-950">
                No pending listings
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Approval queue is clear.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-4">Module</th>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Product / Type</th>
                    <th className="px-5 py-4">City</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {listings.map((item) => (
                    <tr key={`${item.table}-${item.id}`} className="bg-white">
                      <td className="px-5 py-5 font-bold text-slate-900">
                        {item.module}
                      </td>

                      <td className="px-5 py-5 font-bold text-slate-950">
                        {item.title}
                      </td>

                      <td className="px-5 py-5 text-slate-700">
                        {item.productType}
                      </td>

                      <td className="px-5 py-5 text-slate-700">{item.city}</td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          Pending
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-end gap-4">
                          {item.slug ? (
                            <Link
                              href={`/listing/${item.slug}`}
                              className="font-bold text-emerald-700 hover:text-emerald-800"
                            >
                              View
                            </Link>
                          ) : null}

                          <form action={approveListing}>
                            <input
                              type="hidden"
                              name="table"
                              value={item.table}
                            />
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="font-bold text-green-700 hover:text-green-800"
                            >
                              Approve
                            </button>
                          </form>

                          <form action={rejectListing}>
                            <input
                              type="hidden"
                              name="table"
                              value={item.table}
                            />
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="font-bold text-red-600 hover:text-red-700"
                            >
                              Reject
                            </button>
                          </form>
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
