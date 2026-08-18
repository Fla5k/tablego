"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Restaurant = {
  id: number;
  name: string;
  address: string;
};

export default function BookingSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;

  const selectedDate = searchParams.get("date");
  const selectedTime = searchParams.get("time");
  const guestCount = searchParams.get("guests");
  const selectedTable = searchParams.get("table");
  const bookingCode = searchParams.get("code");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  // =========================
  // FETCH RESTAURANT
  // =========================

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoadingRestaurant(true);

        const response = await fetch(`/api/restaurants/${slug}`);

        const data = await response.json();

        if (!response.ok || !data.success || !data.restaurant) {
          throw new Error(data.message || "Gagal mengambil data restoran.");
        }

        setRestaurant({
          id: data.restaurant.id,
          name: data.restaurant.name,
          address: data.restaurant.address,
        });
      } catch (error) {
        console.error("Fetch restaurant success page error:", error);
      } finally {
        setLoadingRestaurant(false);
      }
    }

    if (slug) {
      fetchRestaurant();
    }
  }, [slug]);

  // =========================
  // FORMAT DATE
  // =========================

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum dipilih";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* =========================
            SUCCESS
        ========================= */}

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <span className="text-4xl font-bold text-green-600">✓</span>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-500">
            Booking Berhasil
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Meja Kamu Berhasil Dipesan!
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Terima kasih telah menggunakan TableGo. Simpan kode booking kamu
            untuk melihat detail reservasi.
          </p>
        </div>

        {/* =========================
            BOOKING CODE
        ========================= */}

        <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-sm font-medium text-green-700">Kode Booking</p>

          <p className="mt-2 text-3xl font-bold tracking-widest text-gray-900">
            {bookingCode || "Tidak tersedia"}
          </p>

          <p className="mt-2 text-xs text-green-600">
            Tunjukkan kode ini saat datang ke restoran.
          </p>
        </div>

        {/* =========================
            BOOKING DETAIL
        ========================= */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* RESTAURANT */}

          <div className="border-b border-gray-100 pb-5">
            <p className="text-sm text-gray-500">Restoran</p>

            {loadingRestaurant ? (
              <>
                <div className="mt-2 h-7 w-48 animate-pulse rounded bg-gray-200" />

                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
              </>
            ) : restaurant ? (
              <>
                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {restaurant.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {restaurant.address}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  Restoran
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informasi restoran tidak tersedia.
                </p>
              </>
            )}
          </div>

          {/* =========================
              BOOKING INFORMATION
          ========================= */}

          <div className="grid gap-6 py-6 sm:grid-cols-2">
            {/* DATE */}

            <div>
              <p className="text-sm text-gray-500">Tanggal</p>

              <p className="mt-1 font-semibold text-gray-900">
                {formattedDate}
              </p>
            </div>

            {/* TIME */}

            <div>
              <p className="text-sm text-gray-500">Waktu</p>

              <p className="mt-1 font-semibold text-gray-900">
                {selectedTime || "Belum dipilih"}
              </p>
            </div>

            {/* GUESTS */}

            <div>
              <p className="text-sm text-gray-500">Jumlah Tamu</p>

              <p className="mt-1 font-semibold text-gray-900">
                {guestCount || "0"} orang
              </p>
            </div>

            {/* TABLE */}

            <div>
              <p className="text-sm text-gray-500">Meja</p>

              <p className="mt-1 font-semibold text-green-600">
                {selectedTable ? `Meja ${selectedTable}` : "Belum dipilih"}
              </p>
            </div>
          </div>

          {/* =========================
              STATUS
          ========================= */}

          <div className="rounded-xl bg-yellow-50 p-4">
            <p className="text-sm font-medium text-gray-700">Status Booking</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />

              <span className="text-sm font-semibold text-yellow-600">
                Menunggu Konfirmasi
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Booking kamu sudah tersimpan dan sedang menunggu konfirmasi dari
              restoran.
            </p>
          </div>
        </div>

        {/* =========================
            ACTION
        ========================= */}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => router.push(`/restaurants/${slug}`)}
            className="w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600"
          >
            Kembali ke Restoran
          </button>

          <button
            type="button"
            onClick={() => router.push("/bookings")}
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Lihat Booking Saya
          </button>
        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <p className="mt-5 text-center text-xs text-gray-400">
          🔒 Simpan kode booking kamu sebagai bukti reservasi.
        </p>
      </div>
    </main>
  );
}
