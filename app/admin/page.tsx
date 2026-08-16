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

export default function AdminPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const userResponse = await fetch("/api/auth/me", {
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

        setAdmin(userData.user);

        const bookingResponse = await fetch("/api/admin/bookings", {
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
        console.error("Admin dashboard error:", error);

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

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

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
      setLoggingOut(false);
    }
  };

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-gray-700 sm:block">
              Admin: {admin?.name || "Loading..."}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Kelola Booking
          </h1>

          <p className="mt-2 text-gray-600">
            Pantau semua reservasi yang masuk ke TableGo.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Booking</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
            <p className="text-sm text-yellow-700">Menunggu</p>
            <p className="mt-2 text-3xl font-bold text-yellow-800">
              {pendingBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-sm text-green-700">Dikonfirmasi</p>
            <p className="mt-2 text-3xl font-bold text-green-800">
              {confirmedBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-700">Dibatalkan</p>
            <p className="mt-2 text-3xl font-bold text-red-800">
              {cancelledBookings.length}
            </p>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat dashboard admin...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">{errorMessage}</p>
          </div>
        )}

        {!loading && !errorMessage && (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Semua Booking</h2>

              <p className="mt-1 text-sm text-gray-500">
                Booking terbaru ditampilkan terlebih dahulu.
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-gray-500">Belum ada booking masuk.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => {
                  const status = statusConfig[booking.status];

                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Booking #{booking.id}
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-gray-900">
                            {booking.user.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {booking.user.email}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400">
                            Restoran
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {booking.restaurant.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-400">
                            Meja
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            Meja {booking.table.tableNumber}
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
                      </div>

                      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-gray-400">Jumlah Tamu</p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {booking.guestCount} orang
                          </p>
                        </div>

                        {booking.user.phone && (
                          <div>
                            <p className="text-xs text-gray-400">No. Telepon</p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {booking.user.phone}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-400">
                            Kapasitas Meja
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {booking.table.capacity} orang
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
