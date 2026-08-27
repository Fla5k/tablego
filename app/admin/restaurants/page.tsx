"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: number;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  parent: {
    id: number;
    name: string;
  } | null;
  branches: {
    id: number;
    name: string;
  }[];
  _count: {
    tables: number;
    bookings: number;
    branches: number;
  };
};

type RestaurantForm = {
  name: string;
  description: string;
  address: string;
  phone: string;
  image: string;
  parentId: string;
};

type RestaurantTable = {
  id: number;
  tableNumber: string;
  capacity: number;
  restaurantId: number;
};

type TableForm = {
  tableNumber: string;
  capacity: string;
};

const emptyForm: RestaurantForm = {
  name: "",
  description: "",
  address: "",
  phone: "",
  image: "",
  parentId: "",
};

const emptyTableForm: TableForm = {
  tableNumber: "",
  capacity: "",
};

export default function AdminRestaurantsPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RestaurantForm>(emptyForm);

  // =========================
  // TABLE MANAGEMENT
  // =========================

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);

  const [tableForm, setTableForm] = useState<TableForm>(emptyTableForm);

  const [savingTable, setSavingTable] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<number | null>(null);

  // =========================
  // FETCH RESTAURANTS
  // =========================

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/restaurants", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 403) {
        router.push("/restaurants");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data restoran.");
      }

      setRestaurants(data.restaurants);
    } catch (error) {
      console.error("Fetch admin restaurants error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data restoran.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // =========================
  // RESTAURANT FORM
  // =========================

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);
  };

  const openEditForm = async (restaurantId: number) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil detail restoran.");
      }

      const restaurant = data.restaurant;

      setEditingId(restaurant.id);

      setForm({
        name: restaurant.name,
        description: restaurant.description || "",
        address: restaurant.address,
        phone: restaurant.phone || "",
        image: restaurant.image || "",
        parentId: restaurant.parentId ? String(restaurant.parentId) : "",
      });

      setShowForm(true);
    } catch (error) {
      console.error("Get restaurant detail error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail restoran.",
      );
    }
  };

  const closeRestaurantForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // =========================
  // SAVE RESTAURANT
  // =========================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing
          ? `/api/admin/restaurants/${editingId}`
          : "/api/admin/restaurants",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            address: form.address,
            phone: form.phone,
            image: form.image,
            parentId: form.parentId || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan restoran.");
      }

      if (isEditing) {
        setRestaurants((currentRestaurants) =>
          currentRestaurants.map((restaurant) =>
            restaurant.id === editingId
              ? {
                  ...restaurant,
                  ...data.restaurant,
                }
              : restaurant,
          ),
        );

        setSuccessMessage(data.message || "Restoran berhasil diperbarui.");
      } else {
        setRestaurants((currentRestaurants) => [
          data.restaurant,
          ...currentRestaurants,
        ]);

        setSuccessMessage(data.message || "Restoran berhasil ditambahkan.");
      }

      closeRestaurantForm();
    } catch (error) {
      console.error("Save restaurant error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan restoran.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE RESTAURANT
  // =========================

  const handleDelete = async (restaurant: Restaurant) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus restoran "${restaurant.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(restaurant.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus restoran.");
      }

      setRestaurants((currentRestaurants) =>
        currentRestaurants.filter((item) => item.id !== restaurant.id),
      );

      if (selectedRestaurantId === restaurant.id) {
        setSelectedRestaurantId(null);
        setTables([]);
      }

      setSuccessMessage(data.message || "Restoran berhasil dihapus.");
    } catch (error) {
      console.error("Delete restaurant error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus restoran.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // TABLE MANAGEMENT
  // =========================

  const openTableManagement = async (restaurantId: number) => {
    try {
      setSelectedRestaurantId(restaurantId);
      setTablesLoading(true);

      setErrorMessage("");
      setSuccessMessage("");

      setShowTableForm(false);
      setEditingTableId(null);
      setTableForm(emptyTableForm);

      const response = await fetch(
        `/api/admin/restaurants/${restaurantId}/tables`,
        {
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data meja.");
      }

      setTables(data.tables);
    } catch (error) {
      console.error("Fetch restaurant tables error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengambil data meja.",
      );
    } finally {
      setTablesLoading(false);
    }
  };

  const closeTableManagement = () => {
    setSelectedRestaurantId(null);
    setTables([]);

    setShowTableForm(false);
    setEditingTableId(null);
    setTableForm(emptyTableForm);
  };

  // =========================
  // TABLE FORM
  // =========================

  const openCreateTableForm = () => {
    setEditingTableId(null);

    setTableForm({
      tableNumber: "",
      capacity: "",
    });

    setErrorMessage("");
    setSuccessMessage("");

    setShowTableForm(true);
  };

  const openEditTableForm = (table: RestaurantTable) => {
    setEditingTableId(table.id);

    setTableForm({
      tableNumber: table.tableNumber,
      capacity: String(table.capacity),
    });

    setErrorMessage("");
    setSuccessMessage("");

    setShowTableForm(true);
  };

  // =========================
  // SAVE TABLE
  // =========================

  const handleTableSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRestaurantId) {
      return;
    }

    try {
      setSavingTable(true);
      setErrorMessage("");
      setSuccessMessage("");

      const capacity = Number(tableForm.capacity);

      if (!tableForm.tableNumber.trim()) {
        throw new Error("Nomor meja wajib diisi.");
      }

      if (!Number.isInteger(capacity) || capacity <= 0) {
        throw new Error("Kapasitas meja harus berupa angka lebih dari 0.");
      }

      const isEditing = editingTableId !== null;

      const response = await fetch(
        isEditing
          ? `/api/admin/restaurants/${selectedRestaurantId}/tables/${editingTableId}`
          : `/api/admin/restaurants/${selectedRestaurantId}/tables`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            tableNumber: tableForm.tableNumber.trim(),
            capacity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan meja.");
      }

      if (isEditing) {
        setTables((currentTables) =>
          currentTables.map((table) =>
            table.id === editingTableId
              ? {
                  ...table,
                  ...data.table,
                }
              : table,
          ),
        );

        setSuccessMessage(data.message || "Meja berhasil diperbarui.");
      } else {
        setTables((currentTables) =>
          [...currentTables, data.table].sort((a, b) =>
            a.tableNumber.localeCompare(b.tableNumber, undefined, {
              numeric: true,
            }),
          ),
        );

        setRestaurants((currentRestaurants) =>
          currentRestaurants.map((restaurant) =>
            restaurant.id === selectedRestaurantId
              ? {
                  ...restaurant,
                  _count: {
                    ...restaurant._count,
                    tables: restaurant._count.tables + 1,
                  },
                }
              : restaurant,
          ),
        );

        setSuccessMessage(data.message || "Meja berhasil ditambahkan.");
      }

      setTableForm(emptyTableForm);
      setEditingTableId(null);
      setShowTableForm(false);
    } catch (error) {
      console.error("Save table error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan meja.",
      );
    } finally {
      setSavingTable(false);
    }
  };

  // =========================
  // DELETE TABLE
  // =========================

  const handleDeleteTable = async (table: RestaurantTable) => {
    if (!selectedRestaurantId) {
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus meja ${table.tableNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTableId(table.id);

      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/admin/restaurants/${selectedRestaurantId}/tables/${table.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus meja.");
      }

      setTables((currentTables) =>
        currentTables.filter((item) => item.id !== table.id),
      );

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((restaurant) =>
          restaurant.id === selectedRestaurantId
            ? {
                ...restaurant,
                _count: {
                  ...restaurant._count,
                  tables: Math.max(restaurant._count.tables - 1, 0),
                },
              }
            : restaurant,
        ),
      );

      setSuccessMessage(data.message || "Meja berhasil dihapus.");
    } catch (error) {
      console.error("Delete table error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus meja.",
      );
    } finally {
      setDeletingTableId(null);
    }
  };

  // =========================
  // SELECTED RESTAURANT
  // =========================

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurantId,
  );

  // =========================
  // MAIN UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* TITLE */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Kelola Restoran
            </h1>

            <p className="mt-2 text-gray-600">
              Tambahkan, ubah, dan kelola restoran, cabang, serta meja yang
              tersedia di TableGo.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            + Tambah Restoran
          </button>
        </div>

        {/* MESSAGE */}

        {successMessage && (
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* RESTAURANT FORM */}

        {showForm && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                  {editingId ? "Edit Restoran" : "Tambah Restoran"}
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {editingId
                    ? "Perbarui Informasi Restoran"
                    : "Tambah Restoran Baru"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Isi informasi restoran dan tentukan apakah restoran ini
                  merupakan cabang.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRestaurantForm}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              {/* NAMA */}

              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-800"
                >
                  Nama Restoran *
                </label>

                <input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  placeholder="Contoh: TableGo Bistro"
                />
              </div>

              {/* TELEPON */}

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-800"
                >
                  Nomor Telepon
                </label>

                <input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* ALAMAT */}

              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-800"
                >
                  Alamat *
                </label>

                <input
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: event.target.value,
                    })
                  }
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  placeholder="Contoh: Bandung, Jawa Barat"
                />
              </div>

              {/* DESKRIPSI */}

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-800"
                >
                  Deskripsi
                </label>

                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  placeholder="Deskripsi singkat restoran..."
                />
              </div>

              {/* URL GAMBAR */}

              <div className="md:col-span-2">
                <label
                  htmlFor="image"
                  className="text-sm font-medium text-gray-800"
                >
                  URL Gambar
                </label>

                <input
                  id="image"
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      image: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  placeholder="https://..."
                />
              </div>

              {/* CABANG */}

              <div className="md:col-span-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      🏢
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Cabang Restoran
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        Jika restoran ini adalah cabang, pilih restoran utama
                        sebagai induknya.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="parentId"
                      className="text-sm font-medium text-gray-800"
                    >
                      Restoran Induk
                    </label>

                    <select
                      id="parentId"
                      value={form.parentId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          parentId: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="">— Restoran Utama —</option>

                      {restaurants
                        .filter(
                          (restaurant) =>
                            restaurant.parentId === null &&
                            restaurant.id !== editingId,
                        )
                        .map((restaurant) => (
                          <option key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </option>
                        ))}
                    </select>

                    <p className="mt-2 text-xs text-gray-500">
                      Pilih <strong>Restoran Utama</strong> jika restoran ini
                      merupakan cabang.
                    </p>
                  </div>

                  {form.parentId && (
                    <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-green-800">
                        Restoran ini akan menjadi cabang.
                      </p>

                      <p className="mt-1 text-xs text-green-700">
                        Induk:{" "}
                        {
                          restaurants.find(
                            (restaurant) =>
                              restaurant.id === Number(form.parentId),
                          )?.name
                        }
                      </p>
                    </div>
                  )}

                  {!form.parentId && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        Restoran Utama
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Restoran ini tidak memiliki induk.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* BUTTON */}

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Restoran"}
                </button>

                <button
                  type="button"
                  onClick={closeRestaurantForm}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        )}

        {/* RESTAURANT LIST */}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-600">Memuat data restoran...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-gray-600">Belum ada restoran.</p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => {
              const isBranch = restaurant.parentId !== null;

              return (
                <article
                  key={restaurant.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* IMAGE */}

                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-500">
                      Tidak ada gambar
                    </div>
                  )}

                  <div className="p-5">
                    {/* STATUS */}

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Restoran #{restaurant.id}
                      </p>

                      {isBranch ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Cabang
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Utama
                        </span>
                      )}
                    </div>

                    {/* NAME */}

                    <h2 className="mt-2 text-xl font-bold text-gray-900">
                      {restaurant.name}
                    </h2>

                    {/* PARENT */}

                    {restaurant.parent && (
                      <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                          Restoran Induk
                        </p>

                        <p className="mt-1 text-sm font-semibold text-green-800">
                          {restaurant.parent.name}
                        </p>
                      </div>
                    )}

                    {/* ADDRESS */}

                    <p className="mt-3 text-sm text-gray-600">
                      {restaurant.address}
                    </p>

                    {/* DESCRIPTION */}

                    {restaurant.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {restaurant.description}
                      </p>
                    )}

                    {/* BRANCHES */}

                    {!isBranch && restaurant.branches.length > 0 && (
                      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Cabang
                        </p>

                        <div className="mt-2 space-y-1">
                          {restaurant.branches.map((branch) => (
                            <p
                              key={branch.id}
                              className="text-sm font-medium text-gray-800"
                            >
                              • {branch.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STATS */}

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Meja</p>

                        <p className="mt-1 font-bold text-gray-900">
                          {restaurant._count.tables}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Booking</p>

                        <p className="mt-1 font-bold text-gray-900">
                          {restaurant._count.bookings}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Cabang</p>

                        <p className="mt-1 font-bold text-gray-900">
                          {restaurant._count.branches}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(restaurant.id)}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(restaurant)}
                        disabled={deletingId === restaurant.id}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === restaurant.id
                          ? "Menghapus..."
                          : "Hapus"}
                      </button>
                    </div>

                    {/* MANAGE TABLE */}

                    <button
                      type="button"
                      onClick={() => openTableManagement(restaurant.id)}
                      className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Kelola Meja
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* TABLE MANAGEMENT PANEL */}

        {selectedRestaurantId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white text-gray-900 shadow-xl">
              {/* PANEL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                    Kelola Meja
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {selectedRestaurant?.name || "Restoran"}
                  </h2>

                  {selectedRestaurant?.parent && (
                    <p className="mt-1 text-xs text-gray-500">
                      Cabang dari{" "}
                      <span className="font-semibold">
                        {selectedRestaurant.parent.name}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeTableManagement}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Tutup
                </button>
              </div>

              <div className="p-6 text-gray-900">
                {/* ADD TABLE BUTTON */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Kelola nomor dan kapasitas meja restoran.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openCreateTableForm}
                    className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
                  >
                    + Tambah Meja
                  </button>
                </div>

                {/* TABLE FORM */}

                {showTableForm && (
                  <form
                    onSubmit={handleTableSubmit}
                    className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {editingTableId ? "Edit Meja" : "Tambah Meja"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-600">
                          Isi nomor meja dan kapasitasnya.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowTableForm(false);
                          setEditingTableId(null);
                          setTableForm(emptyTableForm);
                        }}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="tableNumber"
                          className="text-sm font-medium text-gray-800"
                        >
                          Nomor Meja *
                        </label>

                        <input
                          id="tableNumber"
                          value={tableForm.tableNumber}
                          onChange={(event) =>
                            setTableForm({
                              ...tableForm,
                              tableNumber: event.target.value,
                            })
                          }
                          required
                          placeholder="Contoh: T6"
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="capacity"
                          className="text-sm font-medium text-gray-800"
                        >
                          Kapasitas *
                        </label>

                        <input
                          id="capacity"
                          type="number"
                          min="1"
                          value={tableForm.capacity}
                          onChange={(event) =>
                            setTableForm({
                              ...tableForm,
                              capacity: event.target.value,
                            })
                          }
                          required
                          placeholder="Contoh: 4"
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingTable}
                      className="mt-5 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingTable
                        ? "Menyimpan..."
                        : editingTableId
                          ? "Simpan Perubahan"
                          : "Tambah Meja"}
                    </button>
                  </form>
                )}

                {/* TABLE LIST */}

                {tablesLoading ? (
                  <div className="mt-6 rounded-2xl border border-gray-200 p-8 text-center text-gray-900">
                    <p className="text-sm text-gray-600">Memuat data meja...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-900">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                      🪑
                    </div>

                    <h3 className="mt-4 font-bold text-gray-900">
                      Belum ada meja
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Tambahkan meja untuk restoran ini.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className="rounded-2xl border border-gray-200 bg-white p-5 text-gray-900"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Meja
                            </p>

                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                              {table.tableNumber}
                            </h3>
                          </div>

                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Aktif
                          </span>
                        </div>

                        <div className="mt-4 rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">Kapasitas</p>

                          <p className="mt-1 font-bold text-gray-900">
                            {table.capacity} orang
                          </p>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEditTableForm(table)}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTable(table)}
                            disabled={deletingTableId === table.id}
                            className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingTableId === table.id
                              ? "Menghapus..."
                              : "Hapus"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
