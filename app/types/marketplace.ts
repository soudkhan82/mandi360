export type ProduceListingCard = {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  city: string | null;
  quantity: number | null;
  unit: string | null;
  price_per_unit: number | null;
  price_unit: string | null;
  created_at: string;
  status: string;
  description?: string | null;

  // optional raw ids for filtering / future joins
  category_id?: string | null;
  city_id?: string | null;
};

export type ProduceListingFilters = {
  cityId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
};
