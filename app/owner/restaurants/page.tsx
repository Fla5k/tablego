"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OperatingHour = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type Restaurant = {
  id: number;
  name: string;
  address: string;
  description?: string | null;
  phone?: string | null;
  image?: string | null;
  parentId?: number | null;
  operatingHours?: OperatingHour[];
};

const DAY_NAMES = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

function createDefaultOperatingHours(): OperatingHour[] {
  return DAY_NAMES.map((_, index) => ({
    dayOfWeek: index + 1,
    openTime: "10:00",
    closeTime: "22:00",
    isClosed: false,
  }));
}

export default function OwnerRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    image: "",
    parentId: "",
  });

  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(
    createDefaultOperatingHours(),
  );

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

  useEffect(() => {
    fetchRestaurants();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      address: "",
      phone: "",
      image: "",
      parentId: "",
    });

    setOperatingHours(createDefaultOperatingHours());
    setFormError("");
    setFormSuccess("");
  }

  function closeAddForm() {
    if (submitting) return;

    setShowAddForm(false);
    resetForm();
  }

  function updateOperatingHour(
    dayOfWeek: number,
    field: keyof OperatingHour,
    value: string | boolean,
  ) {
    setOperatingHours((current) =>
      current.map((hour) =>
        hour.dayOfWeek === dayOfWeek
          ? {
              ...hour,
              [field]: value,
            }
          : hour,
      ),
    );
  }

  async function handleAddRestaurant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await fetch("/api/owner/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          address: form.address,
          phone: form.phone,
          image: form.image,
          parentId: form.parentId || null,
          operatingHours,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menambahkan restoran.");
      }

      setFormSuccess("Restoran berhasil ditambahkan.");

      if (data.restaurant) {
        setRestaurants((current) =>
          [...current, data.restaurant].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      }

      setTimeout(() => {
        setShowAddForm(false);
        resetForm();
      }, 700);
    } catch (error) {
      console.error("Add owner restaurant error:", error);

      setFormError(
        error instanceof Error ? error.message : "Gagal menambahkan restoran.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
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
                  d="M12 5v14M5 12h14"
                />
              </svg>
              Tambah Restoran
            </button>

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
        </div>
      </header>

      {/* Add Restaurant Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6">
          <div className="my-4 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-8">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600">
                  Business
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Tambah Restoran
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan restoran baru ke platform TableGo.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Tutup"
              >
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
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddRestaurant}>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                {formError && (
                  <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {formSuccess}
                  </div>
                )}

                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Informasi Restoran
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Informasi dasar restoran yang akan ditampilkan di TableGo.
                  </p>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="restaurant-name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Nama Restoran <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="restaurant-name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Contoh: TableGo Bistro Dago"
                      required
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="restaurant-description"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Deskripsi
                    </label>

                    <textarea
                      id="restaurant-description"
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Deskripsi singkat restoran..."
                      rows={3}
                      disabled={submitting}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="restaurant-address"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Alamat <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="restaurant-address"
                      value={form.address}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                      placeholder="Alamat lengkap restoran..."
                      rows={3}
                      required
                      disabled={submitting}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="restaurant-phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      No. Telepon
                    </label>

                    <input
                      id="restaurant-phone"
                      type="text"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="08xxxxxxxxxx"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="restaurant-parent"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Parent Restoran
                    </label>

                    <select
                      id="restaurant-parent"
                      value={form.parentId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          parentId: event.target.value,
                        }))
                      }
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    >
                      <option value="">
                        Restoran utama / tidak ada parent
                      </option>

                      {restaurants
                        .filter((restaurant) => !restaurant.parentId)
                        .map((restaurant) => (
                          <option key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="restaurant-image"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      URL Gambar
                    </label>

                    <input
                      id="restaurant-image"
                      type="url"
                      value={form.image}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          image: event.target.value,
                        }))
                      }
                      placeholder="https://example.com/gambar-restoran.jpg"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Masukkan URL gambar publik seperti yang digunakan pada
                      form Admin.
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="mt-8 border-t border-gray-100 pt-7">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Jam Operasional
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Atur jam buka restoran untuk setiap hari. Zona waktu
                      menggunakan WIB.
                    </p>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                    <div className="hidden grid-cols-[1.3fr_1fr_1fr_80px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 sm:grid">
                      <span>Hari</span>
                      <span>Jam Buka</span>
                      <span>Jam Tutup</span>
                      <span className="text-center">Status</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {operatingHours.map((hour) => (
                        <div
                          key={hour.dayOfWeek}
                          className="grid gap-3 px-4 py-4 sm:grid-cols-[1.3fr_1fr_1fr_80px] sm:items-center sm:gap-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {DAY_NAMES[hour.dayOfWeek - 1]}
                            </p>

                            <p className="text-xs text-gray-400 sm:hidden">
                              {hour.isClosed ? "Tutup" : "WIB"}
                            </p>
                          </div>

                          <div>
                            <label
                              htmlFor={`open-${hour.dayOfWeek}`}
                              className="mb-1 block text-xs text-gray-400 sm:hidden"
                            >
                              Jam Buka
                            </label>

                            <input
                              id={`open-${hour.dayOfWeek}`}
                              type="time"
                              value={hour.openTime}
                              onChange={(event) =>
                                updateOperatingHour(
                                  hour.dayOfWeek,
                                  "openTime",
                                  event.target.value,
                                )
                              }
                              disabled={submitting || hour.isClosed}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-400"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`close-${hour.dayOfWeek}`}
                              className="mb-1 block text-xs text-gray-400 sm:hidden"
                            >
                              Jam Tutup
                            </label>

                            <input
                              id={`close-${hour.dayOfWeek}`}
                              type="time"
                              value={hour.closeTime}
                              onChange={(event) =>
                                updateOperatingHour(
                                  hour.dayOfWeek,
                                  "closeTime",
                                  event.target.value,
                                )
                              }
                              disabled={submitting || hour.isClosed}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-400"
                            />
                          </div>

                          <label className="flex items-center justify-start gap-2 sm:justify-center">
                            <input
                              type="checkbox"
                              checked={hour.isClosed}
                              onChange={(event) =>
                                updateOperatingHour(
                                  hour.dayOfWeek,
                                  "isClosed",
                                  event.target.checked,
                                )
                              }
                              disabled={submitting}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />

                            <span className="text-sm text-gray-600 sm:hidden">
                              Tutup
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                        <path
                          className="opacity-75"
                          d="M21 12a9 9 0 00-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Tambah Restoran"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                              href={`/owner/restaurants/${restaurant.id}/tables`}
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
