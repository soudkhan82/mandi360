import LogisticsFilters from "./components/LogisticsFilters";
import LogisticsHero from "./components/LogisticsHero";
import LogisticsListingGrid from "./components/LogisticsListingGrid";
import {
  fetchLogisticsFilterOptions,
  fetchLogisticsListings,
} from "@/app/lib/marketplace/logistics/fetch";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    city?: string;
    vehicleType?: string;
    coldChain?: string;
  }>;
};

export default async function LogisticsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

  const filters = {
    search: params.search ?? "",
    city: params.city ?? "",
    vehicleType: params.vehicleType ?? "",
    coldChain: params.coldChain ?? "",
  };

  const [listings, filterOptions] = await Promise.all([
    fetchLogisticsListings(filters),
    fetchLogisticsFilterOptions(),
  ]);

  return (
    <main className="min-h-screen bg-black text-white">
      <LogisticsHero />

      <LogisticsFilters cities={filterOptions.cities} current={filters} />

      <LogisticsListingGrid listings={listings} />
    </main>
  );
}