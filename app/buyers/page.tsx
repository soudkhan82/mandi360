import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type BuyerListing = {
  id: string;
  title: string;
  slug: string;
  buyer_type: string;
  product_needed: string;
  quantity: string | null;
  city: string;
  phone: string;
  description: string | null;
  image_urls: string[] | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function BuyersPage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("buyer_listings")
    .select(
      "id,title,slug,buyer_type,product_needed,quantity,city,phone,description,image_urls,created_at",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
        <section className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-red-600">
            Buyers failed to load
          </h1>
          <p className="mt-2 text-sm text-slate-700">{error.message}</p>
        </section>
      </main>
    );
  }

  const items = (data ?? []) as BuyerListing[];

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Buyers</h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse approved buyer requirements from traders, wholesalers and
              businesses.
            </p>
          </div>

          <Link
            href="/post-ad/buyers"
            className="rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Post Buyer Requirement
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              No buyer requirements yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Approved buyer listings will appear here.
            </p>

            <Link
              href="/post-ad/buyers"
              className="mt-5 inline-flex rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Post First Buyer Requirement
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const image = item.image_urls?.[0];

              return (
                <Link
                  key={item.id}
                  href={`/listing/${item.slug}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-40 bg-slate-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                        Buyer Requirement
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        {item.buyer_type}
                      </span>

                      <span className="text-xs font-bold text-slate-500">
                        {item.city}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-lg font-black text-slate-950">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-700">
                      Needed:{" "}
                      <span className="font-bold">{item.product_needed}</span>
                    </p>

                    {item.quantity ? (
                      <p className="mt-1 text-sm text-slate-600">
                        Quantity:{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </p>
                    ) : null}

                    {item.description ? (
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                        {item.description}
                      </p>
                    ) : null}

                    <div className="mt-4 text-sm font-black text-green-700">
                      View Details →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
