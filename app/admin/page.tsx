"use client";

import { useEffect, useMemo, useState } from "react";
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

type Restaurant = {
  id: number;
  name: string;
  address: string;
  _count: {
    tables: number;
    bookings: number;
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
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

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

        const [bookingResponse, restaurantResponse] = await Promise.all([
          fetch("/api/admin/bookings", {
            credentials: "include",
          }),
          fetch("/api/admin/restaurants", {
            credentials: "include",
          }),
        ]);

        const bookingData = await bookingResponse.json();
        const restaurantData = await restaurantResponse.json();

        if (!bookingResponse.ok || !bookingData.success) {
          throw new Error(
            bookingData.message || "Gagal mengambil data booking.",
          );
        }

        if (!restaurantResponse.ok || !restaurantData.success) {
          throw new Error(
            restaurantData.message || "Gagal mengambil data restoran.",
          );
        }

        setBookings(bookingData.bookings);
        setRestaurants(restaurantData.restaurants);
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

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "PENDING"),
    [bookings],
  );

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CONFIRMED"),
    [bookings],
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CANCELLED"),
    [bookings],
  );

  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "COMPLETED"),
    [bookings],
  );

  const totalTables = useMemo(
    () =>
      restaurants.reduce(
        (total, restaurant) => total + restaurant._count.tables,
        0,
      ),
    [restaurants],
  );

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/admin" className="text-2xl font-bold tracking-tight">
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
            Dashboard TableGo
          </h1>

          <p className="mt-2 text-gray-600">
            Pantau restoran, meja, dan reservasi TableGo dari satu tempat.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat dashboard admin...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">{errorMessage}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !errorMessage && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Restoran</p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {restaurants.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    🏪
                  </div>
                </div>

                <Link
                  href="/admin/restaurants"
                  className="mt-4 inline-block text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  Kelola Restoran →
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Meja</p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {totalTables}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    🪑
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Tersebar di {restaurants.length} restoran
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Booking</p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {bookings.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    📅
                  </div>
                </div>

                <Link
                  href="/admin/bookings"
                  className="mt-4 inline-block text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  Kelola Booking →
                </Link>
              </div>

              <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-yellow-700">
                      Menunggu Konfirmasi
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-800">
                      {pendingBookings.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl">
                    ⏳
                  </div>
                </div>

                <Link
                  href="/admin/bookings"
                  className="mt-4 inline-block text-sm font-semibold text-yellow-700 hover:text-yellow-800"
                >
                  Proses Sekarang →
                </Link>
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                <p className="text-sm font-medium text-green-700">
                  Dikonfirmasi
                </p>

                <p className="mt-2 text-2xl font-bold text-green-800">
                  {confirmedBookings.length}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-700">Selesai</p>

                <p className="mt-2 text-2xl font-bold text-blue-800">
                  {completedBookings.length}
                </p>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <p className="text-sm font-medium text-red-700">Dibatalkan</p>

                <p className="mt-2 text-2xl font-bold text-red-800">
                  {cancelledBookings.length}
                </p>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Booking Terbaru
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Lima booking terbaru yang masuk ke TableGo.
                  </p>
                </div>

                <Link
                  href="/admin/bookings"
                  className="text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  Lihat semua booking →
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                    📅
                  </div>

                  <h3 className="mt-4 font-semibold text-gray-900">
                    Belum ada booking
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Booking baru akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {recentBookings.map((booking) => {
                      const status = statusConfig[booking.status];

                      return (
                        <div
                          key={booking.id}
                          className="p-5 transition hover:bg-gray-50"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                  Booking #{booking.id}
                                </p>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              <h3 className="mt-2 font-bold text-gray-900">
                                {booking.user.name}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                {booking.restaurant.name} · Meja{" "}
                                {booking.table.tableNumber}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:min-w-[420px]">
                              <div>
                                <p className="text-xs text-gray-400">Tanggal</p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatDate(booking.bookingDate)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-400">Waktu</p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatTime(booking.bookingDate)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-400">Tamu</p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {booking.guestCount} orang
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Akses Cepat</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Kelola bagian utama TableGo.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href="/admin/restaurants"
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                      🏪
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600">
                        Kelola Restoran
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Tambahkan, edit, hapus restoran, dan kelola informasi
                        restoran.
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/bookings"
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                      📅
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600">
                        Kelola Booking
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Lihat booking masuk dan proses reservasi yang masih
                        menunggu konfirmasi.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
