"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function ManagersPage() {
  const router = useRouter();

  const [managers, setManagers] = useState<Manager[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);
  const [creatingManager, setCreatingManager] = useState(false);
  const [deletingManagerId, setDeletingManagerId] = useState<number | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    restaurantId: "",
  });

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

      if (userData.user.role !== "ADMIN") {
        router.push("/restaurants");
        return;
      }

      const [managerResponse, restaurantResponse] = await Promise.all([
        fetch("/api/admin/managers", {
          credentials: "include",
          cache: "no-store",
        }),

        fetch("/api/admin/restaurants", {
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
      console.error("Managers page error:", error);

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

  async function handleCreateManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreatingManager(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error("Nama Manager wajib diisi.");
      }

      if (!form.email.trim()) {
        throw new Error("Email Manager wajib diisi.");
      }

      if (!form.password) {
        throw new Error("Password Manager wajib diisi.");
      }

      if (form.password.length < 12) {
        throw new Error("Password minimal 12 karakter.");
      }

      if (!form.restaurantId) {
        throw new Error("Cabang/restoran wajib dipilih.");
      }

      const response = await fetch("/api/admin/managers", {
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

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        restaurantId: "",
      });

      setShowForm(false);

      await fetchData();
    } catch (error) {
      console.error("Create manager error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal membuat akun Manager.",
      );
    } finally {
      setCreatingManager(false);
    }
  }

  async function handleDeleteManager(manager: Manager) {
    const confirmed = window.confirm(
      `Hapus Manager "${manager.name}"?\n\nAkun Manager ini akan dihapus dan tidak dapat digunakan untuk login lagi.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingManagerId(manager.id);
      setErrorMessage("");
      setSuccessMessage("");

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

      setManagers((current) =>
        current.filter((item) => item.id !== manager.id),
      );

      setSelectedManager(null);

      setSuccessMessage(data.message || "Manager berhasil dihapus.");
    } catch (error) {
      console.error("Delete manager error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus Manager.",
      );
    } finally {
      setDeletingManagerId(null);
    }
  }

  const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Manajemen Manager
            </h1>

            <p className="mt-2 text-gray-600">
              Kelola akun Manager dan tentukan cabang restoran yang mereka
              kelola.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            {showForm ? "Tutup Form" : "+ Tambah Manager"}
          </button>
        </div>

        {/* BREADCRUMB */}
        <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="transition hover:text-green-600"
          >
            Dashboard
          </button>

          <span>→</span>

          <span className="font-medium text-gray-900">Manajemen Manager</span>
        </div>

        {/* SUCCESS */}
        {successMessage && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">
              {successMessage}
            </p>
          </div>
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <form
            onSubmit={handleCreateManager}
            className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Buat Akun Manager
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manager hanya akan mengelola booking dari cabang yang dipilih.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* NAME */}
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
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Budi Santoso"
                  disabled={creatingManager}
                  className={inputClassName}
                />
              </div>

              {/* EMAIL */}
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
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="manager@tablego.com"
                  disabled={creatingManager}
                  className={inputClassName}
                />
              </div>

              {/* PASSWORD */}
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
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimal 12 karakter"
                  disabled={creatingManager}
                  className={inputClassName}
                />

                <p className="mt-2 text-xs text-gray-400">
                  Minimal 12 karakter dengan huruf besar, huruf kecil, angka,
                  dan karakter khusus.
                </p>
              </div>

              {/* PHONE */}
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
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="08xxxxxxxxxx"
                  disabled={creatingManager}
                  className={inputClassName}
                />
              </div>

              {/* RESTAURANT */}
              <div className="md:col-span-2">
                <label
                  htmlFor="manager-restaurant"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Cabang / Restoran
                </label>

                <select
                  id="manager-restaurant"
                  value={form.restaurantId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      restaurantId: event.target.value,
                    }))
                  }
                  disabled={creatingManager}
                  className={`${inputClassName} cursor-pointer`}
                >
                  <option value="">-- Pilih cabang yang dikelola --</option>

                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} — {restaurant.address}
                    </option>
                  ))}
                </select>

                {restaurants.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    Belum ada restoran. Tambahkan restoran terlebih dahulu.
                  </p>
                )}
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                disabled={creatingManager}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={creatingManager || restaurants.length === 0}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {creatingManager ? "Membuat Akun..." : "Buat Akun Manager"}
              </button>
            </div>
          </form>
        )}

        {/* MANAGER LIST */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Daftar Manager
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Total {managers.length} Manager terdaftar.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-gray-500">Memuat data Manager...</p>
            </div>
          ) : managers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                👤
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Belum ada Manager
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Buat akun Manager pertama untuk mengelola booking berdasarkan
                cabang.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
            </div>
          )}
        </section>
      </div>

      {/* DETAIL MODAL */}
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
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}
            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
                    Detail Manager
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {selectedManager.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedManager(null)}
                  disabled={deletingManagerId !== null}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
                >
                  ×
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="space-y-6 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-2xl text-white">
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
                  <InfoBox label="Email" value={selectedManager.email} />

                  <InfoBox
                    label="No. Telepon"
                    value={selectedManager.phone || "Belum diisi"}
                  />

                  <InfoBox
                    label="Status Email"
                    value={
                      selectedManager.emailVerified
                        ? "Terverifikasi"
                        : "Belum Terverifikasi"
                    }
                    valueClass={
                      selectedManager.emailVerified
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  />

                  <InfoBox
                    label="Tanggal Dibuat"
                    value={formatCreatedDate(selectedManager.createdAt)}
                  />
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

            {/* FOOTER */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setSelectedManager(null)}
                disabled={deletingManagerId !== null}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => handleDeleteManager(selectedManager)}
                disabled={deletingManagerId === selectedManager.id}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-300"
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

function InfoBox({
  label,
  value,
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>

      <p className={`mt-1 break-all font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function formatCreatedDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}
