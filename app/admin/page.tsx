import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type AdminListing = {
  id: string;
  module: string;
  table: string;
  title: string;
  slug: string;
  status: string | null;
  created_at: string | null;
  image_urls: string[] | null;
  user_id: string | null;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

async function fetchPendingListings(): Promise<AdminListing[]> {
  const queries = await Promise.all([
    supabaseAdmin
      .from("produce_listings")
      .select("id,title,slug,status,created_at,image_urls,user_id")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("logistics_listings")
      .select("id,title,slug,status,created_at,image_urls,user_id")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("service_listings")
      .select("id,title,slug,status,created_at,image_urls,user_id")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("input_supplier_listings")
      .select("id,title,slug,status,created_at,image_urls,user_id")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const [produce, logistics, services, inputs] = queries;

  if (produce.error) console.error("Produce admin fetch error:", produce.error);
  if (logistics.error)
    console.error("Logistics admin fetch error:", logistics.error);
  if (services.error)
    console.error("Services admin fetch error:", services.error);
  if (inputs.error) console.error("Inputs admin fetch error:", inputs.error);

  const rows: AdminListing[] = [
    ...(produce.data || []).map((item) => ({
      ...item,
      module: "Produce",
      table: "produce_listings",
    })),
    ...(logistics.data || []).map((item) => ({
      ...item,
      module: "Logistics",
      table: "logistics_listings",
    })),
    ...(services.data || []).map((item) => ({
      ...item,
      module: "Consultants",
      table: "service_listings",
    })),
    ...(inputs.data || []).map((item) => ({
      ...item,
      module: "Agri Inputs",
      table: "input_supplier_listings",
    })),
  ];

  return rows.sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const db = b.created_at ? new Date(b.created_at).getTime() : 0;
    return db - da;
  });
}

export default async function AdminPage() {
  const listings = await fetchPendingListings();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Admin Approval Queue
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Review pending marketplace listings.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              No pending listings
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Approval queue is clear.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const coverImage =
                listing.image_urls && listing.image_urls.length > 0
                  ? listing.image_urls[0]
                  : "/images/placeholder.jpg";

              return (
                <div
                  key={`${listing.table}-${listing.id}`}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[140px_1fr_auto]"
                >
                  <div className="h-28 overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        Pending
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {listing.module}
                      </span>
                    </div>

                    <h2 className="truncate text-xl font-extrabold text-slate-950">
                      {listing.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Table: {listing.table}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Created:{" "}
                      {listing.created_at
                        ? new Date(listing.created_at).toLocaleString()
                        : "N/A"}
                    </p>

                    <div className="mt-3">
                      <Link
                        href={`/listing/${listing.slug}`}
                        className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        View listing
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:flex-col md:items-stretch md:justify-center">
                    <form action="/admin/action" method="POST">
                      <input type="hidden" name="id" value={listing.id} />
                      <input type="hidden" name="table" value={listing.table} />
                      <input type="hidden" name="action" value="approve" />

                      <button
                        type="submit"
                        className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                      >
                        Approve
                      </button>
                    </form>

                    <form action="/admin/action" method="POST">
                      <input type="hidden" name="id" value={listing.id} />
                      <input type="hidden" name="table" value={listing.table} />
                      <input type="hidden" name="action" value="reject" />

                      <button
                        type="submit"
                        className="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white hover:bg-rose-600"
                      >
                        Reject
                      </button>
                    </form>

                    <form action={`/admin/${listing.id}/reject`} method="POST">
                      <input type="hidden" name="table" value={listing.table} />
                      <button
                        type="submit"
                        className="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white hover:bg-rose-600"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
