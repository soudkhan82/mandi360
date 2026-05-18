import { createClientServer } from "@/app/lib/supabase/server";

export type MarketplaceModuleType =
  | "produce"
  | "logistics"
  | "service"
  | "input_supplier";

export type AdminMarketplaceListing = {
  id: string;
  type: MarketplaceModuleType;
  label: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  image_url: string | null;
  line_1: string;
  line_2: string;
};

type ImageRow = {
  public_url: string;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

function pickImage(images: ImageRow[] | null | undefined) {
  const list = [...(images ?? [])];

  const primary =
    list.find((img) => img.is_primary) ??
    list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

  return primary?.public_url ?? null;
}

function money(value: unknown, unit?: unknown) {
  if (value === null || value === undefined || value === "") return "On call";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "On call";

  return `PKR ${amount.toLocaleString("en-PK")}${unit ? `/${unit}` : ""}`;
}

export const ADMIN_MARKETPLACE_MODULES = {
  produce: {
    label: "Produce",
    table: "produce_listings",
    imageRelation: "produce_listing_images",
  },
  logistics: {
    label: "Logistics",
    table: "logistics_listings",
    imageRelation: "logistics_listing_images",
  },
  service: {
    label: "Services",
    table: "service_listings",
    imageRelation: "service_listing_images",
  },
  input_supplier: {
    label: "Agri Inputs",
    table: "input_supplier_listings",
    imageRelation: "input_listing_images",
  },
} as const;

export function getAdminTableByType(type: string | null) {
  if (type && type in ADMIN_MARKETPLACE_MODULES) {
    return ADMIN_MARKETPLACE_MODULES[type as MarketplaceModuleType].table;
  }

  return null;
}

export async function fetchAdminMarketplaceListings() {
  const supabase = await createClientServer();

  const [produceResult, logisticsResult, serviceResult, inputResult] =
    await Promise.allSettled([
      supabase
        .from("produce_listings")
        .select(
          `
          id,
          title,
          status,
          created_at,
          updated_at,
          quantity,
          quantity_unit,
          price_per_unit,
          price_unit,
          contact_name,
          contact_phone,
          produce_listing_images (
            public_url,
            is_primary,
            sort_order
          )
        `,
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("logistics_listings")
        .select(
          `
          id,
          title,
          status,
          created_at,
          updated_at,
          vehicle_type,
          capacity_value,
          capacity_unit,
          route_notes,
          rate_amount,
          rate_unit,
          contact_name,
          contact_phone,
          logistics_listing_images (
            public_url,
            is_primary,
            sort_order
          )
        `,
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("service_listings")
        .select(
          `
          id,
          title,
          status,
          created_at,
          updated_at,
          pricing_type,
          price_amount,
          price_unit,
          contact_name,
          contact_phone,
          service_listing_images (
            public_url,
            is_primary,
            sort_order
          )
        `,
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("input_supplier_listings")
        .select(
          `
          id,
          title,
          status,
          created_at,
          updated_at,
          brand_name,
          stock_quantity,
          stock_unit,
          price_per_unit,
          price_unit,
          contact_name,
          contact_phone,
          input_listing_images (
            public_url,
            is_primary,
            sort_order
          )
        `,
        )
        .order("created_at", { ascending: false }),
    ]);

  const listings: AdminMarketplaceListing[] = [];

  if (produceResult.status === "fulfilled") {
    if (produceResult.value.error) {
      console.error("Admin produce fetch error:", produceResult.value.error);
    } else {
      for (const item of produceResult.value.data ?? []) {
        listings.push({
          id: item.id,
          type: "produce",
          label: "Produce",
          title: item.title,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          contact_name: item.contact_name,
          contact_phone: item.contact_phone,
          image_url: pickImage(item.produce_listing_images),
          line_1: `Quantity: ${item.quantity ?? "-"} ${
            item.quantity_unit ?? ""
          }`,
          line_2: `Price: ${money(item.price_per_unit, item.price_unit)}`,
        });
      }
    }
  }

  if (logisticsResult.status === "fulfilled") {
    if (logisticsResult.value.error) {
      console.error(
        "Admin logistics fetch error:",
        logisticsResult.value.error,
      );
    } else {
      for (const item of logisticsResult.value.data ?? []) {
        listings.push({
          id: item.id,
          type: "logistics",
          label: "Logistics",
          title: item.title,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          contact_name: item.contact_name,
          contact_phone: item.contact_phone,
          image_url: pickImage(item.logistics_listing_images),
          line_1: `Vehicle: ${(item.vehicle_type ?? "-").replaceAll("_", " ")}`,
          line_2: `Rate: ${money(item.rate_amount, item.rate_unit)}`,
        });
      }
    }
  }

  if (serviceResult.status === "fulfilled") {
    if (serviceResult.value.error) {
      console.error("Admin service fetch error:", serviceResult.value.error);
    } else {
      for (const item of serviceResult.value.data ?? []) {
        listings.push({
          id: item.id,
          type: "service",
          label: "Services",
          title: item.title,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          contact_name: item.contact_name,
          contact_phone: item.contact_phone,
          image_url: pickImage(item.service_listing_images),
          line_1: `Pricing: ${item.pricing_type ?? "-"}`,
          line_2: `Rate: ${money(item.price_amount, item.price_unit)}`,
        });
      }
    }
  }

  if (inputResult.status === "fulfilled") {
    if (inputResult.value.error) {
      console.error(
        "Admin input supplier fetch error:",
        inputResult.value.error,
      );
    } else {
      for (const item of inputResult.value.data ?? []) {
        listings.push({
          id: item.id,
          type: "input_supplier",
          label: "Agri Inputs",
          title: item.title,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          contact_name: item.contact_name,
          contact_phone: item.contact_phone,
          image_url: pickImage(item.input_listing_images),
          line_1: `Brand: ${item.brand_name ?? "-"}`,
          line_2: `Price: ${money(item.price_per_unit, item.price_unit)}`,
        });
      }
    }
  }

  return listings.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
