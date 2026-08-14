"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;

  const selectedDate = searchParams.get("date");
  const selectedTime = searchParams.get("time");
  const guestCount = searchParams.get("guests");
  const selectedTable = searchParams.get("table");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum dipilih";

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !guestCount || !selectedTable) {
      setErrorMessage("Data booking belum lengkap.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const bookingDate = `${selectedDate}T${selectedTime}:00`;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: 1,
          restaurantId: 1,
          tableId: Number(selectedTable),
          bookingDate,
          guestCount: Number(guestCount),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal membuat booking. Silakan coba lagi.",
        );
      }

      const bookingCode = `TG-${Date.now().toString().slice(-8)}`;

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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
          </div>

          <span className="text-sm text-gray-500">Konfirmasi Booking</span>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Title */}
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

        {/* Booking Card */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Restaurant */}
          <div className="border-b border-gray-100 pb-6">
            <p className="text-sm text-gray-500">Restoran</p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Kopi Senja
            </h2>

            <p className="mt-1 text-sm text-gray-500">Bandung, Jawa Barat</p>
          </div>

          {/* Booking Details */}
          <div className="grid gap-6 py-6 sm:grid-cols-2">
            {/* Date */}
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>

              <p className="mt-1 font-semibold text-gray-900">
                {formattedDate}
              </p>
            </div>

            {/* Time */}
            <div>
              <p className="text-sm text-gray-500">Waktu</p>

              <p className="mt-1 font-semibold text-gray-900">
                {selectedTime || "Belum dipilih"}
              </p>
            </div>

            {/* Guests */}
            <div>
              <p className="text-sm text-gray-500">Jumlah Tamu</p>

              <p className="mt-1 font-semibold text-gray-900">
                {guestCount || "0"} orang
              </p>
            </div>

            {/* Table */}
            <div>
              <p className="text-sm text-gray-500">Meja</p>

              <p className="mt-1 font-semibold text-green-600">
                {selectedTable || "Belum dipilih"}
              </p>
            </div>
          </div>

          {/* Information */}
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              Data booking sudah siap dikonfirmasi.
            </p>

            <p className="mt-1 text-sm text-green-600">
              Pastikan tanggal, waktu, jumlah tamu, dan meja sudah sesuai.
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mt-4 rounded-xl bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
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
        </div>

        {/* Security */}
        <p className="mt-6 text-center text-xs text-gray-400">
          🔒 Data booking kamu aman dan tidak akan dibagikan ke pihak lain.
        </p>
      </div>
    </main>
  );
}
