import Link from "next/link";
import { createClientServer } from "@/app/config/supabase-server";
import { getListingPreviewUrl } from "@/app/lib/listing-image";
import type { MarketplaceModule } from "@/app/lib/marketplace/modules";
import { getModuleConfig } from "@/app/lib/marketplace/modules";

type Props = {
  module: MarketplaceModule;
};

function money(value: unknown) {
  if (value === null || value === undefined || value === "") return "Ask price";

  const num = Number(value);

  if (Number.isNaN(num)) return "Ask price";

  return `Rs ${num.toLocaleString("en-PK")}`;
}

function getListingType(listing: Record<string, any>, fallback: string) {
  return (
    listing.category ||
    listing.service_type ||
    listing.vehicle_type ||
    listing.input_type ||
    listing.consulting_type ||
    fallback
  );
}

export default async function ModuleBrowsePage({ module }: Props) {
  const config = getModuleConfig(module);

  if (!config) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-white p-8 text-red-700">
          Invalid marketplace module.
        </div>
      </main>
    );
  }

  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from(config.table)
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`${config.label} browse fetch error:`, error.message);
  }

  const listings = data || [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-emerald-700">Marketplace</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              {config.label}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Browse approved {config.label.toLowerCase()} advertisements.
            </p>
          </div>

          <Link
            href={config.postPath}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-700"
          >
            Post {config.label} Ad
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-900">
              No ads available yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Once admin approves {config.label.toLowerCase()} ads, they will
              appear here.
            </p>

            <Link
              href={config.postPath}
              className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
            >
              Create First Ad
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing: Record<string, any>) => {
              const image = getListingPreviewUrl(listing);
              const listingType = getListingType(listing, config.label);

              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.slug}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-44 bg-slate-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={listing.title || "Listing image"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                        No image
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
                      {config.label}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {listing.city || "Unknown city"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                        {money(listing.price)}
                      </span>
                    </div>

                    <h2 className="mt-3 line-clamp-1 text-base font-black text-slate-950">
                      {listing.title || "Untitled listing"}
                    </h2>

                    <p className="mt-1 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                      {listing.description || "No description available."}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="line-clamp-1 text-sm font-bold text-slate-700">
                        {listingType}
                      </span>

                      <span className="text-xs font-black text-emerald-700">
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
