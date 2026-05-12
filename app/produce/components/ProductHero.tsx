import Link from "next/link";
import ProductHeroSearch from "./ProductHeroSearch";

const segments = [
  { name: "Produce", href: "/produce", active: true },
  { name: "Logistics", href: "/logistics" },
  { name: "Labour & Packaging", href: "/labour-packaging" },
  { name: "Consultants", href: "/consultants" },
  { name: "Agri Inputs", href: "/agri-inputs" },
  { name: "Buyers", href: "/buyers" },
];

type Props = {
  cities: string[];
  categories: string[];
};

export default function ProductHero({ cities, categories }: Props) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[28px] border border-white/10">
      <div
        className="relative min-h-[460px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/Mandi.png')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/38" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/28 to-slate-950/45" />

        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-7xl flex-col px-6 py-8 md:px-10">
          <div className="flex flex-wrap gap-3">
            {segments.map((segment) => (
              <Link
                key={segment.name}
                href={segment.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  segment.active
                    ? "bg-emerald-400/95 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.18)]"
                    : "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {segment.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-emerald-300 md:text-sm">
              Agribusiness 360 Marketplace
            </p>

            <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-white md:text-4xl md:leading-[1.2]">
              Search produce, agri services, logistics and inputs across
              Pakistan
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
              A digital mandi connecting farmers, wholesalers, consultants,
              suppliers, labour providers and buyers in one modern agri
              marketplace.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/post-ad"
                className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
              >
                Post Listing
              </Link>

              <Link
                href="/produce"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Browse Produce
              </Link>
            </div>

            <ProductHeroSearch cities={cities} categories={categories} />
          </div>
        </div>
      </div>
    </section>
  );
}
