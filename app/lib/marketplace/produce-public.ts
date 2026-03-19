import { createClientServer } from "@/app/config/supabase-server";
import type { ProduceListingCard } from "@/app/types/marketplace";

export type ProducePublicFilters = {
  cityIds: string[];
  categoryIds: string[];
};

export type GetPublishedProduceListingsParams = {
  cityId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ProducePublicListingsResponse = {
  data: ProduceListingCard[];
  count: number;
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeNullableText(value: unknown): string | null {
  const text = normalizeText(value);
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function pickFirstString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = normalizeText(row[key]);
    if (value) return value;
  }
  return "";
}

function pickFirstNullableString(
  row: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = normalizeNullableText(row[key]);
    if (value) return value;
  }
  return null;
}

function pickFirstNumber(
  row: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = normalizeNumber(row[key]);
    if (value !== null) return value;
  }
  return null;
}

function mapListing(row: Record<string, unknown>): ProduceListingCard {
  const price =
    pickFirstNumber(row, ["price_per_unit", "price", "rate", "amount"]) ?? 0;

  const quantity =
    pickFirstNumber(row, ["quantity", "qty", "available_quantity"]) ?? 0;

  const listing: ProduceListingCard = {
    id: String(row.id ?? ""),
    slug: pickFirstNullableString(row, ["slug"]),
    title:
      pickFirstString(row, ["title", "produce_name", "name"]) ||
      "Untitled listing",
    description: pickFirstNullableString(row, ["description", "details"]),
    city: pickFirstString(row, ["city", "city_name", "city_id"]),
    category: pickFirstString(row, [
      "category",
      "category_name",
      "category_id",
    ]),
    quantity,
    unit:
      pickFirstString(row, [
        "unit",
        "quantity_unit",
        "qty_unit",
        "price_unit",
      ]) || "kg",
    price_per_unit: price,
    price_unit:
      pickFirstString(row, ["price_unit", "unit", "quantity_unit"]) || "kg",
    created_at:
      pickFirstString(row, ["created_at", "posted_at", "published_at"]) ||
      new Date().toISOString(),
    status: pickFirstString(row, ["status"]) || "published",
  };

  return listing;
}

export async function getProduceFilterOptions(): Promise<ProducePublicFilters> {
  const supabase = await createClientServer();

  const [citiesRes, categoriesRes] = await Promise.all([
    supabase.from("cities").select("id").order("id", { ascending: true }),
    supabase
      .from("produce_categories")
      .select("id")
      .order("id", { ascending: true }),
  ]);

  const cityIds =
    citiesRes.error || !Array.isArray(citiesRes.data)
      ? []
      : citiesRes.data
          .map((row) => normalizeText((row as Record<string, unknown>).id))
          .filter(Boolean);

  const categoryIds =
    categoriesRes.error || !Array.isArray(categoriesRes.data)
      ? []
      : categoriesRes.data
          .map((row) => normalizeText((row as Record<string, unknown>).id))
          .filter(Boolean);

  return { cityIds, categoryIds };
}

export async function getPublishedProduceListings(
  params: GetPublishedProduceListingsParams = {},
  page = 1,
  pageSize = 12,
): Promise<ProducePublicListingsResponse> {
  const supabase = await createClientServer();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("produce_listings")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.cityId) {
    query = query.eq("city_id", params.cityId);
  }

  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  if (typeof params.minPrice === "number" && Number.isFinite(params.minPrice)) {
    query = query.gte("price", params.minPrice);
  }

  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    query = query.lte("price", params.maxPrice);
  }

  const { data, error, count } = await query;

  if (error || !Array.isArray(data)) {
    return {
      data: [],
      count: 0,
    };
  }

  return {
    data: data
      .map((row) => mapListing(row as Record<string, unknown>))
      .filter((item) => item.id),
    count: count ?? 0,
  };
}
