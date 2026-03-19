import { createClientServer } from "@/app/config/supabase-server";

export type FilterOption = {
  id: string;
  name: string;
  slug?: string | null;
};

export type ProducePublicFilters = {
  cities: FilterOption[];
  categories: FilterOption[];
};

export type GetPublishedProduceListingsParams = {
  cityId?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  limit?: number;
};

export type ProducePublicListing = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  price?: number | null;
  priceUnit?: string | null;
  city?: string | null;
  cityName?: string | null;
  category?: string | null;
  categoryName?: string | null;
  quantity?: number | null;
  quantityUnit?: string | null;
  imageUrl?: string | null;
  postedAt?: string | null;
  sellerName?: string | null;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickFirstString(
  obj: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = normalizeText(obj[key]);
    if (value) return value;
  }
  return null;
}

function pickFirstNumber(
  obj: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = normalizeNumber(obj[key]);
    if (value !== null) return value;
  }
  return null;
}

function mapFilterOption(row: Record<string, unknown>): FilterOption | null {
  const id =
    pickFirstString(row, ["id", "city_id", "category_id", "value"]) ??
    String(row.id ?? row.city_id ?? row.category_id ?? row.value ?? "").trim();

  const name = pickFirstString(row, [
    "name",
    "title",
    "label",
    "city_name",
    "category_name",
  ]);

  if (!id || !name) return null;

  return {
    id,
    name,
    slug: pickFirstString(row, ["slug"]),
  };
}

function mapProduceListing(row: Record<string, unknown>): ProducePublicListing {
  return {
    id: String(row.id ?? ""),
    slug: pickFirstString(row, ["slug"]),
    title:
      pickFirstString(row, ["title", "produce_name", "name"]) ??
      "Untitled listing",
    description: pickFirstString(row, ["description", "details"]),
    price: pickFirstNumber(row, ["price", "rate", "amount"]),
    priceUnit: pickFirstString(row, ["price_unit", "unit", "rate_unit"]),
    city:
      pickFirstString(row, ["city", "city_name"]) ??
      pickFirstString(row, ["city_id"]),
    cityName: pickFirstString(row, ["city_name", "city"]),
    category:
      pickFirstString(row, ["category", "category_name"]) ??
      pickFirstString(row, ["category_id"]),
    categoryName: pickFirstString(row, ["category_name", "category"]),
    quantity: pickFirstNumber(row, ["quantity", "qty"]),
    quantityUnit: pickFirstString(row, ["quantity_unit", "qty_unit"]),
    imageUrl: pickFirstString(row, ["image_url", "image", "thumbnail_url"]),
    postedAt: pickFirstString(row, ["posted_at", "created_at", "published_at"]),
    sellerName: pickFirstString(row, [
      "seller_name",
      "user_name",
      "owner_name",
    ]),
  };
}

export async function getProduceFilterOptions(): Promise<ProducePublicFilters> {
  const supabase = await createClientServer();

  const [citiesRes, categoriesRes] = await Promise.all([
    supabase
      .from("cities")
      .select("id,name,slug")
      .order("name", { ascending: true }),
    supabase
      .from("produce_categories")
      .select("id,name,slug")
      .order("name", { ascending: true }),
  ]);

  const cities =
    citiesRes.error || !Array.isArray(citiesRes.data)
      ? []
      : citiesRes.data
          .map((row) => mapFilterOption(row as Record<string, unknown>))
          .filter((item): item is FilterOption => Boolean(item));

  const categories =
    categoriesRes.error || !Array.isArray(categoriesRes.data)
      ? []
      : categoriesRes.data
          .map((row) => mapFilterOption(row as Record<string, unknown>))
          .filter((item): item is FilterOption => Boolean(item));

  return { cities, categories };
}

export async function getPublishedProduceListings(
  params: GetPublishedProduceListingsParams = {},
): Promise<ProducePublicListing[]> {
  const supabase = await createClientServer();

  let query = supabase
    .from("produce_listings")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 24);

  if (params.cityId) {
    query = query.eq("city_id", params.cityId);
  }

  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  if (params.minPrice && params.minPrice.trim() !== "") {
    const min = Number(params.minPrice);
    if (Number.isFinite(min)) {
      query = query.gte("price", min);
    }
  }

  if (params.maxPrice && params.maxPrice.trim() !== "") {
    const max = Number(params.maxPrice);
    if (Number.isFinite(max)) {
      query = query.lte("price", max);
    }
  }

  const { data, error } = await query;

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.map((row) => mapProduceListing(row as Record<string, unknown>));
}
