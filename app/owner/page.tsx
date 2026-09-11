import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

function Icon({
  name,
}: {
  name:
    | "restaurant"
    | "admin"
    | "manager"
    | "booking"
    | "arrow"
    | "users"
    | "check"
    | "clock"
    | "cancel";
}) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "restaurant") {
    return (
      <svg {...common}>
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
        <path d="M2 21h20" />
        <path d="M8 7h2" />
        <path d="M14 7h2" />
        <path d="M8 11h2" />
        <path d="M14 11h2" />
        <path d="M8 15h2" />
        <path d="M14 15h2" />
      </svg>
    );
  }

  if (name === "admin") {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.5 2.9 8.2 7 10 4.1-1.8 7-5.5 7-10V6l-7-3Z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    );
  }

  if (name === "manager") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" />
      </svg>
    );
  }

  if (name === "booking") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 9h18" />
        <path d="M8 13h3M8 17h5" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "cancel") {
    return (
      <svg {...common}>
        <path d="m7 7 10 10M17 7 7 17" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function OwnerDashboardPage() {
  const owner = await getCurrentOwner();

  if (!owner) {
    redirect("/login");
  }

  const [
    totalRestaurants,
    totalAdmins,
    totalManagers,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    expiredBookings,
  ] = await Promise.all([
    prisma.restaurant.count(),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    prisma.user.count({
      where: {
        role: "MANAGER",
      },
    }),

    prisma.booking.count(),

    prisma.booking.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.booking.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.booking.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.booking.count({
      where: {
        status: "EXPIRED",
      },
    }),
  ]);

  const finishedBookings = completedBookings;

  const cancelledTotal = cancelledBookings + expiredBookings;

  const completionRate =
    totalBookings > 0
      ? Math.round((finishedBookings / totalBookings) * 100)
      : 0;

  const pendingRate =
    totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0;

  const confirmedRate =
    totalBookings > 0
      ? Math.round((confirmedBookings / totalBookings) * 100)
      : 0;

  const cancelledRate =
    totalBookings > 0 ? Math.round((cancelledTotal / totalBookings) * 100) : 0;

  const recentBookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      bookingDate: true,
      guestCount: true,
      status: true,
      restaurant: {
        select: {
          name: true,
        },
      },
      table: {
        select: {
          tableNumber: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const statusConfig: Record<
    BookingStatus,
    {
      label: string;
      className: string;
      icon: "clock" | "check" | "cancel";
    }
  > = {
    PENDING: {
      label: "Menunggu",
      className: "bg-amber-50 text-amber-700",
      icon: "clock",
    },
    CONFIRMED: {
      label: "Dikonfirmasi",
      className: "bg-green-50 text-green-700",
      icon: "check",
    },
    COMPLETED: {
      label: "Selesai",
      className: "bg-blue-50 text-blue-700",
      icon: "check",
    },
    CANCELLED: {
      label: "Dibatalkan",
      className: "bg-red-50 text-red-700",
      icon: "cancel",
    },
    EXPIRED: {
      label: "Expired",
      className: "bg-gray-100 text-gray-600",
      icon: "cancel",
    },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-600">
              Overview
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Pantau ekosistem TableGo dalam satu dashboard.
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              {owner.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {owner.name}
              </p>

              <p className="text-xs text-gray-500">Owner TableGo</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* WELCOME */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gray-950 px-6 py-7 text-white shadow-sm lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
                Owner Control Center
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Selamat datang kembali, {owner.name}.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Pantau pertumbuhan restoran, tim, dan aktivitas reservasi
                TableGo dari satu tempat.
              </p>
            </div>

            <Link
              href="/owner/admins"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Kelola Admin
              <Icon name="arrow" />
            </Link>
          </div>
        </section>

        {/* KPI */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Restoran
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {formatNumber(totalRestaurants)}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Total restoran TableGo
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Icon name="restaurant" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Admin
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {formatNumber(totalAdmins)}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Administrator aktif
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon name="admin" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Manager
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {formatNumber(totalManagers)}
                </p>

                <p className="mt-1 text-sm text-gray-500">Manager restoran</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Icon name="manager" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Booking
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                  {formatNumber(totalBookings)}
                </p>

                <p className="mt-1 text-sm text-gray-500">Total reservasi</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon name="booking" />
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          {/* BOOKING OVERVIEW */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                  Business Overview
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Performa Reservasi
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ringkasan status seluruh booking TableGo.
                </p>
              </div>

              <div className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
                {formatNumber(totalBookings)} booking
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Menunggu
                  </span>

                  <span className="text-amber-600">
                    <Icon name="clock" />
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {formatNumber(pendingBookings)}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${pendingRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Dikonfirmasi
                  </span>

                  <span className="text-green-600">
                    <Icon name="check" />
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {formatNumber(confirmedBookings)}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${confirmedRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Selesai
                  </span>

                  <span className="text-blue-600">
                    <Icon name="check" />
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {formatNumber(completedBookings)}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Tingkat penyelesaian booking
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Persentase booking yang sudah selesai.
                  </p>
                </div>

                <p className="text-lg font-bold text-gray-900">
                  {completionRate}%
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400">Dibatalkan</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatNumber(cancelledBookings)}
                  </p>
                </div>

                <div className="text-red-500">
                  <Icon name="cancel" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400">Expired</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatNumber(expiredBookings)}
                  </p>
                </div>

                <div className="text-gray-400">
                  <Icon name="clock" />
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACCESS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
              Quick Access
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Kontrol Owner
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Akses cepat untuk mengelola ekosistem TableGo.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/owner/admins"
                className="group flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Icon name="admin" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Kelola Admin
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Tambah, edit, dan hapus Admin.
                    </p>
                  </div>
                </div>

                <span className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-green-600">
                  <Icon name="arrow" />
                </span>
              </Link>

              <Link
                href="/owner/managers"
                className="group flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-purple-200 hover:bg-purple-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Icon name="manager" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Kelola Manager
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Kelola manager restoran TableGo.
                    </p>
                  </div>
                </div>

                <span className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-purple-600">
                  <Icon name="arrow" />
                </span>
              </Link>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                  <Icon name="users" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Tim TableGo
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {formatNumber(totalAdmins)} Admin dan{" "}
                    {formatNumber(totalManagers)} Manager terdaftar di platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT BOOKINGS */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Booking Terbaru
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Aktivitas reservasi terbaru di seluruh restoran.
              </p>
            </div>

            <span className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
              5 terbaru
            </span>
          </div>

          {recentBookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Icon name="booking" />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Belum ada booking
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Aktivitas booking akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Customer
                    </th>

                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Restoran
                    </th>

                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Meja
                    </th>

                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Tanggal
                    </th>

                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Tamu
                    </th>

                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking) => {
                    const status =
                      statusConfig[booking.status as BookingStatus];

                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.user.name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            Booking #{booking.id}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">
                            {booking.restaurant.name}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-700">
                            T{booking.table.tableNumber}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {formatDate(booking.bookingDate)}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Intl.DateTimeFormat("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Jakarta",
                            }).format(booking.bookingDate)}{" "}
                            WIB
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {booking.guestCount} orang
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <Icon name={status.icon} />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
