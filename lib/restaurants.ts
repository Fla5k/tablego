import { Restaurant } from "@/types/restaurant";

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Kopi Senja",
    slug: "kopi-senja",
    description:
      "Cafe nyaman dengan pilihan kopi, makanan ringan, dan suasana santai.",
    location: "Bandung",
    category: "Cafe",
    priceRange: "Rp-Rp",
    rating: 4.8,
    reviewCount: 124,
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    isOpen: true,
  },
  {
    id: 2,
    name: "Dapur Nusantara",
    slug: "dapur-nusantara",
    description:
      "Nikmati berbagai hidangan khas Indonesia dengan cita rasa autentik.",
    location: "Bandung",
    category: "Indonesian",
    priceRange: "Rp-Rp-Rp",
    rating: 4.7,
    reviewCount: 89,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    isOpen: true,
  },
  {
    id: 3,
    name: "Sakura Ramen",
    slug: "sakura-ramen",
    description:
      "Ramen Jepang dengan kuah khas dan berbagai pilihan topping.",
    location: "Bandung",
    category: "Japanese",
    priceRange: "Rp-Rp-Rp",
    rating: 4.9,
    reviewCount: 216,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    isOpen: true,
  },
  {
    id: 4,
    name: "Urban Grill",
    slug: "urban-grill",
    description:
      "Tempat makan modern dengan berbagai pilihan grilled food.",
    location: "Bandung",
    category: "Western",
    priceRange: "Rp-Rp-Rp-Rp",
    rating: 4.6,
    reviewCount: 73,
    image:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
    isOpen: false,
  },
];