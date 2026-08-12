"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TableSelector from "@/components/booking/TableSelector";

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();

  const slug = params.slug as string;

  const [guestCount, setGuestCount] = useState(2);
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const timeSlots = [
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
  ];

  const handleContinue = () => {
    if (!selectedDate) {
      setErrorMessage("Silakan pilih tanggal terlebih dahulu.");
      return;
    }

    if (!selectedTable) {
      setErrorMessage("Silakan pilih meja terlebih dahulu.");
      return;
    }

    setErrorMessage("");

    const bookingData = new URLSearchParams({
      date: selectedDate,
      time: selectedTime,
      guests: guestCount.toString(),
      table: selectedTable.toString(),
    });

    router.push(
      `/restaurants/${slug}/booking/confirmation?${bookingData.toString()}`,
    );
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

          <button
            type="button"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            ← Kembali ke restoran
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            Booking Meja
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Booking Meja di Kopi Senja
          </h1>

          <p className="mt-3 text-gray-600">
            Tentukan waktu kedatangan dan jumlah orang sebelum melanjutkan.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Date */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  1
                </span>

                <h2 className="text-lg font-semibold text-gray-900">
                  Pilih Tanggal
                </h2>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setErrorMessage("");
                }}
                className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Time */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  2
                </span>

                <h2 className="text-lg font-semibold text-gray-900">
                  Pilih Waktu Kedatangan
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setErrorMessage("");
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      selectedTime === time
                        ? "border-green-500 bg-green-500 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  3
                </span>

                <h2 className="text-lg font-semibold text-gray-900">
                  Jumlah Orang
                </h2>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setGuestCount((count) => Math.max(1, count - 1))
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-600 transition hover:bg-gray-50"
                >
                  −
                </button>

                <div className="flex h-12 min-w-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-5">
                  <span className="text-lg font-semibold text-gray-900">
                    {guestCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setGuestCount((count) => Math.min(20, count + 1))
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-600 transition hover:bg-gray-50"
                >
                  +
                </button>

                <span className="text-sm text-gray-500">orang</span>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm text-gray-500">Ringkasan Booking</p>

                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    Kopi Senja
                  </h2>
                </div>

                <div className="hidden sm:block">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    Booking Meja
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
                {/* Tanggal */}
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedDate || "Pilih tanggal"}
                  </p>
                </div>

                {/* Waktu */}
                <div>
                  <p className="text-xs text-gray-500">Waktu</p>

                  <p className="mt-1 text-sm font-medium text-green-600">
                    {selectedTime}
                  </p>
                </div>

                {/* Tamu */}
                <div>
                  <p className="text-xs text-gray-500">Tamu</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {guestCount} orang
                  </p>
                </div>

                {/* Meja */}
                <div>
                  <p className="text-xs text-gray-500">Meja</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedTable ?? "Pilih meja"}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-500">
                  {errorMessage}
                </p>
              )}

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleContinue}
                className="mt-6 w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600"
              >
                Lanjutkan
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                🔒 Data kamu aman dan tidak akan dibagikan ke pihak lain.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="lg:sticky lg:top-6">
            <TableSelector
              slug={slug}
              guestCount={guestCount}
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
