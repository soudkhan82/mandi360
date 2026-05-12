export type ProduceListingCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number;
  unit: string;
  quantity: string;
  postedAt: string;
  image: string;
};

export type ProduceListingDetail = ProduceListingCard & {
  gallery: string[];
  sellerName: string;
  sellerType: string;
  phone: string;
  location: string;
  freshness: string;
  origin: string;
  delivery: string;
  minOrder: string;
};

export const produceCategories = [
  "Carrots",
  "Potato",
  "Onion",
  "Tomato",
  "Mango",
  "Apple",
  "Banana",
  "Citrus",
];

export const produceCities = [
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Peshawar",
  "Karachi",
  "Multan",
];

export const sampleProduceListings: ProduceListingDetail[] = [
  {
    id: "1",
    slug: "fresh-carrots-islamabad",
    title: "Fresh Carrots - Grade A",
    description:
      "Clean, fresh and mandi-ready carrots available for wholesale purchase.",
    category: "Carrots",
    city: "Islamabad",
    price: 120,
    unit: "kg",
    quantity: "2,500 kg",
    postedAt: "2 hours ago",
    image: "/images/categories/produce/carrots.jpg",
    gallery: [
      "/images/categories/produce/carrots.jpg",
      "/images/categories/produce/carrots.jpg",
      "/images/categories/produce/carrots.jpg",
    ],
    sellerName: "Khan Produce Traders",
    sellerType: "Wholesaler",
    phone: "+92 300 1111111",
    location: "I-11 / Sabzi Mandi, Islamabad",
    freshness: "Fresh arrival - same day",
    origin: "Local farm supply",
    delivery: "Pickup and local delivery available",
    minOrder: "200 kg",
  },
  {
    id: "2",
    slug: "premium-mango-lot-multan",
    title: "Premium Mango Lot",
    description:
      "Early season mango stock available for traders and retailers.",
    category: "Mango",
    city: "Multan",
    price: 180,
    unit: "kg",
    quantity: "4,000 kg",
    postedAt: "5 hours ago",
    image: "/images/categories/produce/mango.jpg",
    gallery: [
      "/images/categories/produce/mango.jpg",
      "/images/categories/produce/mango.jpg",
      "/images/categories/produce/mango.jpg",
    ],
    sellerName: "Multan Fruit Supply Co.",
    sellerType: "Commission Agent",
    phone: "+92 300 2222222",
    location: "Fruit Market, Multan",
    freshness: "Premium seasonal stock",
    origin: "South Punjab orchards",
    delivery: "Intercity dispatch possible",
    minOrder: "300 kg",
  },
  {
    id: "3",
    slug: "bulk-potato-stock-lahore",
    title: "Bulk Potato Stock",
    description:
      "High-volume potato stock suitable for wholesale and city supply.",
    category: "Potato",
    city: "Lahore",
    price: 95,
    unit: "kg",
    quantity: "10,000 kg",
    postedAt: "Today",
    image: "/images/categories/produce/potato.jpg",
    gallery: [
      "/images/categories/produce/potato.jpg",
      "/images/categories/produce/potato.jpg",
      "/images/categories/produce/potato.jpg",
    ],
    sellerName: "Punjab Veg Traders",
    sellerType: "Bulk Supplier",
    phone: "+92 300 3333333",
    location: "Badami Bagh, Lahore",
    freshness: "Warehouse-ready bulk stock",
    origin: "Central Punjab",
    delivery: "Loader and dispatch support available",
    minOrder: "500 kg",
  },
];
