import Link from "next/link";
import { notFound } from "next/navigation";
import { createClientServer } from "@/app/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, any>;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function pick(row: AnyRow, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value);
    }
  }
  return fallback;
}

function getImages(row: AnyRow) {
  if (Array.isArray(row.image_urls)) return row.image_urls.filter(Boolean);
  if (Array.isArray(row.images)) return row.images.filter(Boolean);
  if (row.image_url) return [row.image_url];
  if (row.cover_image) return [row.cover_image];
  return [];
}

async function findListingBySlug(slug: string) {
  const supabase = await createClientServer();

  const { data: produce } = await supabase
    .from("produce_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (produce) {
    return {
      moduleKey: "produce",
      moduleLabel: "Produce",
      row: produce as AnyRow,
    };
  }

  const { data: buyer } = await supabase
    .from("buyer_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (buyer) {
    return {
      moduleKey: "buyers",
      moduleLabel: "Buyers",
      row: buyer as AnyRow,
    };
  }

  return null;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const result = await findListingBySlug(slug);

  if (!result) {
    notFound();
  }

  const { moduleKey, moduleLabel, row } = result;

  const title = pick(row, ["title", "buyer_title", "requirement_title"]);
  const city = pick(row, ["city", "location"]);
  const phone = pick(row, ["phone", "mobile", "contact", "contact_number"]);
  const description = pick(row, ["description", "details", "requirement"], "");
  const status = pick(row, ["status"], "pending");
  const images = getImages(row);

  const product =
    moduleKey === "produce"
      ? [row.crop, row.variety].filter(Boolean).join(" / ") ||
        pick(row, ["product", "product_name", "category"])
      : pick(row, [
          "product",
          "product_name",
          "required_product",
          "requirement",
          "category",
          "description",
          "details",
        ]);

  const price = pick(row, ["price", "expected_price", "budget"], "");
  const quantity = pick(row, ["quantity", "required_quantity", "qty"], "");
  const unit = pick(row, ["unit", "uom"], "");

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
              {moduleLabel} Listing
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>

            <p className="mt-1 text-sm text-slate-600">{product}</p>
          </div>

          <Link
            href="/my-listings"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-50"
          >
            Back to My Listings
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={title}
                className="h-[420px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">
                No image uploaded
              </div>
            )}

            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2 p-3">
                {images.slice(1, 5).map((img: string, index: number) => (
                  <img
                    key={`${img}-${index}`}
                    src={img}
                    alt={`${title} ${index + 2}`}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">Ad Details</h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">
                {status}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <Info label="Module" value={moduleLabel} />
              <Info label="Product" value={product} />
              <Info label="City" value={city} />
              <Info label="Phone" value={phone} />

              {quantity || unit ? (
                <Info
                  label="Quantity"
                  value={`${quantity || "-"} ${unit || ""}`.trim()}
                />
              ) : null}

              {price ? <Info label="Price" value={`Rs ${price}`} /> : null}
            </div>

            {description ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {description}
                </p>
              </div>
            ) : null}

            {phone !== "-" ? (
              <a
                href={`tel:${phone}`}
                className="mt-6 block rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-green-700"
              >
                Call Seller / Buyer
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value || "-"}</p>
    </div>
  );
}
