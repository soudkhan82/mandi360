type Props = {
  cityIds: string[];
  categoryIds: string[];
  selectedCityId?: string;
  selectedCategoryId?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default function MarketPlaceFilters({
  cityIds,
  categoryIds,
  selectedCityId,
  selectedCategoryId,
  minPrice,
  maxPrice,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <p className="text-sm text-slate-500">
            Refine public marketplace listings
          </p>
        </div>

        <a
          href="/marketplace"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Clear
        </a>
      </div>

      <form method="GET" className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label
            htmlFor="cityId"
            className="text-sm font-medium text-slate-700"
          >
            City
          </label>
          <select
            id="cityId"
            name="cityId"
            defaultValue={selectedCityId ?? ""}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
          >
            <option value="">All cities</option>
            {cityIds.map((cityId) => (
              <option key={cityId} value={cityId}>
                {cityId}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="categoryId"
            className="text-sm font-medium text-slate-700"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={selectedCategoryId ?? ""}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
          >
            <option value="">All categories</option>
            {categoryIds.map((categoryId) => (
              <option key={categoryId} value={categoryId}>
                {categoryId}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="minPrice"
            className="text-sm font-medium text-slate-700"
          >
            Min price
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={minPrice ?? ""}
            placeholder="e.g. 100"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="maxPrice"
            className="text-sm font-medium text-slate-700"
          >
            Max price
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={maxPrice ?? ""}
            placeholder="e.g. 500"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Apply Filters
          </button>

          <span className="text-sm text-slate-500">
            Public browsing — no login required
          </span>
        </div>
      </form>
    </div>
  );
}
