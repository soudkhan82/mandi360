import Link from "next/link";

const modules = [
  {
    title: "Produce",
    href: "/post-ad/produce",
    description: "Sell fruits, vegetables, crops and fresh farm produce.",
    disabled: true,
  },
  {
    title: "Logistics",
    href: "/post-ad/logistics",
    description: "Offer transport, loading, cold chain and delivery services.",
    disabled: true,
  },
  {
    title: "Consultants",
    href: "/post-ad/consultants",
    description: "Offer crop, farm, soil and agri business consulting.",
    disabled: true,
  },
  {
    title: "Agri Inputs",
    href: "/post-ad/agri-inputs",
    description: "Sell seeds, fertilizers, pesticides, machinery and tools.",
    disabled: true,
  },
  {
    title: "Buyers",
    href: "/post-ad/buyers",
    description: "Post purchase requirements for agri products.",
    disabled: false,
  },
  {
    title: "Labour & Packaging",
    href: "/post-ad/labour-packaging",
    description: "Offer labour, packing, grading and handling services.",
    disabled: true,
  },
];

export default function PostAdPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-slate-950">Post Free Ad</h1>
        <p className="mt-1 text-sm text-slate-600">
          Select a marketplace module.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((item) => {
            const card = (
              <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <h2 className="text-xl font-black text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>

                <div className="mt-5 text-sm font-bold text-green-700">
                  {item.disabled ? "Coming soon" : "Continue →"}
                </div>
              </div>
            );

            if (item.disabled) {
              return (
                <div key={item.title} className="opacity-60">
                  {card}
                </div>
              );
            }

            return (
              <Link key={item.title} href={item.href}>
                {card}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
