"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { getOperatingStatus } from "@/lib/restaurant-hours";

type OperatingHour = {
  id: number;
  restaurantId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type Restaurant = {
  id: number;
  name: string;
  address: string;
  operatingHours: OperatingHour[];
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

        const operatingHours = Array.isArray(data.restaurant.operatingHours)
          ? data.restaurant.operatingHours
          : [];

        setRestaurant({
          id: data.restaurant.id,
          name: data.restaurant.name,
          address: data.restaurant.address ?? "",
          operatingHours,
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
  // BOOKING DATE
  // =========================================================

  const bookingDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) {
      return null;
    }

    const dateTimeString = `${selectedDate}T${selectedTime}:00+07:00`;

    const date = new Date(dateTimeString);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [selectedDate, selectedTime]);

  // =========================================================
  // CEK JAM OPERASIONAL
  // =========================================================

  const operatingStatus = useMemo(() => {
    if (!restaurant || !bookingDateTime) {
      return null;
    }

    return getOperatingStatus(restaurant.operatingHours, bookingDateTime);
  }, [restaurant, bookingDateTime]);

  const bookingAllowed = Boolean(
    restaurant && bookingDateTime && operatingStatus?.isOpen === true,
  );

  // =========================================================
  // VALIDASI DATA
  // =========================================================

  const validationMessage = useMemo(() => {
    if (!selectedDate || !selectedTime) {
      return "Tanggal dan waktu booking belum dipilih.";
    }

    if (!bookingDateTime) {
      return "Tanggal atau waktu booking tidak valid.";
    }

    if (!restaurant) {
      return "";
    }

    if (!operatingStatus) {
      return "Jam operasional restoran tidak tersedia.";
    }

    if (operatingStatus.isClosedDay) {
      return `Restoran tutup pada hari ${operatingStatus.dayName}.`;
    }

    if (!operatingStatus.isOpen) {
      return `Restoran buka ${operatingStatus.openTime}–${operatingStatus.closeTime} WIB pada hari ${operatingStatus.dayName}.`;
    }

    return "";
  }, [
    selectedDate,
    selectedTime,
    bookingDateTime,
    restaurant,
    operatingStatus,
  ]);

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

    if (!bookingDateTime) {
      setErrorMessage("Tanggal atau waktu booking tidak valid.");
      return;
    }

    // ---------------------------------------------------------
    // CEK JAM OPERASIONAL SEBELUM REQUEST API
    // ---------------------------------------------------------

    if (!operatingStatus?.isOpen) {
      if (operatingStatus?.isClosedDay) {
        setErrorMessage(`Restoran tutup pada hari ${operatingStatus.dayName}.`);
      } else {
        setErrorMessage(
          `Booking hanya dapat dilakukan pada jam ${operatingStatus?.openTime}–${operatingStatus?.closeTime} WIB.`,
        );
      }

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
      // TIMEZONE INDONESIA / WIB
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
      // ERROR DARI SERVER
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
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              bookingAllowed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <span
              className={`text-2xl font-bold ${
                bookingAllowed ? "text-green-600" : "text-red-600"
              }`}
            >
              {bookingAllowed ? "✓" : "!"}
            </span>
          </div>

          <p
            className={`mt-6 text-sm font-semibold uppercase tracking-wider ${
              bookingAllowed ? "text-green-500" : "text-red-500"
            }`}
          >
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
                    {selectedTime || "Belum dipilih"} WIB
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

              {/* OPERATING STATUS */}

              {operatingStatus && (
                <div
                  className={`rounded-xl p-4 ${
                    operatingStatus.isOpen ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        operatingStatus.isOpen ? "bg-green-500" : "bg-red-500"
                      }`}
                    />

                    <p
                      className={`text-sm font-semibold ${
                        operatingStatus.isOpen
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {operatingStatus.isOpen
                        ? "Restoran buka pada waktu booking"
                        : "Restoran tutup pada waktu booking"}
                    </p>
                  </div>

                  <p
                    className={`mt-1 text-sm ${
                      operatingStatus.isOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {operatingStatus.isClosedDay
                      ? `Hari ${operatingStatus.dayName} restoran tutup.`
                      : `Jam operasional ${operatingStatus.dayName}: ${operatingStatus.openTime}–${operatingStatus.closeTime} WIB.`}
                  </p>
                </div>
              )}

              {/* VALIDATION MESSAGE */}

              {validationMessage && (
                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    {validationMessage}
                  </p>
                </div>
              )}

              {/* ERROR */}

              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* SUCCESS INFO */}

              {bookingAllowed && !errorMessage && (
                <div className="mt-4 rounded-xl bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-700">
                    Data booking sudah siap dikonfirmasi.
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    Pastikan tanggal, waktu, jumlah tamu, dan meja sudah sesuai.
                  </p>
                </div>
              )}

              {/* BUTTON */}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading || !restaurant || !bookingAllowed}
                  className={`w-full rounded-xl px-5 py-3.5 font-semibold text-white transition ${
                    bookingAllowed
                      ? "bg-green-500 hover:bg-green-600"
                      : "cursor-not-allowed bg-gray-300"
                  } disabled:cursor-not-allowed disabled:bg-gray-300`}
                >
                  {loading
                    ? "Memproses Booking..."
                    : bookingAllowed
                      ? "Konfirmasi Booking"
                      : "Booking Tidak Tersedia"}
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
