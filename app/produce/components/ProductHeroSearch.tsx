"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  cities: string[];
  categories: string[];
};

export default function ProductHeroSearch({ cities, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const helperSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return categories
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, categories]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (city) params.set("city", city);
    if (category) params.set("category", category);

    router.push(`${pathname}?${params.toString()}`);
  };

  const selectSuggestion = (value: string) => {
    setSearch(value);
    setShowSuggestions(false);
  };

  return (
    <div className="mt-8 w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/80 p-3 backdrop-blur">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative md:col-span-1">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => {
                setShowSuggestions(false);
              }, 120);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search produce..."
            className="h-11 w-full rounded-xl bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-400"
          />

          {search.trim() && showSuggestions && helperSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl">
              {helperSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (blurTimeoutRef.current) {
                      clearTimeout(blurTimeoutRef.current);
                    }
                    selectSuggestion(item);
                  }}
                >
                  <span>{item}</span>
                  <span className="text-xs text-slate-500">Use</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-11 rounded-xl bg-slate-950 px-3 text-sm text-white"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-xl bg-slate-950 px-3 text-sm text-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="h-11 rounded-xl bg-emerald-400 font-medium text-slate-950 transition hover:bg-emerald-300"
        >
          Find
        </button>
      </div>
    </div>
  );
}
