import { createClientServer } from "@/app/config/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("buyer_listings")
    .select(
      "id,title,buyer_type,product_needed,quantity,city,phone,status,created_at",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const listings = data ?? [];

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-slate-950">
          Admin Approval Queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review pending marketplace listings.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border bg-white p-6 text-red-600">
            {error.message}
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-8 text-center">
            <h2 className="text-lg font-black text-slate-950">
              No pending listings
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Approval queue is clear.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {listings.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      Buyers
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.product_needed}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.city}</td>
                    <td className="px-4 py-3 text-slate-700">{item.phone}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <form action="/admin/action" method="post">
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="action" value="approve" />
                          <button
                            type="submit"
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                        </form>

                        <form action="/admin/action" method="post">
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="action" value="reject" />
                          <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
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
      </section>
    </main>
  );
}
