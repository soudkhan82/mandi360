// app/config/marketplace-nav.ts
import {
  Wheat,
  Truck,
  Package,
  Sprout,
  Briefcase,
  ShoppingCart,
  PlusCircle,
} from "lucide-react";

export type SegmentCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

export const marketplaceSegments: SegmentCard[] = [
  {
    title: "Produce Marketplace",
    description:
      "Browse fruits, vegetables, grains, and farm produce listings from growers and sellers.",
    href: "/produce",
    icon: Wheat,
    badge: "Public Browse",
  },
  {
    title: "Logistics",
    description:
      "Find transporters, loaders, delivery partners, and route-based logistics services.",
    href: "/logistics",
    icon: Truck,
  },
  {
    title: "Labour & Packaging",
    description:
      "Connect with packaging providers, mandi labour, sorting, loading, and handling services.",
    href: "/labour-packaging",
    icon: Package,
  },
  {
    title: "Agri Inputs",
    description:
      "Seeds, fertilizers, pesticides, sprays, and other agricultural input suppliers in one place.",
    href: "/agri-inputs",
    icon: Sprout,
  },
  {
    title: "Agri Consultants",
    description:
      "Access advisory services for crop planning, disease control, yield improvement, and more.",
    href: "/consultants",
    icon: Briefcase,
  },
  {
    title: "Buyers / Wholesalers",
    description:
      "Discover active buyers, wholesalers, traders, and mandi participants ready to purchase.",
    href: "/buyers",
    icon: ShoppingCart,
  },
  {
    title: "Post Listing",
    description:
      "Create a listing for produce, transport, services, or agri inputs. Login required only for posting.",
    href: "/post-listing",
    icon: PlusCircle,
    badge: "Login Required",
  },
];

export const marketplaceHighlights = [
  {
    title: "Public browsing first",
    description:
      "Anyone can explore listings without signing in. Frictionless discovery for all stakeholders.",
  },
  {
    title: "Login only where needed",
    description:
      "Google login is reserved for posting listings and managing account actions.",
  },
  {
    title: "Built for the full supply chain",
    description:
      "Farmers, wholesalers, logistics providers, consultants, labour, and suppliers on one platform.",
  },
];
