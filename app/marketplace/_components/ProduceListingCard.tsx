import Link from "next/link";
import { MapPin, Clock3, Package2 } from "lucide-react";
import type { ProduceListingCard as ProduceListingCardType } from "@/app/types/marketplace";
import {
  formatPostedTime,
  formatPrice,
} from "@/public/images/categories/marketplace/format";

type Props = {
  listing?: ProduceListingCardType | null;
};

export default function ProduceListingCard({ listing }: Props) {
  if (!listing || !listing.id) return null;

  const cleanSlug = typeof listing.slug === "string" ? listing.slug.trim() : "";

  const href = cleanSlug
    ? `/marketplace/${cleanSlug}`
    : `/marketplace/id/${listing.id}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-50">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Package2 className="h-10 w-10" />
            <span className="text-sm font-medium">Produce listing</span>
          </div>
        </div>

        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            {listing.category ?? "Produce"}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-2 line-clamp-1 text-lg font-semibold text-slate-900">
          {listing.title}
        </div>

        <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <Package2 className="h-4 w-4 text-emerald-600" />
          <span>
            {listing.quantity ?? "-"} {listing.unit ?? ""}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold tracking-tight text-emerald-700">
            PKR {formatPrice(listing.price_per_unit)}
          </div>
          <div className="text-sm text-slate-500">
            per {listing.price_unit ?? listing.unit ?? "unit"}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{listing.city ?? "Unknown city"}</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock3 className="h-4 w-4 shrink-0" />
            <span>{formatPostedTime(listing.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
