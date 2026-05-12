import { createClientServer } from "@/app/lib/supabase/server";
import type {
  LogisticsCityOption,
  LogisticsFilters,
  LogisticsListing,
} from "./types";

export const LOGISTICS_VEHICLE_TYPES = [
  { value: "loader_rickshaw", label: "Loader Rickshaw" },
  { value: "pickup", label: "Pickup" },
  { value: "mazda", label: "Mazda" },
  { value: "truck", label: "Truck" },
  { value: "container", label: "Container" },
  { value: "reefer", label: "Reefer / Cold Chain" },
  { value: "tractor_trolley", label: "Tractor Trolley" },
  { value: "other", label: "Other" },
];

export function formatVehicleType(value: string | null | undefined) {
  if (!value) return "Transport";
  return (
    LOGISTICS_VEHICLE_TYPES.find((item) => item.value === value)?.label ??
    value.replaceAll("_", " ")
  );
}

export function formatPriceUnit(value: string | null | undefined) {
  if (!value) return "";
  if (value === "40kg") return "40 KG";
  return value.replaceAll("_", " ");
}

export async function fetchLogisticsListings(
  filters: LogisticsFilters = {},
): Promise<LogisticsListing[]> {
  const supabase = await createClientServer();

  let query = supabase
    .from("logistics_listings")
    .select(
      `
      id,
      title,
      slug,
      description,
      vehicle_type,
      capacity_value,
      capacity_unit,
      rate_amount,
      rate_unit,
      available_from,
      available_until,
      cold_chain_available,
      loader_available,
      contact_name,
      contact_phone,
      contact_whatsapp,
      contact_preference,
      created_at,
      city:cities!logistics_listings_city_id_fkey (
        id,
        name,
        slug
      ),
      source_city:cities!logistics_listings_source_city_id_fkey (
        id,
        name,
        slug
      ),
      destination_city:cities!logistics_listings_destination_city_id_fkey (
        id,
        name,
        slug
      ),
      logistics_listing_images (
        public_url,
        is_primary,
        sort_order
      )
    `,
    )
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,source_address.ilike.%${search}%,destination_address.ilike.%${search}%,route_notes.ilike.%${search}%`,
    );
  }

  if (filters.city?.trim()) {
    query = query.eq("city_id", filters.city.trim());
  }

  if (filters.vehicleType?.trim()) {
    query = query.eq("vehicle_type", filters.vehicleType.trim());
  }

  if (filters.coldChain === "yes") {
    query = query.eq("cold_chain_available", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("fetchLogisticsListings error:", error.message);
    return [];
  }

  return (data ?? []) as unknown as LogisticsListing[];
}

export async function fetchLogisticsFilterOptions(): Promise<{
  cities: LogisticsCityOption[];
}> {
  const supabase = await createClientServer();

  const { data: cities, error } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("fetchLogisticsFilterOptions error:", error.message);
    return {
      cities: [],
    };
  }

  return {
    cities: (cities ?? []) as LogisticsCityOption[],
  };
}
