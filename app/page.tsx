// app/page.tsx

import Image from "next/image";
import Link from "next/link";

const modules = [
  {
    title: "Produce",
    href: "/produce",
    image: "/images/categories/produce/mango.jpg",
    description: "Fruits, vegetables, crops and fresh farm produce.",
    count: "Browse produce",
  },
  {
    title: "Logistics",
    href: "/logistics",
    image: "/images/categories/logistics/logistics.jpg",
    description: "Transport, loading, cold chain and delivery services.",
    count: "Find logistics",
  },
  {
    title: "Consultants",
    href: "/consultants",
    image: "/images/categories/consultants/consultants.jpg",
    description: "Crop, farm, soil and agri business consultants.",
    count: "Find experts",
  },
  {
    title: "Agri Inputs",
    href: "/agri-inputs",
    image: "/images/categories/agri-inputs/agri-inputs.jpg",
    description: "Seeds, fertilizers, pesticides, machinery and tools.",
    count: "Browse inputs",
  },
  {
    title: "Buyers",
    href: "/buyers",
    image: "/images/categories/buyers/buyers.jpg",
    description: "Bulk buyers, traders and purchase requirements.",
    count: "View buyers",
  },
  {
    title: "Labour & Packaging",
    href: "/labour-packaging",
    image: "/images/categories/labour-packaging/labour-packaging.jpg",
    description: "Farm labour, packing, grading and handling services.",
    count: "Find services",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#222]">
      {/* Zameen-style top search strip */}
      <section className="border-b border-[#222] bg-[#111]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <div className="rounded-sm bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Purpose
              </p>
              <p className="mt-1 text-base font-medium text-gray-900">
                Buy / Sell
              </p>
            </div>

            <div className="rounded-sm bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                City
              </p>
              <p className="mt-1 text-base font-medium text-gray-900">
                All Cities
              </p>
            </div>

            <div className="rounded-sm bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Category
              </p>
              <p className="mt-1 text-base font-medium text-gray-900">
                Agricultural Marketplace
              </p>
            </div>

            <div className="rounded-sm bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Location
              </p>
              <p className="mt-1 text-base font-medium text-gray-900">
                Pakistan
              </p>
            </div>

            <Link
              href="/produce"
              className="flex items-center justify-center rounded-sm bg-[#2ca344] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#238738]"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-[#2ca344]">
              Mandi360 Agricultural Marketplace
            </div>

            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">
              Buy, sell and connect across Pakistan’s agri market.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              A clean marketplace for produce, logistics, consultants, agri
              inputs, buyers, labour and packaging services.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/post-ad"
                className="rounded-sm bg-[#2ca344] px-6 py-3 text-sm font-bold text-white hover:bg-[#238738]"
              >
                Post Free Ad
              </Link>

              <Link
                href="/produce"
                className="rounded-sm border border-[#2ca344] bg-white px-6 py-3 text-sm font-bold text-[#2ca344] hover:bg-green-50"
              >
                Browse Listings
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
            <div className="relative h-[260px] w-full">
              <Image
                src="/images/Mandi.png"
                alt="Mandi360"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4">
          {modules.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap border-b-4 border-transparent px-1 py-4 text-sm font-bold text-gray-800 hover:border-[#2ca344] hover:text-[#2ca344]"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Module cards */}
      <section className="mx-auto max-w-7xl px-4 py-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Explore Marketplace
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a category and browse approved listings.
            </p>
          </div>

          <Link
            href="/post-ad"
            className="hidden rounded-sm bg-[#2ca344] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#238738] sm:inline-flex"
          >
            Post Ad
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="grid grid-cols-[140px_1fr]">
                <div className="relative h-[135px] bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-h-[135px] flex-col justify-between p-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-950 group-hover:text-[#2ca344]">
                      {item.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {item.count}
                    </span>

                    <span className="text-sm font-bold text-[#2ca344]">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Compact bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex flex-col justify-between gap-4 rounded-sm border border-green-100 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-950">
              Want to sell produce or offer agri services?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Post your ad and manage it from your account.
            </p>
          </div>

          <Link
            href="/post-ad"
            className="rounded-sm bg-[#2ca344] px-6 py-3 text-center text-sm font-bold text-white hover:bg-[#238738]"
          >
            Post Your Ad
          </Link>
        </div>
      </section>
    </main>
  );
}
