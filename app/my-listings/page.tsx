import Link from "next/link";
import { createClientServer } from "@/app/config/supabase-server";

export const dynamic = "force-dynamic";

type MyBuyerListing = {
  id: string;
  title: string;
  slug: string;
  buyer_type: string;
  product_needed: string;
  city: string;
  status: string;
  created_at: string;
};

export default async function MyListingsPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-xl border bg-white p-6">
          <h1 className="text-xl font-black text-slate-950">Login required</h1>
          <Link href="/auth/login" className="mt-3 inline-block text-sm font-bold text-green-700">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("buyer_listings")
    .select("id,title,slug,buyer_type,product_needed,city,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as MyBuyerListing[];

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-950">My Listings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your submitted ads and approval status.
            </p>
          </div>

          <Link
            href="/post-ad"
            className="rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Post Ad
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border bg-white p-6 text-red-600">
            {error.message}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <h2 className="text-lg font-black text-slate-950">No listings yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your submitted ads will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {listings.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-semibold text-slate-700">Buyers</td>
                    <td className="px-4 py-3 font-bold text-slate-950">{item.title}</td>
                    <td className="px-4 py-3 text-slate-700">{item.product_needed}</td>
                    <td className="px-4 py-3 text-slate-700">{item.city}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/listing/${item.slug}`}
                        className="font-bold text-green-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}