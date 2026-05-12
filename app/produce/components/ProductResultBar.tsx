"use client";

import { useSearchParams } from "next/navigation";

type Props = {
  count: number;
};

export default function ProductResultsBar({ count }: Props) {
  const params = useSearchParams();

  const search = params.get("search");
  const city = params.get("city");
  const category = params.get("category");

  const activeFilters = [search, city, category].filter(Boolean);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-300">
        <span className="font-semibold text-white">{count}</span> listings found
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              Search: {search}
            </span>
          )}
          {city && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {city}
            </span>
          )}
          {category && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
