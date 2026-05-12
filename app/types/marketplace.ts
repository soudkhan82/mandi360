export type ProduceListingCardItem = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  quantity: number;
  quantity_unit: string;
  price_per_unit: number;
  price_unit: string;
  category_name: string;
  city_name: string;
  contact_name: string | null;
  created_at: string;
  status: string;
  image_url?: string | null;
};
