import Image from "next/image";
import Link from "next/link";
import { createClientServer } from "@/app/lib/supabase/server";

type ConsultantRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  city: string | null;
  category: string | null;
  service_type: string | null;
  service_area: string | null;
  coverage_area: string | null;
  price: number | null;
  price_amount: number | null;
  price_unit: string | null;
  years_of_experience: number | null;
  team_size: number | null;
  experience: string | null;
  availability_notes: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  phone: string | null;
  whatsapp: string | null;
  image_urls: string[] | null;
  created_at: string | null;
};

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    city?: string;
    category?: string;
  }>;
};

function clean(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function firstImage(images: string[] | null) {
  return Array.isArray(images) && images.length > 0 ? images[0] : null;
}

function money(amount: number | null, unit: string | null) {
  if (amount === null || amount === undefined) return "Price on request";
  return `PKR ${Number(amount).toLocaleString()}${unit ? `/${unit}` : ""}`;
}

function uniqueValues(rows: ConsultantRow[], key: keyof ConsultantRow) {
  return Array.from(
    new Set(rows.map((row) => clean(row[key])).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

export default async function ConsultantsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

  const search = clean(params.search).toLowerCase();
  const city = clean(params.city);
  const category = clean(params.category);

  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("service_listings")
    .select(
      `
      id,
      title,
      slug,
      description,
      city,
      category,
      service_type,
      service_area,
      coverage_area,
      price,
      price_amount,
      price_unit,
      years_of_experience,
      team_size,
      experience,
      availability_notes,
      contact_name,
      contact_phone,
      contact_whatsapp,
      phone,
      whatsapp,
      image_urls,
      created_at
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const rows = ((data ?? []) as ConsultantRow[]).filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.city,
      item.category,
      item.service_type,
      item.service_area,
      item.coverage_area,
      item.experience,
      item.availability_notes,
      item.contact_name,
    ]
      .map(clean)
      .join(" ")
      .toLowerCase();

    const searchOk = !search || haystack.includes(search);
    const cityOk = !city || clean(item.city) === city;
    const categoryOk = !category || clean(item.category) === category;

    return searchOk && cityOk && categoryOk;
  });

  const allRows = (data ?? []) as ConsultantRow[];
  const cities = uniqueValues(allRows, "city");
  const categories = uniqueValues(allRows, "category");

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[#050918]">
          <div className="relative min-h-[280px] px-6 py-10 md:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_35%)]" />
            <div className="relative z-10 max-w-3xl">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.45em] text-emerald-400">
                Agribusiness 360 Consultants
              </p>

              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Find agri consultants and farm advisory experts
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-sky-100/75">
                Browse approved consultants for crop advisory, soil guidance,
                farm planning, spraying support, harvest planning and expert
                agricultural services.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/post-ad/consultants"
                  className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-300"
                >
                  Post Consultant Ad
                </Link>

                <Link
                  href="/post-ad"
                  className="rounded-full border border-slate-600 bg-black/30 px-5 py-3 text-sm font-bold text-white transition hover:border-emerald-400"
                >
                  All Post Options
                </Link>
              </div>
            </div>
          </div>

          <form
            action="/consultants"
            className="border-t border-slate-800 bg-black/30 p-4"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_120px]">
              <input
                name="search"
                defaultValue={params.search ?? ""}
                placeholder="Search consultants, advisory, crop, city..."
                className="h-11 rounded-2xl border border-slate-700 bg-[#050918] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              />

              <select
                name="city"
                defaultValue={params.city ?? ""}
                className="h-11 rounded-2xl border border-slate-700 bg-[#050918] px-4 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option value="">All cities</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                name="category"
                defaultValue={params.category ?? ""}
                className="h-11 rounded-2xl border border-slate-700 bg-[#050918] px-4 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button className="h-11 rounded-2xl bg-emerald-400 text-sm font-black text-black transition hover:bg-emerald-300">
                Find
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Consultant Listings</h2>
            <p className="mt-1 text-xs text-slate-400">
              Showing {rows.length} approved consultant listing
              {rows.length === 1 ? "" : "s"}.
            </p>
          </div>

          {(params.search || params.city || params.category) && (
            <Link
              href="/consultants"
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300"
            >
              Clear Filters
            </Link>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">
            {error.message}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-slate-800 bg-[#050918] p-10 text-center text-sm text-slate-400">
            No approved consultants found yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((item) => {
              const img = firstImage(item.image_urls);
              const price = money(
                item.price ?? item.price_amount,
                item.price_unit,
              );

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-[#050918] transition hover:-translate-y-0.5 hover:border-emerald-400/40"
                >
                  <div className="relative h-44 bg-slate-950">
                    {img ? (
                      <Image
                        src={img}
                        alt={item.title || "Consultant listing"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-600">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                        {item.category || "Consultant"}
                      </span>
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                        {item.city || "Pakistan"}
                      </span>
                    </div>

                    <h2 className="line-clamp-1 text-lg font-black text-white">
                      {item.title || "Untitled consultant"}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-sky-100/65">
                      {item.description || "No description provided."}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <Info label="Type" value={item.service_type || "—"} />
                      <Info label="Price" value={price} />
                      <Info
                        label="Experience"
                        value={
                          item.years_of_experience
                            ? `${item.years_of_experience} years`
                            : item.experience || "—"
                        }
                      />
                      <Info
                        label="Coverage"
                        value={item.coverage_area || item.service_area || "—"}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-300">
                          {item.contact_name || "Contact consultant"}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                          {item.phone ||
                            item.contact_phone ||
                            item.whatsapp ||
                            item.contact_whatsapp ||
                            "Phone hidden"}
                        </div>
                      </div>

                      {item.slug && (
                        <Link
                          href={`/listing/service/${item.slug}`}
                          className="shrink-0 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-black"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-semibold text-slate-200">
        {value}
      </div>
    </div>
  );
}
