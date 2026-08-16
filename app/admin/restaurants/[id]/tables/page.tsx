"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Table = {
  id: number;
  restaurantId: number;
  tableNumber: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

type Restaurant = {
  id: number;
  name: string;
  address: string;
};

type TableForm = {
  tableNumber: string;
  capacity: string;
};

const emptyForm: TableForm = {
  tableNumber: "",
  capacity: "",
};

export default function AdminRestaurantTablesPage() {
  const params = useParams();
  const router = useRouter();

  const restaurantId = Number(params.id);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<TableForm>(emptyForm);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      router.push("/admin/restaurants");
      return;
    }

    async function fetchTables() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/admin/restaurants/${restaurantId}/tables`,
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.status === 403) {
          router.push("/restaurants");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil data meja.");
        }

        setRestaurant(data.restaurant);
        setTables(data.tables);
      } catch (error) {
        console.error("Fetch admin restaurant tables error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil data meja.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, [restaurantId, router]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (table: Table) => {
    setEditingId(table.id);

    setForm({
      tableNumber: table.tableNumber,
      capacity: String(table.capacity),
    });

    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const capacity = Number(form.capacity);

      if (!form.tableNumber.trim()) {
        throw new Error("Nomor meja wajib diisi.");
      }

      if (!Number.isInteger(capacity) || capacity <= 0) {
        throw new Error("Kapasitas meja harus berupa angka lebih dari 0.");
      }

      const isEditing = editingId !== null;

      const url = isEditing
        ? `/api/admin/restaurants/${restaurantId}/tables/${editingId}`
        : `/api/admin/restaurants/${restaurantId}/tables`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tableNumber: form.tableNumber.trim(),
          capacity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan meja.");
      }

      if (isEditing) {
        setTables((currentTables) =>
          currentTables.map((table) =>
            table.id === editingId
              ? {
                  ...table,
                  ...data.table,
                }
              : table,
          ),
        );

        setSuccessMessage("Meja berhasil diperbarui.");
      } else {
        setTables((currentTables) =>
          [...currentTables, data.table].sort((a, b) =>
            a.tableNumber.localeCompare(b.tableNumber, undefined, {
              numeric: true,
            }),
          ),
        );

        setSuccessMessage("Meja berhasil ditambahkan.");
      }

      closeForm();
    } catch (error) {
      console.error("Save table error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan meja.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (table: Table) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus meja ${table.tableNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(table.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/admin/restaurants/${restaurantId}/tables/${table.id}`,
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

      setSuccessMessage("Meja berhasil dihapus.");
    } catch (error) {
      console.error("Delete table error:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus meja.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
          </Link>

          <Link
            href="/admin/restaurants"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            ← Kembali ke Restoran
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
              Admin · Kelola Meja
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {restaurant?.name || "Kelola Meja"}
            </h1>

            {restaurant && (
              <p className="mt-2 text-gray-600">{restaurant.address}</p>
            )}
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            + Tambah Meja
          </button>
        </div>

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

        {showForm && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Meja" : "Tambah Meja"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Masukkan nomor meja dan kapasitasnya.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="tableNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Nomor Meja *
                </label>

                <input
                  id="tableNumber"
                  value={form.tableNumber}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tableNumber: event.target.value,
                    })
                  }
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Contoh: T6"
                />
              </div>

              <div>
                <label
                  htmlFor="capacity"
                  className="text-sm font-medium text-gray-700"
                >
                  Kapasitas *
                </label>

                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      capacity: event.target.value,
                    })
                  }
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Contoh: 4"
                />
              </div>

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Meja"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat data meja...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl">
              🪑
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Belum ada meja
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Tambahkan meja untuk restoran ini.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              + Tambah Meja
            </button>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <article
                key={table.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Meja
                    </p>

                    <h2 className="mt-1 text-3xl font-bold text-gray-900">
                      {table.tableNumber}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                    🪑
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Kapasitas</p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {table.capacity} orang
                  </p>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEditForm(table)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(table)}
                    disabled={deletingId === table.id}
                    className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === table.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
