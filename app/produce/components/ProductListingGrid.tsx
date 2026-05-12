import Image from "next/image";
import Link from "next/link";

type Listing = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  created_at: string | null;
  image_urls?: string[] | string | null;
};

type ProductListingGridProps = {
  listings: Listing[];
};

function getPreviewImage(imageUrls: Listing["image_urls"]) {
  if (!imageUrls) return null;

  if (Array.isArray(imageUrls)) {
    return (
      imageUrls.find(
        (url): url is string =>
          typeof url === "string" && url.trim().length > 0,
      ) || null
    );
  }

  if (typeof imageUrls === "string" && imageUrls.trim()) {
    return imageUrls;
  }

  return null;
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProductListingGrid({
  listings,
}: ProductListingGridProps) {
  if (!listings?.length) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#050b18] p-10 text-center text-slate-400">
        No produce listings found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((item) => {
        const preview = getPreviewImage(item.image_urls);

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-3xl border border-slate-800 bg-[#050b18] shadow-2xl"
          >
            <div className="relative h-60 w-full bg-slate-900">
              {preview ? (
                <Image
                  src={preview}
                  alt={item.title || "Listing image"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No image available
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="line-clamp-1 text-2xl font-bold text-white">
                {item.title || "Untitled"}
              </h3>

              <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                {item.description || "No description available"}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-300">
                  {item.quantity ?? "-"} {item.quantity_unit || ""}
                </p>

                <p className="font-semibold text-emerald-400">
                  PKR {item.price_per_unit ?? "-"}
                  {item.price_unit ? `/${item.price_unit}` : ""}
                </p>

                <p className="text-slate-500">{formatDate(item.created_at)}</p>
              </div>

              {item.slug ? (
                <Link
                  href={`/produce/${item.slug}`}
                  className="mt-5 inline-flex items-center text-cyan-400 transition hover:text-cyan-300"
                >
                  View →
                </Link>
              ) : (
                <span className="mt-5 inline-flex items-center text-slate-500">
                  No link
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
