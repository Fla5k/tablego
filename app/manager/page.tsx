"use client";

import Link from "next/link";
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
  restaurantId: number | null;
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

type TableResponse = {
  success: boolean;
  message?: string;
  totalTables?: number;
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

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatSelectedDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

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

export default function ManagerPage() {
  const [manager, setManager] = useState<Manager | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalTables, setTotalTables] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function loadDashboard(isRefresh = false, dateOverride?: string) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const dateToLoad = dateOverride ?? selectedDate;

      const [bookingResponse, tableResponse] = await Promise.all([
        fetch(`/api/manager/bookings?date=${encodeURIComponent(dateToLoad)}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }),
        fetch("/api/manager/tables", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      const bookingData: ApiResponse = await bookingResponse.json();
      const tableData: TableResponse = await tableResponse.json();

      if (!bookingResponse.ok || !bookingData.success) {
        throw new Error(bookingData.message || "Gagal mengambil data booking.");
      }

      if (!tableResponse.ok || !tableData.success) {
        throw new Error(tableData.message || "Gagal mengambil data meja.");
      }

      setManager(bookingData.manager ?? null);
      setBookings(bookingData.bookings ?? []);
      setTotalTables(tableData.totalTables ?? 0);
    } catch (error) {
      console.error("Manager dashboard load error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newDate = event.target.value;

    setSelectedDate(newDate);
    void loadDashboard(false, newDate);
  }

  async function updateBookingStatus(
    bookingId: number,
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED",
  ) {
    const action =
      status === "CONFIRMED"
        ? "mengonfirmasi"
        : status === "COMPLETED"
          ? "menyelesaikan"
          : "membatalkan";

    const confirmed = window.confirm(
      `Yakin ingin ${action} booking #${bookingId}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(bookingId);

      const response = await fetch(`/api/manager/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal memperbarui status booking.");
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

      window.alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui booking.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  function scrollToBookings() {
    document.getElementById("booking-hari-ini")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const statistics = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter((booking) => booking.status === "PENDING")
        .length,

      confirmed: bookings.filter((booking) => booking.status === "CONFIRMED")
        .length,

      completed: bookings.filter((booking) => booking.status === "COMPLETED")
        .length,

      cancelled: bookings.filter((booking) => booking.status === "CANCELLED")
        .length,
    };
  }, [bookings]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-gray-500">Memuat dashboard Manager...</p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              Tidak dapat membuka Dashboard Manager
            </h1>

            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
              Manager Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Halo, {manager?.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola operasional cabang restoran kamu dari satu tempat.
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

        {/* DASHBOARD CARDS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* KELOLA MEJA */}
          <Link
            href="/manager/tables"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Kelola Meja</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">→</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
                🪑
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-green-600 group-hover:text-green-700">
              Kelola meja cabang →
            </p>
          </Link>

          {/* TOTAL MEJA */}
          <Link
            href="/manager/tables"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Meja</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalTables}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
                🪑
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">Meja di cabang kamu</p>
          </Link>

          {/* TOTAL BOOKING */}
          <button
            type="button"
            onClick={scrollToBookings}
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Booking
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {statistics.total}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
                📅
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-green-600 group-hover:text-green-700">
              Lihat booking →
            </p>
          </button>

          {/* PENDING */}
          <button
            type="button"
            onClick={scrollToBookings}
            className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">
                  Menunggu Konfirmasi
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-800">
                  {statistics.pending}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-xl">
                ⏳
              </div>
            </div>

            <p className="mt-4 text-sm text-yellow-700">Perlu diproses →</p>
          </button>
        </div>

        {/* BOOKING */}
        <div id="booking-hari-ini" className="mt-10 scroll-mt-24">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDate === getTodayDate()
                  ? "Booking Hari Ini"
                  : "Riwayat Booking"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedDate === getTodayDate()
                  ? "Pantau dan proses booking yang masuk ke cabang kamu hari ini."
                  : `Menampilkan booking pada ${formatSelectedDate(
                      selectedDate,
                    )}.`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400"
                >
                  Filter Tanggal
                </label>

                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing ? "Memuat..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          {/* BOOKING SUMMARY */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* MENUNGGU */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Menunggu
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-600">
                {statistics.pending}
              </p>
            </div>

            {/* DIKONFIRMASI */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Dikonfirmasi
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {statistics.confirmed}
              </p>
            </div>

            {/* SELESAI */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Selesai
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {statistics.completed}
              </p>
            </div>

            {/* DIBATALKAN */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Dibatalkan
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {statistics.cancelled}
              </p>
            </div>
          </div>

          {/* EMPTY */}
          {bookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                📋
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Tidak ada booking
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Tidak ada booking pada tanggal{" "}
                {formatSelectedDate(selectedDate)}.
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
                      {/* HEADER */}
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

                      {/* DETAIL */}
                      <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Tanggal
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Waktu
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatTime(booking.bookingDate)}
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
                      </div>

                      {/* NOTES */}
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

                      {/* PENDING */}
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

                      {/* CONFIRMED */}
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

                      {/* COMPLETED */}
                      {booking.status === "COMPLETED" && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                          <div className="rounded-xl bg-blue-50 p-4">
                            <p className="text-sm font-semibold text-blue-700">
                              Booking telah selesai.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CANCELLED */}
                      {booking.status === "CANCELLED" && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                          <div className="rounded-xl bg-red-50 p-4">
                            <p className="text-sm font-semibold text-red-700">
                              Booking telah dibatalkan.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* EXPIRED */}
                      {booking.status === "EXPIRED" && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                          <div className="rounded-xl bg-gray-100 p-4">
                            <p className="text-sm font-semibold text-gray-700">
                              Booking telah kadaluarsa.
                            </p>
                          </div>
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
