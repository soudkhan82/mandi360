import Image from "next/image";
import Link from "next/link";
import {
  formatPriceUnit,
  formatVehicleType,
} from "@/app/lib/marketplace/logistics/fetch";
import type { LogisticsListing } from "@/app/lib/marketplace/logistics/types";

type Props = {
  listings: LogisticsListing[];
};

function formatMoney(value: number | null, unit: string | null | undefined) {
  if (value === null || value === undefined) return "Rate on call";

  return `PKR ${Number(value).toLocaleString("en-PK")} / ${formatPriceUnit(
    unit,
  )}`;
}

function formatCapacity(value: number | null, unit: string | null | undefined) {
  if (value === null || value === undefined) return "Capacity not specified";
  return `${Number(value).toLocaleString("en-PK")} ${formatPriceUnit(unit)}`;
}

function formatDateRange(from: string | null, until: string | null) {
  if (!from && !until) return "Availability flexible";
  if (from && !until) return `Available from ${from}`;
  if (!from && until) return `Available until ${until}`;
  return `${from} to ${until}`;
}

function getPrimaryImage(listing: LogisticsListing) {
  const images = [...(listing.logistics_listing_images ?? [])];

  const primary =
    images.find((image) => image.is_primary) ??
    images.sort((a, b) => a.sort_order - b.sort_order)[0];

  return primary?.public_url ?? null;
}

export default function LogisticsListingGrid({ listings }: Props) {
  if (!listings.length) {
    return (
      <section className="bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
            <p className="text-lg font-bold text-white">
              No logistics listings found
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Try changing filters or post a logistics service.
            </p>
            <Link
              href="/post-ad"
              className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400"
            >
              Post Logistics Service
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              Available Logistics
            </h2>
            <p className="text-sm text-slate-400">
              {listings.length} published transport listing
              {listings.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => {
            const imageUrl = getPrimaryImage(listing);
            const route =
              listing.source_city?.name && listing.destination_city?.name
                ? `${listing.source_city.name} → ${listing.destination_city.name}`
                : (listing.city?.name ?? "Route flexible");

            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/30 transition hover:border-emerald-500/40"
              >
                <div className="relative h-44 bg-slate-900">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_45%)]">
                      <div className="rounded-2xl border border-slate-800 bg-black/40 px-4 py-3 text-center">
                        <p className="text-sm font-bold text-white">
                          Logistics
                        </p>
                        <p className="text-xs text-slate-400">
                          No image uploaded
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur">
                    {formatVehicleType(listing.vehicle_type)}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="line-clamp-2 text-lg font-bold text-white">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      {route}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-black p-3">
                      <p className="text-xs text-slate-500">Capacity</p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {formatCapacity(
                          listing.capacity_value,
                          listing.capacity_unit,
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-black p-3">
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {formatMoney(listing.rate_amount, listing.rate_unit)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-black p-3">
                    <p className="text-xs text-slate-500">Availability</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {formatDateRange(
                        listing.available_from,
                        listing.available_until,
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {listing.cold_chain_available && (
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        Cold Chain
                      </span>
                    )}

                    {listing.loader_available && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                        Loader Available
                      </span>
                    )}

                    {!listing.cold_chain_available &&
                      !listing.loader_available && (
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                          Standard Transport
                        </span>
                      )}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {listing.contact_name || "Contact provider"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {listing.contact_phone ||
                          listing.contact_whatsapp ||
                          "Contact details available"}
                      </p>
                    </div>

                    {listing.contact_whatsapp || listing.contact_phone ? (
                      <a
                        href={
                          listing.contact_whatsapp
                            ? `https://wa.me/${listing.contact_whatsapp.replace(
                                /\D/g,
                                "",
                              )}`
                            : `tel:${listing.contact_phone}`
                        }
                        target={listing.contact_whatsapp ? "_blank" : undefined}
                        rel={
                          listing.contact_whatsapp
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400"
                      >
                        Contact
                      </a>
                    ) : (
                      <span className="shrink-0 rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-400">
                        Contact
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
