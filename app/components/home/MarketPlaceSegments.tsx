// app/components/home/MarketplaceSegments.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SegmentCard } from "@/app/config/marketplace-nav";

type Props = {
  segments: SegmentCard[];
};

export default function MarketplaceSegments({ segments }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Main Business Segments
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Navigate the marketplace by business category
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Clean category-based discovery for the complete agricultural value
          chain.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {segments.map((segment) => {
          const Icon = segment.icon;

          return (
            <Link
              key={segment.title}
              href={segment.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>

                {segment.badge ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {segment.badge}
                  </span>
                ) : null}
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {segment.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {segment.description}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                Open Segment
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
