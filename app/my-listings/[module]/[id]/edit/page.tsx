export type MarketplaceModule =
  | "produce"
  | "logistics"
  | "consultants"
  | "agri-inputs";

export type ModuleConfig = {
  key: MarketplaceModule;
  label: string;
  table: string;
  browsePath: string;
  postPath: string;
  imageBucket: string;
  fields: {
    categoryLabel: string;
    priceLabel: string;
    quantityLabel: string;
    unitLabel: string;
  };
};

export const MARKETPLACE_MODULES: Record<MarketplaceModule, ModuleConfig> = {
  produce: {
    key: "produce",
    label: "Produce",
    table: "produce_listings",
    browsePath: "/produce",
    postPath: "/post-ad/produce",
    imageBucket: "produce-images",
    fields: {
      categoryLabel: "Category",
      priceLabel: "Price",
      quantityLabel: "Quantity",
      unitLabel: "Unit",
    },
  },

  logistics: {
    key: "logistics",
    label: "Logistics",
    table: "logistics_listings",
    browsePath: "/logistics",
    postPath: "/post-ad/logistics",
    imageBucket: "logistics-images",
    fields: {
      categoryLabel: "Vehicle / Service Type",
      priceLabel: "Rate",
      quantityLabel: "Capacity",
      unitLabel: "Unit",
    },
  },

  consultants: {
    key: "consultants",
    label: "Consultants",
    table: "service_listings",
    browsePath: "/consultants",
    postPath: "/post-ad/consultants",
    imageBucket: "service-images",
    fields: {
      categoryLabel: "Consulting Type",
      priceLabel: "Fee",
      quantityLabel: "Experience",
      unitLabel: "Unit",
    },
  },

  "agri-inputs": {
    key: "agri-inputs",
    label: "Agri Inputs",
    table: "input_supplier_listings",
    browsePath: "/agri-inputs",
    postPath: "/post-ad/agri-inputs",
    imageBucket: "input-images",
    fields: {
      categoryLabel: "Input Type",
      priceLabel: "Price",
      quantityLabel: "Quantity",
      unitLabel: "Unit",
    },
  },
};

export function getModuleConfig(module: string) {
  return MARKETPLACE_MODULES[module as MarketplaceModule] ?? null;
}

export function getAllModules() {
  return Object.values(MARKETPLACE_MODULES);
}
