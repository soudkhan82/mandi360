import ProduceListingCard from "./_components/ProduceListingCard";
import MarketPlaceFilters from "./_components/MarketPlaceFilters";
import {
  getProduceFilterOptions,
  getPublishedProduceListings,
} from "@/app/lib/marketplace/produce-public";

type SearchParams = {
  cityId?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

function parsePositiveNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return num;
}

function buildPageHref(
  page: number,
  params: {
    cityId?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  }
) {
  const qs = new URLSearchParams();

  if (params.cityId) qs.set("cityId", params.cityId);
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.minPrice) qs.set("minPrice", params.minPrice);
  if (params.maxPrice) qs.set("maxPrice", params.maxPrice);
  qs.set("page", String(page));

  return `/marketplace?${qs.toString()}`;
}

export default async function MarketplacePage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  const cityId = params.cityId?.trim() || undefined;
  const categoryId = params.categoryId?.trim() || undefined;
  const minPrice = parsePositiveNumber(params.minPrice);
  const maxPrice = parsePositiveNumber(params.maxPrice);

  const page = Math.max(1, Number(params.page || "1") || 1);
  const pageSize = 12;

  const [{ cityIds, categoryIds }, listingsRes] = await Promise.all([
    getProduceFilterOptions(),
    getPublishedProduceListings(
      {
        cityId,
        categoryId,
        minPrice,
        maxPrice,
      },
      page,
      pageSize
    ),
  ]);

  const safeListings = (listingsRes.data ?? []).filter(
    (listing) => listing && listing.id
  );

  const totalCount = listingsRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Public Agri Marketplace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Discover produce listings across cities
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
              Browse publicly available listings in a clean marketplace
              experience. Login is only needed for posting and account actions.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MarketPlaceFilters
          cityIds={cityIds}
          categoryIds={categoryIds}
          selectedCityId={params.cityId}
          selectedCategoryId={params.categoryId}
          minPrice={params.minPrice}
          maxPrice={params.maxPrice}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Available Listings
            </h2>
            <p className="text-sm text-slate-500">
              {totalCount} published listing{totalCount === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </div>
        </div>

        {safeListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              No listings found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your filters or clear them to browse all public
              listings.
            </p>
            <div className="mt-5">
              <a
                href="/marketplace"
                className="inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Clear Filters
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {safeListings.map((listing) => (
                <ProduceListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              {hasPrev ? (
                <a
                  href={buildPageHref(page - 1, {
                    cityId: params.cityId,
                    categoryId: params.categoryId,
                    minPrice: params.minPrice,
                    maxPrice: params.maxPrice,
                  })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </a>
              ) : (
                <span className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400">
                  Previous
                </span>
              )}

              <span className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                {page}
              </span>

              {hasNext ? (
                <a
                  href={buildPageHref(page + 1, {
                    cityId: params.cityId,
                    categoryId: params.categoryId,
                    minPrice: params.minPrice,
                    maxPrice: params.maxPrice,
                  })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                </a>
              ) : (
                <span className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400">
                  Next
                </span>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}