import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";
import { getListingPreviewUrl } from "@/app/lib/listing-image";

type ListingRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  status: string | null;
  created_at: string | null;
  image_urls: string[] | string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClasses(status: string | null) {
  const s = (status || "").toLowerCase();

  if (s === "published") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (s === "rejected") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }
  if (s === "paused") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
}

export default async function MyListingsPage() {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("produce_listings")
    .select(
      `
      id,
      title,
      slug,
      description,
      quantity,
      quantity_unit,
      price_per_unit,
      price_unit,
      status,
      created_at,
      image_urls
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#020817] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">
          Failed to load listings: {error.message}
        </div>
      </main>
    );
  }

  const listings = (data || []) as ListingRow[];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#020817] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="mt-2 text-sm text-slate-400">
              View and manage your submitted ads
            </p>
          </div>

          <Link
            href="/post-ad"
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Post New Ad
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-[#050b18] p-10 text-center shadow-2xl">
            <h2 className="text-xl font-semibold text-white">
              No listings yet
            </h2>
            <p className="mt-2 text-slate-400">
              You have not posted any ads yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => {
              const preview = getListingPreviewUrl(item);

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-[#050b18] shadow-2xl"
                >
                  <div className="relative h-56 w-full bg-slate-900">
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
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="line-clamp-1 text-xl font-semibold text-white">
                        {item.title || "Untitled Listing"}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClasses(
                          item.status,
                        )}`}
                      >
                        {item.status || "draft"}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-slate-300">
                      {item.description || "No description available"}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-black/30 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Quantity
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {item.quantity ?? "-"} {item.quantity_unit || ""}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-black/30 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Price
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          PKR {item.price_per_unit ?? "-"}
                          {item.price_unit ? ` / ${item.price_unit}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-400">
                      Created: {formatDate(item.created_at)}
                    </div>

                    <div className="mt-5 flex gap-3">
                      <Link
                        href={`/my-listings/${item.id}/edit`}
                        className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Edit
                      </Link>

                      {item.slug && item.status === "published" && (
                        <Link
                          href={`/produce/${item.slug}`}
                          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
                        >
                          View Live
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
