"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  bookingDate: string;
  guestCount: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
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

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
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

export default function BookingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userResponse, bookingsResponse] = await Promise.all([
          fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          }),
          fetch("/api/bookings/me", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const userData = await userResponse.json();
        const bookingData = await bookingsResponse.json();

        if (!userResponse.ok || !userData.success || !userData.user) {
          router.push("/login");
          return;
        }

        if (!bookingsResponse.ok || !bookingData.success) {
          throw new Error(
            bookingData.message || "Gagal mengambil data booking.",
          );
        }

        setUser(userData.user);
        setBookings(bookingData.bookings);
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

    fetchData();
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

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/restaurants"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-green-500"
            >
              Restoran
            </Link>

            <Link
              href="/bookings"
              className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-600"
            >
              Booking Saya
            </Link>

            {user && (
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                Halo, {user.name}
              </span>
            )}

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

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Heading */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            TableGo
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Booking Saya
          </h1>

          <p className="mt-2 text-gray-600">
            Lihat dan pantau semua booking restoran kamu.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat data booking...</p>
          </div>
        )}

        {/* Error */}
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

        {/* Empty */}
        {!loading && !errorMessage && bookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl">
              🍽️
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Belum ada booking
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Kamu belum memiliki booking restoran.
            </p>

            <Link
              href="/restaurants"
              className="mt-6 inline-block rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Cari Restoran
            </Link>
          </div>
        )}

        {/* Booking List */}
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
                    {/* Top */}
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

                    {/* Details */}
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

                    {/* Notes */}
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
