import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type ProduceCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type CityOption = {
  id: string;
  name: string;
  slug: string;
};

export type ProduceListingCardItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_per_unit: number | string | null;
  price_unit: string | null;
  quantity: number | string | null;
  quantity_unit: string | null;
  contact_name: string | null;
  category_name: string;
  city_name: string;
  image_url: string | null;
  created_at: string | null;
};

export async function getProduceCategoryOptions(): Promise<
  ProduceCategoryOption[]
> {
  const { data, error } = await supabase
    .from("produce_categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getCityOptions(): Promise<CityOption[]> {
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getProduceListings(): Promise<ProduceListingCardItem[]> {
  const { data, error } = await supabase
    .from("produce_listings")
    .select(
      `
      id,
      slug,
      title,
      description,
      price_per_unit,
      price_unit,
      quantity,
      quantity_unit,
      contact_name,
      created_at,
      produce_categories (
        name
      ),
      cities (
        name
      ),
      produce_listing_images (
        public_url,
        is_primary,
        sort_order
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProduceListings error:", error);
    return [];
  }

  return (data ?? []).map((item: any) => {
    const primaryImage =
      item.produce_listing_images?.find((img: any) => img.is_primary) ||
      item.produce_listing_images?.sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      )?.[0];

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      price_per_unit: item.price_per_unit,
      price_unit: item.price_unit,
      quantity: item.quantity,
      quantity_unit: item.quantity_unit,
      contact_name: item.contact_name,
      category_name: item.produce_categories?.name ?? "Unknown category",
      city_name: item.cities?.name ?? "Unknown city",
      image_url: primaryImage?.public_url ?? null,
      created_at: item.created_at ?? null,
    };
  });
}

export async function getProduceListingBySlug(slug: string) {
  const { data, error } = await supabase
    .from("produce_listings")
    .select(
      `
      *,
      produce_categories (
        name,
        slug
      ),
      cities (
        name,
        slug
      ),
      produce_listing_images (
        public_url,
        is_primary,
        sort_order
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("QUERY ERROR:", error);
    return null;
  }

  if (!data) return null;

  const primaryImage =
    data.produce_listing_images?.find((img: any) => img.is_primary) ||
    data.produce_listing_images?.sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    )?.[0];

  return {
    ...data,
    image_url: primaryImage?.public_url || null,
  };
}
