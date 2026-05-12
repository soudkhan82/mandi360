export type LogisticsFilters = {
  search?: string;
  city?: string;
  vehicleType?: string;
  coldChain?: string;
};

export type LogisticsCityOption = {
  id: string;
  name: string;
  slug: string;
};

export type LogisticsVehicleType =
  | "loader_rickshaw"
  | "pickup"
  | "mazda"
  | "truck"
  | "container"
  | "reefer"
  | "tractor_trolley"
  | "other";

export type LogisticsPriceUnit =
  | "kg"
  | "40kg"
  | "maund"
  | "ton"
  | "crate"
  | "box"
  | "bag"
  | "truck"
  | "trip"
  | "day"
  | "hour"
  | "acre"
  | "bigha"
  | "unit"
  | "custom";

export type LogisticsListing = {
  id: string;
  title: string;
  slug: string;
  description: string | null;

  vehicle_type: LogisticsVehicleType;
  capacity_value: number | null;
  capacity_unit: LogisticsPriceUnit | null;

  rate_amount: number | null;
  rate_unit: LogisticsPriceUnit;

  available_from: string | null;
  available_until: string | null;

  cold_chain_available: boolean;
  loader_available: boolean;

  contact_name: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_preference: string;

  created_at: string;

  city: {
    id: string;
    name: string;
    slug: string;
  } | null;

  source_city: {
    id: string;
    name: string;
    slug: string;
  } | null;

  destination_city: {
    id: string;
    name: string;
    slug: string;
  } | null;

  logistics_listing_images: {
    public_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
};
