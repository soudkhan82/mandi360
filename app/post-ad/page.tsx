import Link from "next/link";
import { getAllModules } from "@/app/lib/marketplace/modules";

const descriptions: Record<string, string> = {
  produce: "Sell fruits, vegetables, crops and fresh farm produce.",
  logistics: "Offer transport, loading, cold chain and delivery services.",
  consultants: "Offer crop, farm, soil and agri-business consulting.",
  "agri-inputs": "Sell seeds, fertilizers, pesticides, tools and farm inputs.",
};

export default function PostAdPage() {
  const modules = getAllModules();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">Create Listing</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            What do you want to post?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Select a marketplace module. All modules now use the same
            standardized submission flow.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.key}
              href={module.postPath}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-700">
                {module.label.slice(0, 1)}
              </div>

              <h2 className="text-xl font-black text-slate-950">
                {module.label}
              </h2>

              <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-500">
                {descriptions[module.key]}
              </p>

              <div className="mt-5 text-sm font-black text-emerald-700">
                Continue →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
