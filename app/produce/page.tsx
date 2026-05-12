import ProductFilters from "./components/ProductFilters";
import ProductHero from "./components/ProductHero";
import ProductListingGrid from "./components/ProductListingGrid";
import {
  fetchProduceListings,
  fetchProduceFilterOptions,
} from "@/app/lib/marketplace/produce/fetch";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    city?: string;
    category?: string;
  }>;
};

export default async function ProducePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

  const filters = {
    search: params.search ?? "",
    city: params.city ?? "",
    category: params.category ?? "",
  };

  const [listings, filterOptions] = await Promise.all([
    fetchProduceListings(filters),
    fetchProduceFilterOptions(),
  ]);

  // ✅ FIX: convert objects → string[]
  const cityNames = filterOptions.cities.map((c) => c.name);
  const categoryNames = filterOptions.categories.map((c) => c.name);

  return (
    <main className="min-h-screen bg-[#020817] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO */}
        <ProductHero cities={cityNames} categories={categoryNames} />

        {/* FILTERS */}
        <div className="rounded-3xl border border-slate-800 bg-[#050b18] p-5 shadow-xl">
          <ProductFilters cities={cityNames} categories={categoryNames} />
        </div>

        {/* LISTINGS */}
        <ProductListingGrid listings={listings} />
      </div>
    </main>
  );
}
