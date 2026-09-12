"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Restaurant = {
  id: number;
  name: string;
  address: string;
};

export default function OwnerRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/owner/restaurants", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil data restoran.");
        }

        setRestaurants(data.restaurants ?? []);
      } catch (error) {
        console.error("Owner restaurants page error:", error);

        setError(
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">
              Business
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              Restoran
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola dan pantau seluruh restoran TableGo.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21h18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h1"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {restaurants.length} Restoran
              </p>

              <p className="text-xs text-gray-500">Terdaftar di TableGo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Total Restoran
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? "—" : restaurants.length}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Seluruh restoran TableGo
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 21h18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-600">
                    Aktif
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Data restoran tersedia
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12l4 4L19 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Pengelolaan
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    Terpusat
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Dipantau dari Owner Panel
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant List */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">
                  Business Overview
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  Daftar Restoran
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Seluruh restoran yang terdaftar di platform TableGo.
                </p>
              </div>

              <div className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
                {loading ? "Memuat..." : `${restaurants.length} restoran`}
              </div>
            </div>

            <div className="p-6">
              {loading && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-gray-200 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100" />

                        <div className="flex-1">
                          <div className="h-4 w-2/3 rounded bg-gray-100" />
                          <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v4"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 17h.01"
                        />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Gagal memuat restoran
                      </p>

                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {!loading && !error && restaurants.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 21h18"
                      />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-gray-900">
                    Belum ada restoran
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Belum ada restoran yang terdaftar di TableGo.
                  </p>
                </div>
              )}

              {!loading && !error && restaurants.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="group rounded-2xl border border-gray-200 p-5 transition hover:border-green-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-100">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 21h18"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h1"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold text-gray-900">
                                {restaurant.name}
                              </h3>

                              <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                                <svg
                                  className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 21s7-5.25 7-11a7 7 0 10-14 0c0 5.75 7 11 7 11z"
                                  />
                                  <circle cx="12" cy="10" r="2.5" />
                                </svg>

                                <span className="line-clamp-2">
                                  {restaurant.address}
                                </span>
                              </div>
                            </div>

                            <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                              Aktif
                            </span>
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                            <p className="text-xs text-gray-400">
                              ID Restoran #{restaurant.id}
                            </p>

                            <Link
                              href={`/admin/restaurants/${restaurant.id}/tables`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 transition hover:text-green-700"
                            >
                              Kelola Meja
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.08 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
