import Link from "next/link";

const adTypes = [
  {
    title: "Sell Produce",
    description:
      "Post fruits, vegetables, grains or mandi produce with quantity, price and crop details.",
    href: "/post-ad/produce",
    badge: "Produce",
  },
  {
    title: "Offer Logistics",
    description:
      "Post pickup, truck, reefer, loader or route-based transport service.",
    href: "/logistics/post",
    badge: "Transport",
  },
  {
    title: "Agri Inputs",
    description:
      "Post seeds, fertilizers, pesticides, tools, machinery parts or supplier items.",
    href: "/agri-inputs/post",
    badge: "Inputs",
  },
  {
    title: "Services / Consultants",
    description:
      "Post labour, packaging, agri consultancy, harvesting or support services.",
    href: "/services/post",
    badge: "Services",
  },
];

export default function PostAdSelectorPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Create Marketplace Listing
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            What do you want to post?
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Choose the correct ad type so the form matches the right database
            table and business segment.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {adTypes.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-emerald-500/50"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {item.badge}
                </span>

                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 transition group-hover:border-emerald-400 group-hover:text-white">
                  Open Form →
                </span>
              </div>

              <h2 className="text-xl font-bold text-white">{item.title}</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm font-semibold text-white">Route logic</p>

          <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-emerald-300">/post-ad</span> =
              choose listing type
            </p>
            <p>
              <span className="font-semibold text-emerald-300">
                /post-ad/produce
              </span>{" "}
              = produce form
            </p>
            <p>
              <span className="font-semibold text-emerald-300">
                /logistics/post
              </span>{" "}
              = logistics form
            </p>
            <p>
              <span className="font-semibold text-emerald-300">
                /agri-inputs/post
              </span>{" "}
              = agri inputs form later
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
