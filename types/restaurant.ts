export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
  location: string;
  category: string;
  priceRange: "Rp" | "Rp-Rp" | "Rp-Rp-Rp" | "Rp-Rp-Rp-Rp";
  rating: number;
  reviewCount: number;
  image: string;
  isOpen: boolean;
}