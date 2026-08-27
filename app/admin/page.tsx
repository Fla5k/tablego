"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type Restaurant = {
  id: number;
  name: string;
  address: string;
  _count: {
    tables: number;
    bookings: number;
  };
};

type Manager = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "MANAGER";
  emailVerified: boolean;
  restaurantId: number | null;
  restaurant: {
    id: number;
    name: string;
    address: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
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
  EXPIRED: {
    label: "Kedaluwarsa",
    className: "bg-gray-50 text-gray-700",
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

function formatCreatedDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function AdminPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [creatingManager, setCreatingManager] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [managerMessage, setManagerMessage] = useState("");
  const [managerError, setManagerError] = useState("");

  const [showManagerForm, setShowManagerForm] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [deletingManagerId, setDeletingManagerId] = useState<number | null>(
    null,
  );

  const [managerForm, setManagerForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    restaurantId: "",
  });

  async function fetchManagers() {
    try {
      setLoadingManagers(true);
      setManagerError("");

      const response = await fetch("/api/admin/managers", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data Manager.");
      }

      setManagers(data.managers || []);
    } catch (error) {
      console.error("Fetch managers error:", error);

      setManagerError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data Manager.",
      );
    } finally {
      setLoadingManagers(false);
    }
  }

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const userResponse = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
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

        const [bookingResponse, restaurantResponse, managerResponse] =
          await Promise.all([
            fetch("/api/admin/bookings", {
              credentials: "include",
              cache: "no-store",
            }),
            fetch("/api/admin/restaurants", {
              credentials: "include",
              cache: "no-store",
            }),
            fetch("/api/admin/managers", {
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        const bookingData = await bookingResponse.json();
        const restaurantData = await restaurantResponse.json();
        const managerData = await managerResponse.json();

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

        if (!managerResponse.ok || !managerData.success) {
          throw new Error(
            managerData.message || "Gagal mengambil data Manager.",
          );
        }

        setBookings(bookingData.bookings || []);
        setRestaurants(restaurantData.restaurants || []);
        setManagers(managerData.managers || []);
      } catch (error) {
        console.error("Admin dashboard error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil data.",
        );
      } finally {
        setLoading(false);
        setLoadingManagers(false);
      }
    }

    fetchAdminData();
  }, [router]);

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

  async function handleCreateManager(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreatingManager(true);
    setManagerMessage("");
    setManagerError("");

    try {
      if (!managerForm.name.trim()) {
        throw new Error("Nama Manager wajib diisi.");
      }

      if (!managerForm.email.trim()) {
        throw new Error("Email Manager wajib diisi.");
      }

      if (!managerForm.password) {
        throw new Error("Password Manager wajib diisi.");
      }

      if (managerForm.password.length < 6) {
        throw new Error("Password minimal 6 karakter.");
      }

      if (!managerForm.restaurantId) {
        throw new Error("Cabang/restoran wajib dipilih.");
      }

      const response = await fetch("/api/admin/managers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: managerForm.name.trim(),
          email: managerForm.email.trim(),
          password: managerForm.password,
          phone: managerForm.phone.trim(),
          restaurantId: Number(managerForm.restaurantId),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal membuat akun Manager.");
      }

      setManagerMessage(data.message || "Akun Manager berhasil dibuat.");

      setManagerForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        restaurantId: "",
      });

      await fetchManagers();
    } catch (error) {
      console.error("Create manager error:", error);

      setManagerError(
        error instanceof Error ? error.message : "Gagal membuat akun Manager.",
      );
    } finally {
      setCreatingManager(false);
    }
  }

  const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 disabled:text-gray-500";


  async function handleDeleteManager(manager: Manager) {
    const confirmed = window.confirm(
      `Hapus Manager "${manager.name}"?\n\nAkun Manager ini akan dihapus dan tidak dapat digunakan untuk login lagi.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingManagerId(manager.id);
      setManagerError("");
      setManagerMessage("");

      const response = await fetch("/api/admin/managers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          managerId: manager.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus Manager.");
      }

      setManagers((currentManagers) =>
        currentManagers.filter(
          (currentManager) => currentManager.id !== manager.id,
        ),
      );

      setSelectedManager(null);
      setManagerMessage(data.message || "Manager berhasil dihapus.");
    } catch (error) {
      console.error("Delete manager error:", error);

      setManagerError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus Manager.",
      );
    } finally {
      setDeletingManagerId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Dashboard TableGo
          </h1>

          <p className="mt-2 text-gray-600">
            Pantau restoran, meja, reservasi, dan Manager TableGo dari satu
            tempat.
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
                    Manajemen Manager
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Buat dan pantau akun Manager berdasarkan cabang restoran.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowManagerForm((current) => !current);
                    setManagerMessage("");
                    setManagerError("");
                  }}
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  {showManagerForm ? "Tutup Form" : "+ Tambah Manager"}
                </button>
              </div>

              {managerMessage && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">
                    {managerMessage}
                  </p>
                </div>
              )}

              {managerError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    {managerError}
                  </p>
                </div>
              )}

              {showManagerForm && (
                <form
                  onSubmit={handleCreateManager}
                  className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Buat Akun Manager
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Manager hanya akan mengelola booking dari cabang yang
                      dipilih.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="manager-name"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Nama Manager
                      </label>

                      <input
                        id="manager-name"
                        type="text"
                        value={managerForm.name}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Contoh: Budi Santoso"
                        disabled={creatingManager}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="manager-email"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Email
                      </label>

                      <input
                        id="manager-email"
                        type="email"
                        value={managerForm.email}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="manager@tablego.com"
                        disabled={creatingManager}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="manager-password"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Password
                      </label>

                      <input
                        id="manager-password"
                        type="password"
                        value={managerForm.password}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Minimal 6 karakter"
                        disabled={creatingManager}
                        className={inputClassName}
                      />

                      <p className="mt-2 text-xs text-gray-400">
                        Password akan disimpan dalam bentuk hash.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="manager-phone"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        No. Telepon
                      </label>

                      <input
                        id="manager-phone"
                        type="tel"
                        value={managerForm.phone}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="08xxxxxxxxxx"
                        disabled={creatingManager}
                        className={inputClassName}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="manager-restaurant"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Pilih Cabang / Restoran
                      </label>

                      <select
                        id="manager-restaurant"
                        value={managerForm.restaurantId}
                        onChange={(event) =>
                          setManagerForm((current) => ({
                            ...current,
                            restaurantId: event.target.value,
                          }))
                        }
                        disabled={creatingManager}
                        className={`${inputClassName} cursor-pointer`}
                      >
                        <option value="" className="bg-white text-gray-900">
                          -- Pilih cabang yang dikelola --
                        </option>

                        {restaurants.map((restaurant) => (
                          <option
                            key={restaurant.id}
                            value={restaurant.id}
                            className="bg-white text-gray-900"
                          >
                            {restaurant.name} — {restaurant.address}
                          </option>
                        ))}
                      </select>

                      {restaurants.length === 0 && (
                        <p className="mt-2 text-xs text-red-500">
                          Belum ada restoran. Tambahkan restoran terlebih
                          dahulu.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManagerForm(false);
                        setManagerMessage("");
                        setManagerError("");
                      }}
                      disabled={creatingManager}
                      className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={creatingManager || restaurants.length === 0}
                      className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {creatingManager
                        ? "Membuat Akun..."
                        : "Buat Akun Manager"}
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {loadingManagers ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">
                      Memuat data Manager...
                    </p>
                  </div>
                ) : managers.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                      👤
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                      Belum ada Manager
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Buat akun Manager pertama untuk mengelola booking
                      berdasarkan cabang.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {managers.map((manager) => (
                      <button
                        key={manager.id}
                        type="button"
                        onClick={() => setSelectedManager(manager)}
                        className="block w-full p-5 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-lg text-white">
                              👤
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-gray-900">
                                  {manager.name}
                                </h3>

                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                  MANAGER
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-gray-500">
                                {manager.email}
                              </p>

                              {manager.phone && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {manager.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[480px]">
                            <div className="rounded-xl bg-gray-50 p-4">
                              <p className="text-xs font-medium text-gray-400">
                                Cabang yang Dikelola
                              </p>

                              <p className="mt-1 font-semibold text-gray-900">
                                {manager.restaurant?.name || "Belum ditentukan"}
                              </p>

                              {manager.restaurant?.address && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {manager.restaurant.address}
                                </p>
                              )}
                            </div>

                            <div className="rounded-xl bg-gray-50 p-4">
                              <p className="text-xs font-medium text-gray-400">
                                Status Email
                              </p>

                              <p
                                className={`mt-1 font-semibold ${
                                  manager.emailVerified
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {manager.emailVerified
                                  ? "Terverifikasi"
                                  : "Belum Terverifikasi"}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Dibuat {formatCreatedDate(manager.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                      const status = statusConfig[booking.status] ?? {
                        label: booking.status,
                        className: "bg-gray-100 text-gray-600",
                      };

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

              <div className="grid gap-4 md:grid-cols-3">
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

                <button
                  type="button"
                  onClick={() => {
                    setShowManagerForm(true);

                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    });
                  }}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xl text-white">
                      👤
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600">
                        Kelola Manager
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Buat akun Manager dan tentukan cabang yang mereka
                        kelola.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {selectedManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 py-8"
          onClick={() => {
            if (!deletingManagerId) {
              setSelectedManager(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manager-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
                    Detail Manager
                  </p>

                  <h2
                    id="manager-detail-title"
                    className="mt-1 text-2xl font-bold text-gray-900"
                  >
                    {selectedManager.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedManager(null)}
                  disabled={deletingManagerId !== null}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Tutup detail Manager"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-2xl text-white">
                  👤
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">
                      {selectedManager.name}
                    </p>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      MANAGER
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    ID Manager #{selectedManager.id}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Informasi Akun
                </h3>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-medium text-gray-400">Email</p>
                    <p className="mt-1 break-all font-semibold text-gray-900">
                      {selectedManager.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-medium text-gray-400">
                      No. Telepon
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedManager.phone || "Belum diisi"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-medium text-gray-400">
                      Status Email
                    </p>
                    <p
                      className={`mt-1 font-semibold ${
                        selectedManager.emailVerified
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {selectedManager.emailVerified
                        ? "Terverifikasi"
                        : "Belum Terverifikasi"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-medium text-gray-400">
                      Tanggal Dibuat
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCreatedDate(selectedManager.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Cabang yang Dikelola
                </h3>

                <div className="mt-3 rounded-2xl border border-gray-100 p-5">
                  {selectedManager.restaurant ? (
                    <>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedManager.restaurant.name}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {selectedManager.restaurant.address}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Manager belum memiliki cabang.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setSelectedManager(null)}
                disabled={deletingManagerId !== null}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => handleDeleteManager(selectedManager)}
                disabled={deletingManagerId === selectedManager.id}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {deletingManagerId === selectedManager.id
                  ? "Menghapus..."
                  : "Hapus Manager"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
