import Link from "next/link";

const segments = [
  {
    title: "Produce",
    href: "/produce",
    eyebrow: "BROWSE PRODUCE",
    description: "Fruits, vegetables, crops and fresh farm produce.",
    image:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Logistics",
    href: "/logistics",
    eyebrow: "FIND LOGISTICS",
    description: "Transport, loading, cold chain and delivery services.",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Consultants",
    href: "/consultants",
    eyebrow: "FIND EXPERTS",
    description: "Crop, farm, soil and agri business consultants.",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Agri Inputs",
    href: "/agri-inputs",
    eyebrow: "BROWSE INPUTS",
    description: "Seeds, fertilizers, pesticides, machinery and tools.",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Buyers",
    href: "/buyers",
    eyebrow: "VIEW BUYERS",
    description: "Bulk buyers, traders and purchase requirements.",
    image:
      "https://images.unsplash.com/photo-1601593768791-9d0a2e6b2f9d?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Labour & Packaging",
    href: "/labour-packaging",
    eyebrow: "FIND SERVICES",
    description: "Farm labour, packing, grading and handling services.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
  },
];

export default function MarketPlaceSegments() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Explore Marketplace
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Select a category and browse approved listings.
          </p>
        </div>

        <Link
          href="/post-ad"
          className="rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
        >
          Post Ad
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => (
          <Link
            key={segment.title}
            href={segment.href}
            className="group grid grid-cols-[135px_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="h-32 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={segment.image}
                alt={segment.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex min-h-32 flex-col justify-between p-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {segment.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {segment.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400">
                  {segment.eyebrow}
                </span>
                <span className="text-sm font-black text-green-700 group-hover:translate-x-1 transition">
                  View →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-green-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Want to sell produce or offer agri services?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Post your ad and manage it from your account.
            </p>
          </div>

          <Link
            href="/post-ad"
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Post Your Ad
          </Link>
        </div>
      </div>
    </section>
  );
}
