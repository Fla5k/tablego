"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string | null;
  image: string | null;
  tableCount: number;
  bookingCount: number;
};

export default function RestaurantsPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkingAuthSlug, setCheckingAuthSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/restaurants", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil data restoran.");
        }

        setRestaurants(data.restaurants);
      } catch (error) {
        console.error("Fetch public restaurants error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data restoran.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  // =========================
  // CEK LOGIN SEBELUM LIHAT RESTORAN
  // =========================

  const handleViewRestaurant = async (slug: string) => {
    try {
      setCheckingAuthSlug(slug);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      // Belum login
      if (response.status === 401 || !data.success || !data.user) {
        router.push("/login");
        return;
      }

      // Sudah login
      router.push(`/restaurants/${slug}`);
    } catch (error) {
      console.error("Check authentication error:", error);

      window.alert(
        "Terjadi kesalahan saat memeriksa status login. Silakan coba lagi.",
      );
    } finally {
      setCheckingAuthSlug(null);
    }
  };

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
          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-gray-500">Memuat restoran...</p>
            </div>
          )}

          {/* Error */}
          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !errorMessage && restaurants.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl">
                🍽️
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Belum ada restoran
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Belum ada restoran yang tersedia di TableGo.
              </p>
            </div>
          )}

          {/* Restaurants */}
          {!loading && !errorMessage && restaurants.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => {
                const isCheckingAuth = checkingAuthSlug === restaurant.slug;

                return (
                  <article
                    key={restaurant.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl">🍽️</div>

                            <p className="mt-2 text-sm">Tidak ada gambar</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-900 shadow-sm">
                        Restoran
                      </div>

                      <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                        Tersedia
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {restaurant.name}
                        </h2>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {restaurant.address}
                      </p>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                        {restaurant.description}
                      </p>

                      {/* Stats */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-400">Meja</p>

                          <p className="mt-1 font-bold text-gray-900">
                            {restaurant.tableCount}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-400">Booking</p>

                          <p className="mt-1 font-bold text-gray-900">
                            {restaurant.bookingCount}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-5 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleViewRestaurant(restaurant.slug)}
                          disabled={checkingAuthSlug !== null}
                          className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {isCheckingAuth ? "Memeriksa..." : "Lihat Restoran"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
