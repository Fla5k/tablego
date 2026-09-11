"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: number;
  name: string;
  address: string;
};

type Manager = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "MANAGER";
  emailVerified: boolean;
  restaurantId: number | null;
  restaurant: Restaurant | null;
  createdAt: string;
  updatedAt?: string;
};

type ManagerForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurantId: string;
};

export default function OwnerManagersPage() {
  const router = useRouter();

  const [managers, setManagers] = useState<Manager[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [restaurantFilter, setRestaurantFilter] = useState("ALL");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState<ManagerForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    restaurantId: "",
  });

  const isEditing = Boolean(selectedManager);

  async function fetchData() {
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

      if (userData.user.role !== "OWNER") {
        router.push("/restaurants");
        return;
      }

      const [managerResponse, restaurantResponse] = await Promise.all([
        fetch("/api/owner/managers", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/owner/restaurants", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const managerData = await managerResponse.json();
      const restaurantData = await restaurantResponse.json();

      if (!managerResponse.ok || !managerData.success) {
        throw new Error(managerData.message || "Gagal mengambil data Manager.");
      }

      if (!restaurantResponse.ok || !restaurantData.success) {
        throw new Error(
          restaurantData.message || "Gagal mengambil data restoran.",
        );
      }

      setManagers(managerData.managers || []);
      setRestaurants(restaurantData.restaurants || []);
    } catch (error) {
      console.error("Owner managers page error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      restaurantId: "",
    });

    setSelectedManager(null);
  }

  function openCreateForm() {
    resetForm();
    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function openEditForm(manager: Manager) {
    setSelectedManager(manager);

    setForm({
      name: manager.name,
      email: manager.email,
      phone: manager.phone || "",
      password: "",
      restaurantId: manager.restaurantId ? String(manager.restaurantId) : "",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error("Nama Manager wajib diisi.");
      }

      if (!isEditing && !form.email.trim()) {
        throw new Error("Email Manager wajib diisi.");
      }

      if (!isEditing && !form.password) {
        throw new Error("Password Manager wajib diisi.");
      }

      if (!form.restaurantId) {
        throw new Error("Cabang restoran wajib dipilih.");
      }

      if (form.password && form.password.length < 12) {
        throw new Error("Password minimal 12 karakter.");
      }

      if (isEditing && selectedManager) {
        const response = await fetch("/api/owner/managers", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            managerId: selectedManager.id,
            name: form.name.trim(),
            phone: form.phone.trim(),
            password: form.password || undefined,
            restaurantId: Number(form.restaurantId),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal memperbarui Manager.");
        }

        setSuccessMessage(data.message || "Data Manager berhasil diperbarui.");
      } else {
        const response = await fetch("/api/owner/managers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            phone: form.phone.trim(),
            restaurantId: Number(form.restaurantId),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal membuat akun Manager.");
        }

        setSuccessMessage(data.message || "Akun Manager berhasil dibuat.");
      }

      setShowForm(false);
      resetForm();

      await fetchData();
    } catch (error) {
      console.error("Save owner manager error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data Manager.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(manager: Manager) {
    const confirmed = window.confirm(
      `Hapus Manager "${manager.name}"?\n\nAkun ini akan dihapus dan Manager tidak dapat login lagi.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(manager.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/owner/managers", {
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

      setManagers((current) =>
        current.filter((item) => item.id !== manager.id),
      );

      if (selectedManager?.id === manager.id) {
        closeForm();
      }

      setSuccessMessage(data.message || "Manager berhasil dihapus.");
    } catch (error) {
      console.error("Delete owner manager error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus Manager.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredManagers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return managers.filter((manager) => {
      const matchesSearch =
        !keyword ||
        manager.name.toLowerCase().includes(keyword) ||
        manager.email.toLowerCase().includes(keyword) ||
        (manager.phone || "").toLowerCase().includes(keyword) ||
        (manager.restaurant?.name || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "VERIFIED" && manager.emailVerified) ||
        (statusFilter === "UNVERIFIED" && !manager.emailVerified);

      const matchesRestaurant =
        restaurantFilter === "ALL" ||
        String(manager.restaurantId) === restaurantFilter;

      return matchesSearch && matchesStatus && matchesRestaurant;
    });
  }, [managers, search, statusFilter, restaurantFilter]);

  const verifiedCount = managers.filter(
    (manager) => manager.emailVerified,
  ).length;

  const unverifiedCount = managers.length - verifiedCount;

  const assignedRestaurantCount = new Set(
    managers
      .map((manager) => manager.restaurantId)
      .filter((id): id is number => id !== null),
  ).size;

  const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Owner Panel
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Kelola Manager
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Kelola akun Manager, status verifikasi, dan cabang restoran yang
              mereka tangani.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            <span className="text-lg leading-none">+</span>
            Tambah Manager
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-gray-400">
          <button
            type="button"
            onClick={() => router.push("/owner")}
            className="transition hover:text-green-600"
          >
            Dashboard
          </button>

          <span>/</span>

          <span className="font-medium text-gray-700">Kelola Manager</span>
        </div>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>

              <div>
                <p className="text-sm font-semibold text-green-800">Berhasil</p>

                <p className="mt-0.5 text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Terjadi kesalahan
                </p>

                <p className="mt-0.5 text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Manager</p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {managers.length}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                ♙
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Seluruh Manager TableGo
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Terverifikasi</p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {verifiedCount}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                ✓
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Email sudah diverifikasi
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Belum Verifikasi
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {unverifiedCount}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                !
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Menunggu verifikasi email
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Cabang Terisi</p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {assignedRestaurantCount}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                ◈
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Cabang yang memiliki Manager
            </p>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-600">
                    {isEditing ? "Edit Manager" : "Manager Baru"}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {isEditing ? "Perbarui Data Manager" : "Tambah Manager"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {isEditing
                      ? "Perbarui informasi dan cabang Manager."
                      : "Buat akun Manager dan tentukan cabang yang dikelolanya."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="owner-manager-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Nama Manager
                </label>

                <input
                  id="owner-manager-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Budi Santoso"
                  disabled={saving}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="owner-manager-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="owner-manager-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="manager@tablego.com"
                  disabled={saving || isEditing}
                  className={inputClassName}
                />

                {isEditing && (
                  <p className="mt-2 text-xs text-gray-400">
                    Email tidak dapat diubah.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="owner-manager-phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  No. Telepon
                </label>

                <input
                  id="owner-manager-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="08xxxxxxxxxx"
                  disabled={saving}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="owner-manager-restaurant"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Cabang Restoran
                </label>

                <select
                  id="owner-manager-restaurant"
                  value={form.restaurantId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      restaurantId: event.target.value,
                    }))
                  }
                  disabled={saving}
                  className={inputClassName}
                >
                  <option value="">Pilih cabang restoran</option>

                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="owner-manager-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                  {isEditing && (
                    <span className="ml-2 font-normal text-gray-400">
                      (opsional)
                    </span>
                  )}
                </label>

                <input
                  id="owner-manager-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder={
                    isEditing
                      ? "Kosongkan jika tidak ingin mengganti password"
                      : "Minimal 12 karakter"
                  }
                  disabled={saving}
                  className={inputClassName}
                />

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Password harus memiliki minimal 12 karakter, huruf besar,
                  huruf kecil, angka, dan karakter khusus.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : isEditing
                    ? "Simpan Perubahan"
                    : "Buat Manager"}
              </button>
            </div>
          </form>
        )}

        <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Daftar Manager
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredManagers.length} dari {managers.length} Manager
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari Manager..."
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:bg-white"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="VERIFIED">Terverifikasi</option>
                  <option value="UNVERIFIED">Belum Verifikasi</option>
                </select>

                <select
                  value={restaurantFilter}
                  onChange={(event) => setRestaurantFilter(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-500 focus:bg-white"
                >
                  <option value="ALL">Semua Cabang</option>

                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

              <p className="mt-4 text-sm text-gray-500">
                Memuat data Manager...
              </p>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-xl text-gray-500">
                ♙
              </div>

              <h3 className="mt-4 text-base font-bold text-gray-900">
                Tidak ada Manager
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Belum ada Manager yang sesuai dengan pencarian atau filter yang
                dipilih.
              </p>

              {!search &&
                statusFilter === "ALL" &&
                restaurantFilter === "ALL" && (
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    + Tambah Manager
                  </button>
                )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Manager
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Kontak
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Cabang
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Bergabung
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredManagers.map((manager) => (
                      <tr
                        key={manager.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                              {manager.name.trim().charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">
                                {manager.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-gray-400">
                                ID Manager #{manager.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-gray-700">
                            {manager.email}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {manager.phone || "No. telepon belum diisi"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          {manager.restaurant ? (
                            <>
                              <p className="text-sm font-semibold text-gray-800">
                                {manager.restaurant.name}
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                                {manager.restaurant.address}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Belum ditentukan
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {manager.emailVerified ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Belum Verifikasi
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {formatDate(manager.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(manager)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(manager)}
                              disabled={deletingId === manager.id}
                              className="rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === manager.id ? "..." : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredManagers.map((manager) => (
                  <div key={manager.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                          {manager.name.trim().charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {manager.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {manager.email}
                          </p>
                        </div>
                      </div>

                      {manager.emailVerified ? (
                        <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Cabang
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {manager.restaurant?.name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Bergabung
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatDate(manager.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(manager)}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(manager)}
                        disabled={deletingId === manager.id}
                        className="flex-1 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === manager.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
