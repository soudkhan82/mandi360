import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock3, User2, Package } from "lucide-react";
import type { ProduceListingCardItem } from "@/app/types/marketplace";

type Props = {
  listing: ProduceListingCardItem;
};

export default function ProductListingCard({ listing }: Props) {
  const formattedDate = new Date(listing.created_at).toLocaleDateString();

  return (
    <Link
      href={listing.slug ? `/produce/${listing.slug}` : "#"}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_18px_45px_rgba(16,185,129,0.14)]"
    >
      <div className="relative h-56 w-full overflow-hidden">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
            No image available
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {listing.category_name}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg">
            PKR {listing.price_per_unit}/{listing.price_unit}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-semibold text-white transition group-hover:text-emerald-300">
          {listing.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-6 text-slate-300">
          {listing.description ||
            "Fresh produce listing available for buyers and traders."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <div className="inline-flex items-center gap-1.5">
            <MapPin size={15} />
            <span>{listing.city_name}</span>
          </div>

          <div className="inline-flex items-center gap-1.5">
            <Clock3 size={15} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Package size={16} className="text-emerald-300" />
            <span>
              {listing.quantity} {listing.quantity_unit}
            </span>
          </div>

          {listing.contact_name ? (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User2 size={16} className="text-emerald-300" />
              <span className="line-clamp-1 max-w-[120px]">
                {listing.contact_name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-500">Verified listing</span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Active Listing
          </span>

          <span className="text-sm font-medium text-emerald-300 transition group-hover:text-emerald-200">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
