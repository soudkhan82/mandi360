import Link from "next/link";
import { notFound } from "next/navigation";
import { createClientServer } from "@/app/config/supabase-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
  status: string;
  image_urls: string[] | null;
  created_at: string;
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("buyer_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const item = data as BuyerListing;

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/buyers"
          className="text-sm font-bold text-green-700 hover:underline"
        >
          ← Back to Buyers
        </Link>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-72 bg-slate-100">
            {item.image_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_urls[0]}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                Buyer Requirement
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Buyers
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {item.buyer_type}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {item.city}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                {item.status}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-950">{item.title}</h1>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Product Needed" value={item.product_needed} />
              <Info label="Quantity" value={item.quantity || "Not specified"} />
              <Info label="City" value={item.city} />
              <Info label="Phone" value={item.phone} />
            </div>

            {item.description ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="mb-2 text-sm font-black uppercase text-slate-500">
                  Description
                </h2>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                  {item.description}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              <a
                href={`tel:${item.phone}`}
                className="inline-flex rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
              >
                Call Buyer
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-black uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-950">{value}</div>
    </div>
  );
}
