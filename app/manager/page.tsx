"use client";

import { useEffect, useMemo, useState } from "react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

type Booking = {
  id: number;
  bookingDate: string;
  guestCount: number;
  status: BookingStatus;
  notes: string | null;

  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };

  restaurant: {
    id: number;
    name: string;
    address: string;
  };

  table: {
    id: number;
    tableNumber: string;
    capacity: number;
  };
};

type Manager = {
  id: number;
  name: string;
  email: string;
  restaurantId: number;
  restaurant: {
    id: number;
    name: string;
    address: string;
  } | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  manager?: Manager;
  bookings?: Booking[];
};

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Menunggu",
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
    label: "Kadaluarsa",
    className: "bg-gray-100 text-gray-600",
  },
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export default function ManagerPage() {
  const [manager, setManager] = useState<Manager | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function loadBookings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/manager/bookings", {
        method: "GET",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Gagal mengambil data booking.");
        return;
      }

      setManager(data.manager ?? null);
      setBookings(data.bookings ?? []);
    } catch (error) {
      console.error("Manager page load error:", error);
      setErrorMessage("Terjadi kesalahan saat mengambil data booking.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateBookingStatus(
    bookingId: number,
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED",
  ) {
    try {
      setProcessingId(bookingId);

      const response = await fetch(`/api/manager/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Gagal memperbarui status booking.");
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
              }
            : booking,
        ),
      );
    } catch (error) {
      console.error("Update manager booking error:", error);
      alert("Terjadi kesalahan saat memperbarui booking.");
    } finally {
      setProcessingId(null);
    }
  }

  const statistics = useMemo(() => {
    return {
      pending: bookings.filter((booking) => booking.status === "PENDING")
        .length,
      confirmed: bookings.filter((booking) => booking.status === "CONFIRMED")
        .length,
      completed: bookings.filter((booking) => booking.status === "COMPLETED")
        .length,
      cancelled: bookings.filter(
        (booking) =>
          booking.status === "CANCELLED" || booking.status === "EXPIRED",
      ).length,
    };
  }, [bookings]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-gray-500">Memuat dashboard Manager...</p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              Tidak dapat membuka Dashboard Manager
            </h1>

            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
              Manager Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Halo, {manager?.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola booking untuk cabang yang menjadi tanggung jawab kamu.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Cabang
            </p>

            <p className="mt-1 font-bold text-gray-900">
              {manager?.restaurant?.name ?? "Belum ditentukan"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {manager?.restaurant?.address ?? "-"}
            </p>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Menunggu</p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {statistics.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Dikonfirmasi</p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {statistics.confirmed}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Selesai</p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {statistics.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Dibatalkan / Kadaluarsa
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {statistics.cancelled}
            </p>
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Booking Cabang
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Semua booking yang masuk ke cabang kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={loadBookings}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-gray-900">Belum ada booking</p>

              <p className="mt-1 text-sm text-gray-500">
                Booking untuk cabang ini akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {bookings.map((booking) => {
                const status = statusConfig[booking.status];
                const isProcessing = processingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Booking #{booking.id}
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-gray-900">
                            {booking.user.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {booking.user.email}

                            {booking.user.phone
                              ? ` · ${booking.user.phone}`
                              : ""}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Waktu
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Meja
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            Meja {booking.table.tableNumber}
                          </p>

                          <p className="text-xs text-gray-500">
                            Kapasitas {booking.table.capacity} orang
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Tamu
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {booking.guestCount} orang
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Cabang
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {booking.restaurant.name}
                          </p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-5 rounded-xl bg-gray-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Catatan
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {booking.notes}
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}
                      {booking.status === "PENDING" && (
                        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking.id, "CANCELLED")
                            }
                            className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Batalkan
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking.id, "CONFIRMED")
                            }
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Memproses..."
                              : "Konfirmasi Booking"}
                          </button>
                        </div>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateBookingStatus(booking.id, "COMPLETED")
                            }
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? "Memproses..." : "Tandai Selesai"}
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
      </div>
    </main>
  );
}
