import Image from "next/image";
import Link from "next/link";
import { createClientServer } from "@/app/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ListingRow = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  status: string | null;
  image_urls?: string[] | string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  created_at: string | null;
};

function formatQuantity(value: number | null, unit: string | null) {
  if (value == null) return "Not provided";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function formatPrice(value: number | null, unit: string | null) {
  if (value == null) return "Price not provided";
  return `PKR ${value}${unit ? ` / ${unit}` : ""}`;
}

function normalizeImages(imageUrls: ListingRow["image_urls"]): string[] {
  if (!imageUrls) return [];

  if (Array.isArray(imageUrls)) {
    return imageUrls.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
  }

  if (typeof imageUrls === "string" && imageUrls.trim()) {
    return [imageUrls];
  }

  return [];
}

export default async function ProduceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("produce_listings")
    .select(
      `
      id,
      user_id,
      title,
      slug,
      description,
      quantity,
      quantity_unit,
      price_per_unit,
      price_unit,
      status,
      image_urls,
      contact_name,
      contact_phone,
      created_at
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return (
      <main className="min-h-screen bg-[#020817] px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
          <h1 className="text-2xl font-bold text-rose-300">
            Listing detail query failed
          </h1>
          <p className="mt-3 text-sm text-rose-200">Slug: {slug}</p>
          <p className="mt-2 text-sm text-rose-200">
            Supabase error: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const listing = data as ListingRow | null;

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#020817] px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h1 className="text-2xl font-bold text-amber-300">
            No listing found for this slug
          </h1>
          <p className="mt-3 text-sm text-amber-200">Slug from URL: {slug}</p>
        </div>
      </main>
    );
  }

  const isOwner = !!user && user.id === listing.user_id;
  const isAdmin =
    !!user &&
    (user.email === "soudkhan82@gmail.com" ||
      user.user_metadata?.role === "admin");

  const normalizedStatus = (listing.status || "").toLowerCase();
  const isPublic =
    normalizedStatus === "published" || normalizedStatus === "approved";

  if (!isPublic && !isOwner && !isAdmin) {
    return (
      <main className="min-h-screen bg-[#020817] px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
          <h1 className="text-2xl font-bold text-cyan-300">
            Access check blocked this listing
          </h1>
          <div className="mt-4 space-y-2 text-sm text-cyan-100">
            <p>Slug: {slug}</p>
            <p>Status in DB: {listing.status || "(null)"}</p>
            <p>Listing user_id: {listing.user_id}</p>
            <p>Logged in user_id: {user?.id || "(no server user)"}</p>
            <p>Logged in email: {user?.email || "(none)"}</p>
            <p>isOwner: {String(isOwner)}</p>
            <p>isAdmin: {String(isAdmin)}</p>
            <p>isPublic: {String(isPublic)}</p>
          </div>
        </div>
      </main>
    );
  }

  const images = normalizeImages(listing.image_urls);
  const primaryImage = images[0] || null;
  const galleryImages = images.slice(1);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/my-listings"
            className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-emerald-400 hover:text-white"
          >
            ← Back to My Listings
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#081224]">
              <div className="relative aspect-[16/10] w-full bg-white/5">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/40">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="rounded-3xl border border-white/10 bg-[#081224] p-4">
                <div className="mb-3 text-sm font-semibold text-white/80">
                  More Images
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={image}
                          alt={`${listing.title} image ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#081224] p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <div className="mt-3">
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    {listing.status ?? "unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-white/50">
                  Quantity
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {formatQuantity(listing.quantity, listing.quantity_unit)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-white/50">
                  Price
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {formatPrice(listing.price_per_unit, listing.price_unit)}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wide text-white/50">
                Description
              </div>
              <p className="mt-3 whitespace-pre-line text-white/90">
                {listing.description?.trim() || "No description provided."}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wide text-white/50">
                Contact
              </div>
              <div className="mt-3 space-y-2 text-white/90">
                <p>
                  <span className="text-white/50">Name:</span>{" "}
                  {listing.contact_name || "Not provided"}
                </p>
                <p>
                  <span className="text-white/50">Phone:</span>{" "}
                  {listing.contact_phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wide text-white/50">
                Images Uploaded
              </div>
              <p className="mt-3 text-white/90">{images.length}</p>
            </div>

            <div className="mt-5 text-sm text-white/50">
              Created:{" "}
              {listing.created_at
                ? new Date(listing.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Unknown"}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
