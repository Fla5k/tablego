"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

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

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN";
};

type StatusFilter = "ALL" | BookingStatus;

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
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function getDateInputValue(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AdminBookingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================
  // FILTER
  // =========================

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const userResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.success || !userData.user) {
          router.push("/login");
          return;
        }

        if (userData.user.role !== "ADMIN") {
          router.push("/restaurants");
          return;
        }

        setUser(userData.user);

        const bookingResponse = await fetch("/api/admin/bookings", {
          method: "GET",
          credentials: "include",
        });

        const bookingData = await bookingResponse.json();

        if (!bookingResponse.ok || !bookingData.success) {
          throw new Error(
            bookingData.message || "Gagal mengambil data booking.",
          );
        }

        setBookings(bookingData.bookings);
      } catch (error) {
        console.error("Admin bookings error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil data.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [router]);

  // =========================
  // UPDATE STATUS
  // =========================

  const handleUpdateStatus = async (
    bookingId: number,
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED",
  ) => {
    const action =
      status === "CONFIRMED"
        ? "mengonfirmasi"
        : status === "CANCELLED"
          ? "membatalkan"
          : "menyelesaikan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} booking #${bookingId}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(bookingId);

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
      console.error("Update booking status error:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui booking.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // FILTERED BOOKINGS
  // =========================

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        String(booking.id).includes(query) ||
        booking.user.name.toLowerCase().includes(query) ||
        booking.user.email.toLowerCase().includes(query) ||
        (booking.user.phone || "").toLowerCase().includes(query) ||
        booking.restaurant.name.toLowerCase().includes(query) ||
        booking.table.tableNumber.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      const matchesDate =
        !dateFilter || getDateInputValue(booking.bookingDate) === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  // =========================
  // COUNTERS
  // =========================

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setDateFilter("");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "ALL" || dateFilter !== "";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* =========================
            TITLE
        ========================= */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            TableGo Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Kelola Booking
          </h1>

          <p className="mt-2 text-gray-600">
            Pantau dan proses seluruh booking restoran.
          </p>
        </div>

        {/* =========================
            SUMMARY
        ========================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Menunggu Konfirmasi
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Dikonfirmasi</p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {confirmedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Selesai</p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {completedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Dibatalkan</p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {cancelledCount}
            </p>
          </div>
        </div>

        {/* =========================
            FILTER
        ========================= */}

        {!loading && !errorMessage && bookings.length > 0 && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-gray-900">Filter Booking</h2>

              <p className="text-sm text-gray-500">
                Cari dan filter booking berdasarkan customer, restoran, meja,
                status, atau tanggal.
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
              {/* SEARCH */}

              <div>
                <label
                  htmlFor="booking-search"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Cari Booking
                </label>

                <input
                  id="booking-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Nama, ID, restoran, atau meja..."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* STATUS */}

              <div>
                <label
                  htmlFor="status-filter"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="CONFIRMED">Dikonfirmasi</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>

              {/* DATE */}

              <div>
                <label
                  htmlFor="date-filter"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Tanggal
                </label>

                <input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* RESET */}

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">
                  {filteredBookings.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-900">
                  {bookings.length}
                </span>{" "}
                booking
              </p>

              {hasActiveFilters && (
                <p className="text-xs font-medium text-green-600">
                  Filter sedang aktif
                </p>
              )}
            </div>
          </section>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat data booking...</p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">{errorMessage}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* =========================
            EMPTY
        ========================= */}

        {!loading && !errorMessage && bookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📋
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Belum ada booking
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Belum ada booking yang masuk ke sistem.
            </p>
          </div>
        )}

        {/* =========================
            FILTER EMPTY
        ========================= */}

        {!loading &&
          !errorMessage &&
          bookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🔎
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Booking tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Tidak ada booking yang sesuai dengan filter yang dipilih.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Reset Filter
              </button>
            </div>
          )}

        {/* =========================
            BOOKING LIST
        ========================= */}

        {!loading && !errorMessage && filteredBookings.length > 0 && (
          <div className="mt-8 space-y-5">
            {filteredBookings.map((booking) => {
              const status = statusConfig[booking.status];
              const isProcessing = processingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-6">
                    {/* BOOKING HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Booking #{booking.id}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                          {booking.user.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {booking.user.email}
                          {booking.user.phone ? ` · ${booking.user.phone}` : ""}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* BOOKING DETAIL */}

                    <div className="mt-6 grid gap-5 border-t border-gray-100 pt-6 md:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Restoran
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {booking.restaurant.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {booking.restaurant.address}
                        </p>
                      </div>

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
                          Meja {booking.table.tableNumber}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {booking.guestCount} orang · kapasitas{" "}
                          {booking.table.capacity}
                        </p>
                      </div>
                    </div>

                    {/* NOTES */}

                    {booking.notes && (
                      <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium text-gray-400">
                          Catatan Customer
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    {/* PENDING ACTIONS */}

                    {booking.status === "PENDING" && (
                      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, "CANCELLED")
                          }
                          disabled={isProcessing}
                          className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "Memproses..." : "Tolak Booking"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, "CONFIRMED")
                          }
                          disabled={isProcessing}
                          className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {isProcessing ? "Memproses..." : "Konfirmasi Booking"}
                        </button>
                      </div>
                    )}

                    {/* CONFIRMED ACTION */}

                    {booking.status === "CONFIRMED" && (
                      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, "CANCELLED")
                          }
                          disabled={isProcessing}
                          className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "Memproses..." : "Batalkan Booking"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, "COMPLETED")
                          }
                          disabled={isProcessing}
                          className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {isProcessing ? "Memproses..." : "Selesaikan Booking"}
                        </button>
                      </div>
                    )}

                    {/* FINAL STATUS - COMPLETED */}

                    {booking.status === "COMPLETED" && (
                      <div className="mt-6 border-t border-gray-100 pt-5">
                        <div className="rounded-xl bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-700">
                            Booking telah selesai.
                          </p>

                          <p className="mt-1 text-xs text-blue-600">
                            Meja sudah dapat digunakan kembali untuk booking
                            lain.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FINAL STATUS - CANCELLED */}

                    {booking.status === "CANCELLED" && (
                      <div className="mt-6 border-t border-gray-100 pt-5">
                        <div className="rounded-xl bg-red-50 p-4">
                          <p className="text-sm font-semibold text-red-700">
                            Booking telah dibatalkan.
                          </p>

                          <p className="mt-1 text-xs text-red-600">
                            Meja sudah tersedia kembali.
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
    </main>
  );
}
