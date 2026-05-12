import { createClientServer } from "@/app/lib/supabase/server";

export type ProduceFilters = {
  search?: string;
  city?: string;
  category?: string;
};

export type ProduceFilterOption = {
  id: string;
  name: string;
  slug: string;
};

export type ProduceFilterOptions = {
  cities: ProduceFilterOption[];
  categories: ProduceFilterOption[];
};

export type ProduceListingCardItem = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  status: string | null;
  created_at: string | null;
  image_urls: string[] | string | null;
  city_name?: string | null;
  category_name?: string | null;
  seller_name?: string | null;
};

type RawProduceListingRow = {
  id: unknown;
  title: unknown;
  slug: unknown;
  description: unknown;
  quantity: unknown;
  quantity_unit: unknown;
  price_per_unit: unknown;
  price_unit: unknown;
  status: unknown;
  created_at: unknown;
  image_urls: unknown;
  city?: unknown;
  category?: unknown;
  seller_name?: unknown;
};

type RawCityRow = {
  id: unknown;
  name: unknown;
  slug: unknown;
};

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toStringArrayOrNull(value: unknown): string[] | string | null {
  if (value == null) return null;

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeListing(row: RawProduceListingRow): ProduceListingCardItem {
  return {
    id: String(row.id ?? ""),
    title: toNullableString(row.title),
    slug: toNullableString(row.slug),
    description: toNullableString(row.description),
    quantity: toNullableNumber(row.quantity),
    quantity_unit: toNullableString(row.quantity_unit),
    price_per_unit: toNullableNumber(row.price_per_unit),
    price_unit: toNullableString(row.price_unit),
    status: toNullableString(row.status),
    created_at: toNullableString(row.created_at),
    image_urls: toStringArrayOrNull(row.image_urls),
    city_name: toNullableString(row.city),
    category_name: toNullableString(row.category),
    seller_name: toNullableString(row.seller_name),
  };
}

function normalizeCityRow(row: RawCityRow): ProduceFilterOption {
  const name = String(row.name ?? "");
  return {
    id: String(row.id ?? ""),
    name,
    slug: String(row.slug ?? slugify(name)),
  };
}

export async function fetchProduceListings(
  filters: ProduceFilters = {},
): Promise<ProduceListingCardItem[]> {
  const supabase = await createClientServer();

  let query = supabase
    .from("produce_listings")
    .select(
      `
      id,
      title,
      slug,
      description,
      quantity,
      quantity_unit,
      price_per_unit,
      price_unit,
      status,
      created_at,
      image_urls
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("fetchProduceListings error:", error.message);
    return [];
  }

  let listings = ((data ?? []) as RawProduceListingRow[]).map(normalizeListing);

  // Temporary client-side filtering for city/category names until
  // real FK relations / lookup tables are wired correctly.
  if (filters.city?.trim()) {
    const cityNeedle = filters.city.trim().toLowerCase();
    listings = listings.filter(
      (item) => (item.city_name || "").toLowerCase() === cityNeedle,
    );
  }

  if (filters.category?.trim()) {
    const categoryNeedle = filters.category.trim().toLowerCase();
    listings = listings.filter(
      (item) => (item.category_name || "").toLowerCase() === categoryNeedle,
    );
  }

  return listings;
}

export async function fetchProduceFilterOptions(): Promise<ProduceFilterOptions> {
  const supabase = await createClientServer();

  let cities: ProduceFilterOption[] = [];
  let categories: ProduceFilterOption[] = [];

  // 1) Try cities table if present
  const { data: citiesData, error: citiesError } = await supabase
    .from("cities")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (citiesError) {
    console.error(
      "fetchProduceFilterOptions cities error:",
      citiesError.message,
    );
  } else {
    cities = ((citiesData ?? []) as RawCityRow[]).map(normalizeCityRow);
  }

  // 2) Categories fallback:
  // Since public.categories does not exist in your current schema,
  // return an empty array instead of crashing the homepage.
  categories = [];

  return {
    cities,
    categories,
  };
}
