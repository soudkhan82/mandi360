import Link from "next/link";

export default function LogisticsHero() {
  return (
    <section className="relative overflow-hidden border-b border-emerald-500/10 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Logistics Marketplace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Find trucks, pickups, loaders and cold-chain transport for agri
            trade.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Connect with verified transport providers for mandi movement, farm
            pickup, city-to-city routes, refrigerated loads and loading support.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/post-ad"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              Post Logistics Service
            </Link>

            <Link
              href="/produce"
              className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:text-white"
            >
              Browse Produce
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Route Based
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              Source → Destination
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Vehicle Types
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              Pickup, Truck, Reefer
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Add-ons
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              Cold Chain + Loader
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
