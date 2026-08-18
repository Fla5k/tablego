"use client";

import Link from "next/link";
import { restaurants } from "@/lib/restaurants";

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-500">
            Explore
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Temukan Restoran
            <span className="text-green-500"> Favoritmu.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Cari restoran terbaik, lihat ketersediaan meja, dan booking sebelum
            kamu datang.
          </p>
        </div>
      </section>

      {/* Restaurant List */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-900 shadow-sm">
                    {restaurant.category}
                  </div>

                  <div
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-medium text-white ${
                      restaurant.isOpen ? "bg-green-500" : "bg-gray-500"
                    }`}
                  >
                    {restaurant.isOpen ? "Buka" : "Tutup"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {restaurant.name}
                    </h2>

                    <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                      <span>★</span>
                      <span>{restaurant.rating}</span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {restaurant.location} · {restaurant.priceRange}
                  </p>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                    {restaurant.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {restaurant.reviewCount} ulasan
                    </span>

                    <Link
                      href={`/restaurants/${restaurant.slug}`}
                      className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
                    >
                      Lihat Restoran
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
