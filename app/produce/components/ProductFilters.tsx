"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  cities: string[];
  categories: string[];
};

export default function ProductFilters({ cities, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentCity = searchParams.get("city") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const [search, setSearch] = useState(currentSearch);

  const hasFilters = useMemo(() => {
    return !!(currentSearch || currentCity || currentCategory);
  }, [currentSearch, currentCity, currentCategory]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <form onSubmit={onSearchSubmit} className="md:col-span-2">
          <input
            type="text"
            placeholder="Search produce..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-400"
          />
        </form>

        <select
          value={currentCity}
          onChange={(e) => updateParams("city", e.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none"
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={currentCategory}
          onChange={(e) => updateParams("category", e.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSearchSubmit}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          Apply Search
        </button>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
