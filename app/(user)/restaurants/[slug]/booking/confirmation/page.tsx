"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter, useSearchParams } from "next/navigation";

type Restaurant = {
  id: number;
  name: string;
  address: string;
};

export default function BookingConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;

  const selectedDate = searchParams.get("date");
  const selectedTime = searchParams.get("time");
  const guestCount = searchParams.get("guests");
  const selectedTable = searchParams.get("table");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // FETCH RESTAURANT
  // =========================================================

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoadingRestaurant(true);
        setErrorMessage("");

        const response = await fetch(`/api/restaurants/${slug}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.restaurant) {
          throw new Error(data.message || "Gagal mengambil data restoran.");
        }

        setRestaurant({
          id: data.restaurant.id,
          name: data.restaurant.name,
          address: data.restaurant.address ?? "",
        });
      } catch (error) {
        console.error("Fetch restaurant error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data restoran.",
        );
      } finally {
        setLoadingRestaurant(false);
      }
    };

    if (slug) {
      fetchRestaurant();
    }
  }, [slug]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum dipilih";

  // =========================================================
  // CONFIRM BOOKING
  // =========================================================

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !guestCount || !selectedTable) {
      setErrorMessage("Data booking belum lengkap.");
      return;
    }

    if (!restaurant) {
      setErrorMessage("Data restoran belum tersedia.");
      return;
    }

    const tableId = Number(selectedTable);
    const guestCountNumber = Number(guestCount);

    if (
      !Number.isInteger(tableId) ||
      tableId <= 0 ||
      !Number.isInteger(guestCountNumber) ||
      guestCountNumber <= 0
    ) {
      setErrorMessage("Data meja atau jumlah tamu tidak valid.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // =====================================================
      // PENTING:
      // Pakai timezone Indonesia secara eksplisit.
      // =====================================================

      const bookingDate = `${selectedDate}T${selectedTime}:00+07:00`;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableId,
          bookingDate,
          guestCount: guestCountNumber,
        }),
      });

      const data = await response.json();

      // =====================================================
      // BELUM LOGIN
      // =====================================================

      if (response.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            `/restaurants/${slug}/booking/confirmation?${searchParams.toString()}`,
          )}`,
        );

        return;
      }

      // =====================================================
      // ERROR
      // =====================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal membuat booking. Silakan coba lagi.",
        );
      }

      // =====================================================
      // BOOKING BERHASIL
      // =====================================================

      const bookingCode = `TG-${String(data.booking.id).padStart(6, "0")}`;

      const successParams = new URLSearchParams({
        date: selectedDate,
        time: selectedTime,
        guests: guestCount,
        table: selectedTable,
        code: bookingCode,
      });

      router.push(
        `/restaurants/${slug}/booking/success?${successParams.toString()}`,
      );
    } catch (error) {
      console.error("Booking error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal membuat booking.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* HEADER */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl font-bold text-green-600">✓</span>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-500">
            Konfirmasi Booking
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            Periksa Booking Kamu
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Pastikan semua informasi booking sudah benar sebelum melanjutkan.
          </p>
        </div>

        {/* CARD */}

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {loadingRestaurant ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">Memuat data restoran...</p>
            </div>
          ) : (
            <>
              {/* RESTAURANT */}

              <div className="border-b border-gray-100 pb-6">
                <p className="text-sm text-gray-500">Restoran</p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {restaurant?.name || "Restoran tidak ditemukan"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {restaurant?.address || "Alamat tidak tersedia"}
                </p>
              </div>

              {/* DETAIL */}

              <div className="grid gap-6 py-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {formattedDate}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Waktu</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedTime || "Belum dipilih"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Jumlah Tamu</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {guestCount || "0"} orang
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Meja</p>

                  <p className="mt-1 font-semibold text-green-600">
                    {selectedTable ? `Meja ${selectedTable}` : "Belum dipilih"}
                  </p>
                </div>
              </div>

              {/* INFO */}

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  Data booking sudah siap dikonfirmasi.
                </p>

                <p className="mt-1 text-sm text-green-600">
                  Pastikan tanggal, waktu, jumlah tamu, dan meja sudah sesuai.
                </p>
              </div>

              {/* ERROR */}

              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* BUTTON */}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading || !restaurant}
                  className="w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading ? "Memproses Booking..." : "Konfirmasi Booking"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => router.push(`/restaurants/${slug}/booking`)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kembali ke Booking
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          🔒 Data booking kamu aman dan tidak akan dibagikan ke pihak lain.
        </p>
      </div>
    </main>
  );
}
