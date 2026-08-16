"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AdminBookingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchAdminData() {
      try {
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

  const handleUpdateStatus = async (
    bookingId: number,
    status: "CONFIRMED" | "CANCELLED",
  ) => {
    const action = status === "CONFIRMED" ? "mengonfirmasi" : "membatalkan";

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal.");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                Halo, {user.name}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
            <p className="text-sm font-medium text-gray-500">Dibatalkan</p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {cancelledCount}
            </p>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat data booking...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">{errorMessage}</p>
          </div>
        )}

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

        {!loading && !errorMessage && bookings.length > 0 && (
          <div className="mt-8 space-y-5">
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
