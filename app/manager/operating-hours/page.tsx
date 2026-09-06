"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OperatingHour = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type OperatingHoursResponse = {
  success: boolean;
  message?: string;
  restaurant?: {
    id: number;
    name: string;
    address: string | null;
    operatingHours: OperatingHour[];
  };
};

const dayNames = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const defaultOperatingHours: OperatingHour[] = dayNames.map((_, index) => ({
  dayOfWeek: index + 1,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: false,
}));

export default function ManagerOperatingHoursPage() {
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(
    defaultOperatingHours,
  );

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOperatingHours();
  }, []);

  async function loadOperatingHours() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/manager/operating-hours", {
        method: "GET",
        cache: "no-store",
      });

      const data: OperatingHoursResponse = await response.json();

      if (!response.ok || !data.success || !data.restaurant) {
        throw new Error(data.message || "Gagal mengambil jam operasional.");
      }

      setRestaurantName(data.restaurant.name);
      setRestaurantAddress(data.restaurant.address ?? "");

      if (data.restaurant.operatingHours.length === 7) {
        const sortedHours = [...data.restaurant.operatingHours].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek,
        );

        setOperatingHours(sortedHours);
      } else {
        setOperatingHours(defaultOperatingHours);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil jam operasional.",
      );
    } finally {
      setLoading(false);
    }
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

    setSuccess("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/manager/operating-hours", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operatingHours,
        }),
      });

      const data: OperatingHoursResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan jam operasional.");
      }

      if (data.restaurant) {
        setRestaurantName(data.restaurant.name);
        setRestaurantAddress(data.restaurant.address ?? "");

        if (data.restaurant.operatingHours.length === 7) {
          const sortedHours = [...data.restaurant.operatingHours].sort(
            (a, b) => a.dayOfWeek - b.dayOfWeek,
          );

          setOperatingHours(sortedHours);
        }
      }

      setSuccess("Jam operasional berhasil disimpan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan jam operasional.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
                <p className="text-sm text-gray-500">
                  Memuat jam operasional...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/manager"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <span>←</span>
            Kembali ke Dashboard
          </Link>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Atur Jam Buka
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Atur jam operasional restoran untuk setiap hari.
            </p>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Cabang Anda
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {restaurantName || "Restoran"}
              </h2>

              {restaurantAddress && (
                <p className="mt-1 text-sm text-gray-500">
                  {restaurantAddress}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-green-50 px-4 py-3">
              <p className="text-xs font-medium text-green-700">Zona waktu</p>
              <p className="mt-1 text-sm font-bold text-green-800">
                WIB — Asia/Jakarta
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Operating Hours */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">
                Jam Operasional
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Restoran hanya dapat menerima booking pada waktu operasional
                yang telah ditentukan.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {operatingHours.map((hour) => {
                const dayName = dayNames[hour.dayOfWeek - 1];

                return (
                  <div key={hour.dayOfWeek} className="px-6 py-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Day */}
                      <div className="min-w-32">
                        <p className="font-semibold text-gray-900">{dayName}</p>

                        <p className="mt-1 text-xs text-gray-400">
                          Hari ke-{hour.dayOfWeek}
                        </p>
                      </div>

                      {/* Time */}
                      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="w-full sm:max-w-48">
                          <label
                            htmlFor={`open-${hour.dayOfWeek}`}
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                          >
                            Jam Buka
                          </label>

                          <input
                            id={`open-${hour.dayOfWeek}`}
                            type="time"
                            value={hour.openTime}
                            disabled={hour.isClosed}
                            onChange={(event) =>
                              updateOperatingHour(
                                hour.dayOfWeek,
                                "openTime",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>

                        <div className="hidden pb-3 text-gray-400 sm:block">
                          sampai
                        </div>

                        <div className="w-full sm:max-w-48">
                          <label
                            htmlFor={`close-${hour.dayOfWeek}`}
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                          >
                            Jam Tutup
                          </label>

                          <input
                            id={`close-${hour.dayOfWeek}`}
                            type="time"
                            value={hour.closeTime}
                            disabled={hour.isClosed}
                            onChange={(event) =>
                              updateOperatingHour(
                                hour.dayOfWeek,
                                "closeTime",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Closed */}
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 lg:min-w-36">
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
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-gray-800">
                            Tutup
                          </span>

                          <span className="block text-xs text-gray-400">
                            Restoran libur
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-gray-500">
                Pastikan jam buka lebih awal daripada jam tutup pada setiap hari
                yang aktif.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
