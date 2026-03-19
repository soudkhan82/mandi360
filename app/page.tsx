// app/page.tsx
import Link from "next/link";
import {
  Wheat,
  ShieldCheck,
  Globe2,
  BadgeCheck,
  Search,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import MarketplaceSegments from "@/app/components/home/MarketPlaceSegments";
import {
  marketplaceSegments,
  marketplaceHighlights,
} from "@/app/config/marketplace-nav";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                Agri Marketplace
              </p>
              <p className="text-xs text-slate-500">
                Buy, sell, move, and support agricultural trade
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/produce"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Browse Listings
            </Link>
            <Link
              href="/buyers"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Buyers
            </Link>
            <Link
              href="/consultants"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Consultants
            </Link>
            <Link
              href="/post-listing"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Post Listing
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-lime-50" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-lime-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Public browsing • Login only for posting
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              The premium digital marketplace for the
              <span className="text-emerald-600">
                {" "}
                agri-business supply chain
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Explore produce, logistics, labour, packaging, agri inputs,
              consultants, and wholesale demand through one clean platform built
              for modern agricultural trade.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/produce"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/post-listing"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Post a Listing
                <PlusCircle className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Farmers & Sellers
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Buyers & Wholesalers
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Logistics & Services
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Marketplace Search
                  </p>
                  <p className="text-xs text-slate-500">
                    Public access for browsing listings
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Search className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-400">
                  Search produce, buyers, logistics...
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
                    City / Mandi
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
                    Segment
                  </div>
                </div>

                <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Explore Listings
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Mode</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Public Browsing
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700">Account Actions</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">
                    Google Login
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketplaceSegments segments={marketplaceSegments} />

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Why this platform
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Built for real agricultural commerce
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {marketplaceHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-slate-900 px-6 py-10 text-white shadow-2xl sm:px-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Start now
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Browse freely. Post when you’re ready.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                The platform is designed for instant exploration. Users only
                need to sign in when they want to create listings, manage posts,
                or access account-level actions.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/produce"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                Explore Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/post-listing"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Post Listing
                <PlusCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
