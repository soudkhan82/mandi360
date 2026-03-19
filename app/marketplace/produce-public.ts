import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type {
  ProduceListingCard,
  ProduceListingFilters,
} from "@/app/types/marketplace";

type ProduceListingRow = {
  id: string;
  title: string;
  slug: string | null;
  category_id: string | null;
  city_id: string | null;
  quantity: number | null;
  quantity_unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  created_at: string;
  status: string;
  description: string | null;
};

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function applyFilters(query: any, filters: ProduceListingFilters) {
  let q = query;

  if (filters.cityId) {
    q = q.eq("city_id", filters.cityId);
  }

  if (filters.categoryId) {
    q = q.eq("category_id", filters.categoryId);
  }

  if (typeof filters.minPrice === "number") {
    q = q.gte("price_per_unit", filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    q = q.lte("price_per_unit", filters.maxPrice);
  }

  return q;
}

function mapProduceListing(row: ProduceListingRow): ProduceListingCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: null,
    city: null,
    quantity: row.quantity,
    unit: row.quantity_unit,
    price_per_unit: row.price_per_unit,
    price_unit: row.price_unit,
    created_at: row.created_at,
    status: row.status,
    description: row.description,
    category_id: row.category_id,
    city_id: row.city_id,
  };
}

export const getPublishedProduceListings = cache(
  async (
    filters: ProduceListingFilters = {},
    page = 1,
    pageSize = 12,
  ): Promise<{
    data: ProduceListingCard[];
    count: number;
    page: number;
    pageSize: number;
  }> => {
    const supabase = getSupabaseServerClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("produce_listings")
      .select(
        `
          id,
          title,
          slug,
          category_id,
          city_id,
          quantity,
          quantity_unit,
          price_per_unit,
          price_unit,
          created_at,
          status,
          description
        `,
        { count: "exact" },
      )
      .eq("status", "published");

    query = applyFilters(query, filters);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: ((data ?? []) as ProduceListingRow[]).map(mapProduceListing),
      count: count ?? 0,
      page,
      pageSize,
    };
  },
);

export const getPublishedProduceListingById = cache(
  async (id: string): Promise<ProduceListingCard | null> => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("produce_listings")
      .select(
        `
          id,
          title,
          slug,
          category_id,
          city_id,
          quantity,
          quantity_unit,
          price_per_unit,
          price_unit,
          created_at,
          status,
          description
        `,
      )
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return null;

    return mapProduceListing(data as ProduceListingRow);
  },
);

export const getPublishedProduceListingBySlug = cache(
  async (slug: string): Promise<ProduceListingCard | null> => {
    const cleanSlug = slug.trim();

    if (!cleanSlug) return null;

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("produce_listings")
      .select(
        `
          id,
          title,
          slug,
          category_id,
          city_id,
          quantity,
          quantity_unit,
          price_per_unit,
          price_unit,
          created_at,
          status,
          description
        `,
      )
      .eq("slug", cleanSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return null;

    return mapProduceListing(data as ProduceListingRow);
  },
);

export const getProduceFilterOptions = cache(async () => {
  const supabase = getSupabaseServerClient();

  const [citiesRes, categoriesRes] = await Promise.all([
    supabase
      .from("produce_listings")
      .select("city_id")
      .eq("status", "published")
      .not("city_id", "is", null),

    supabase
      .from("produce_listings")
      .select("category_id")
      .eq("status", "published")
      .not("category_id", "is", null),
  ]);

  if (citiesRes.error) throw new Error(citiesRes.error.message);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);

  const cityIds = Array.from(
    new Set((citiesRes.data ?? []).map((x) => x.city_id).filter(Boolean)),
  ).sort() as string[];

  const categoryIds = Array.from(
    new Set(
      (categoriesRes.data ?? []).map((x) => x.category_id).filter(Boolean),
    ),
  ).sort() as string[];

  return {
    cityIds,
    categoryIds,
  };
});
