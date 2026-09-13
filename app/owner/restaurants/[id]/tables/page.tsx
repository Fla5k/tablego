"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Restaurant = {
  id: number;
  name: string;
  address: string | null;
};

type Table = {
  id: number;
  tableNumber: string;
  capacity: number;
  _count: {
    bookings: number;
  };
};

export default function OwnerRestaurantTablesPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchTables() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/owner/restaurants/${restaurantId}/tables`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Gagal mengambil data meja.");
        return;
      }

      setRestaurant(data.restaurant);
      setTables(data.tables);
    } catch (error) {
      console.error("Fetch owner tables error:", error);
      setError("Terjadi kesalahan saat mengambil data meja.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId]);

  function resetForm() {
    setTableNumber("");
    setCapacity("");
    setEditingTable(null);
    setShowForm(false);
    setError("");
  }

  function openAddForm() {
    setSuccess("");
    setError("");
    setEditingTable(null);
    setTableNumber("");
    setCapacity("");
    setShowForm(true);
  }

  function openEditForm(table: Table) {
    setSuccess("");
    setError("");
    setEditingTable(table);
    setTableNumber(table.tableNumber);
    setCapacity(String(table.capacity));
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const normalizedTableNumber = tableNumber.trim();
    const parsedCapacity = Number(capacity);

    if (!normalizedTableNumber) {
      setError("Nomor meja wajib diisi.");
      return;
    }

    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      setError("Kapasitas harus berupa angka lebih dari 0.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingTable !== null;

      const url = editingTable
        ? `/api/owner/restaurants/${restaurantId}/tables/${editingTable.id}`
        : `/api/owner/restaurants/${restaurantId}/tables`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableNumber: normalizedTableNumber,
          capacity: parsedCapacity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Gagal menyimpan meja.");
        return;
      }

      setSuccess(
        isEditing ? "Meja berhasil diperbarui." : "Meja berhasil ditambahkan.",
      );

      resetForm();
      await fetchTables();
    } catch (error) {
      console.error("Save owner table error:", error);
      setError("Terjadi kesalahan saat menyimpan meja.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(table: Table) {
    if (saving) return;

    const confirmed = window.confirm(
      `Apakah Bos yakin ingin menghapus meja ${table.tableNumber}?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/owner/restaurants/${restaurantId}/tables/${table.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Gagal menghapus meja.");
        return;
      }

      setSuccess("Meja berhasil dihapus.");

      await fetchTables();
    } catch (error) {
      console.error("Delete owner table error:", error);
      setError("Terjadi kesalahan saat menghapus meja.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/owner/restaurants"
                className="transition hover:text-green-600"
              >
                Business
              </Link>

              <span>/</span>

              <span>Restoran</span>

              <span>/</span>

              <span className="text-gray-900">Kelola Meja</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Kelola Meja
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola meja pada restoran yang dipilih.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/owner/restaurants"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              ← Kembali
            </Link>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800"
            >
              + Tambah Meja
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        {restaurant && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Restoran
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                  {restaurant.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {restaurant.address || "Alamat belum tersedia"}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 px-4 py-3">
                <p className="text-xs font-semibold text-green-600">
                  Total Meja
                </p>

                <p className="mt-0.5 text-2xl font-extrabold text-green-700">
                  {tables.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {editingTable ? "Edit Meja" : "Tambah Meja"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Masukkan informasi meja restoran.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-gray-500 transition hover:text-gray-900"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="tableNumber"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Nomor Meja
                </label>

                <input
                  id="tableNumber"
                  type="text"
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  placeholder="Contoh: T1"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="capacity"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Kapasitas
                </label>

                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  placeholder="Contoh: 4"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex justify-end md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingTable
                      ? "Simpan Perubahan"
                      : "Tambah Meja"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tables */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-extrabold text-gray-900">
              Daftar Meja
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Semua meja yang tersedia pada restoran ini.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Memuat data meja...
            </div>
          ) : tables.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                ▦
              </div>

              <h3 className="mt-4 text-base font-bold text-gray-900">
                Belum ada meja
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Tambahkan meja pertama untuk restoran ini.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                + Tambah Meja
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Meja
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Kapasitas
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Riwayat Booking
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {tables.map((table) => (
                    <tr
                      key={table.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-extrabold text-gray-700">
                            {table.tableNumber}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              Meja {table.tableNumber}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID #{table.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-gray-700">
                          {table.capacity} orang
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                          {table._count.bookings} booking
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(table)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(table)}
                            disabled={saving}
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
