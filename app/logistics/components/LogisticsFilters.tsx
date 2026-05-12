import { LOGISTICS_VEHICLE_TYPES } from "@/app/lib/marketplace/logistics/fetch";
import type { LogisticsCityOption } from "@/app/lib/marketplace/logistics/types";

type Props = {
  cities: LogisticsCityOption[];
  current: {
    search: string;
    city: string;
    vehicleType: string;
    coldChain: string;
  };
};

export default function LogisticsFilters({ cities, current }: Props) {
  return (
    <section className="border-b border-slate-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <input
            name="search"
            defaultValue={current.search}
            placeholder="Search logistics, route, vehicle..."
            className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
          />

          <select
            name="city"
            defaultValue={current.city}
            className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">All service cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          <select
            name="vehicleType"
            defaultValue={current.vehicleType}
            className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">All vehicles</option>
            {LOGISTICS_VEHICLE_TYPES.map((vehicle) => (
              <option key={vehicle.value} value={vehicle.value}>
                {vehicle.label}
              </option>
            ))}
          </select>

          <select
            name="coldChain"
            defaultValue={current.coldChain}
            className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">Cold chain: Any</option>
            <option value="yes">Cold chain only</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-black transition hover:bg-emerald-400"
            >
              Search
            </button>

            <a
              href="/logistics"
              className="grid h-11 place-items-center rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              Reset
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
