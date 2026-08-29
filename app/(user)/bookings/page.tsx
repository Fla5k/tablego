"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  bookingDate: string;
  guestCount: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  notes: string | null;

  restaurant: {
    id: number;
    name: string;
    address: string;
    image: string | null;
  };

  table: {
    id: number;
    tableNumber: string;
    capacity: number;
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  bookings?: Booking[];
};

const statusConfig = {
  PENDING: {
    label: "Menunggu Konfirmasi",
    className: "bg-yellow-50 text-yellow-700",
  },

  CONFIRMED: {
    label: "Dikonfirmasi",
    className: "bg-green-50 text-green-700",
  },

  COMPLETED: {
    label: "Selesai",
    className: "bg-blue-50 text-blue-700",
  },

  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-50 text-red-700",
  },

  EXPIRED: {
    label: "Kedaluwarsa",
    className: "bg-gray-100 text-gray-600",
  },
};

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatSelectedDate(dateString: string) {
  if (!dateString) {
    return "-";
  }

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function fetchBookings(date: string) {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/bookings/me?date=${encodeURIComponent(date)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const data: ApiResponse = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data booking.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Fetch bookings error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil booking.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchBookings(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleCancelBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin membatalkan booking ini?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal membatalkan booking.");
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking,
        ),
      );
    } catch (error) {
      console.error("Cancel booking error:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membatalkan booking.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const isToday = selectedDate === getTodayDate();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* PAGE HEADER */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            TableGo
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Booking Saya
          </h1>

          <p className="mt-2 text-gray-600">
            Lihat booking restoran berdasarkan tanggal.
          </p>
        </div>

        {/* DATE FILTER */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Filter Tanggal
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Pilih tanggal untuk melihat booking pada hari tersebut.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <label
                htmlFor="booking-date"
                className="text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                Tanggal Booking
              </label>

              <input
                id="booking-date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 sm:w-64"
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Menampilkan Booking
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {isToday ? "Hari ini" : formatSelectedDate(selectedDate)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {bookings.length} booking pada tanggal ini
            </p>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat data booking...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">{errorMessage}</p>

            <Link
              href="/restaurants"
              className="mt-4 inline-block rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Cari Restoran
            </Link>
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading && !errorMessage && bookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl">
              🍽️
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Tidak ada booking
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Tidak ada booking pada{" "}
              {isToday ? "hari ini" : formatSelectedDate(selectedDate)}.
            </p>

            {isToday && (
              <Link
                href="/restaurants"
                className="mt-6 inline-block rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Cari Restoran
              </Link>
            )}
          </div>
        )}

        {/* BOOKING LIST */}

        {!loading && !errorMessage && bookings.length > 0 && (
          <div className="mt-8 space-y-5">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status];

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-6">
                    {/* RESTAURANT + STATUS */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Booking #{booking.id}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                          {booking.restaurant.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {booking.restaurant.address}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* BOOKING DETAILS */}

                    <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Tanggal
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {formatDate(booking.bookingDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Waktu
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {formatTime(booking.bookingDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Meja
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          Meja {booking.table.tableNumber} ·{" "}
                          {booking.guestCount} orang
                        </p>
                      </div>
                    </div>

                    {/* NOTES */}

                    {booking.notes && (
                      <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium text-gray-400">
                          Catatan
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    {/* CANCEL */}

                    {booking.status === "PENDING" && (
                      <div className="mt-5 border-t border-gray-100 pt-5">
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="w-full rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {cancellingId === booking.id
                            ? "Membatalkan..."
                            : "Batalkan Booking"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
