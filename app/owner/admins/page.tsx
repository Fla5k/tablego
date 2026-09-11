"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function OwnerAdminsPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  async function fetchAdmins() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/owner/admins", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 403) {
        router.push("/restaurants");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil data Admin.",
        );
      }

      setAdmins(data.admins || []);
    } catch (error) {
      console.error("Owner admins page error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkOwner() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.user
        ) {
          router.push("/login");
          return;
        }

        if (data.user.role !== "OWNER") {
          router.push("/restaurants");
          return;
        }

        await fetchAdmins();
      } catch {
        router.push("/login");
      }
    }

    checkOwner();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setEditingAdmin(null);
    setShowForm(false);
  }

  function startCreate() {
    setErrorMessage("");
    setSuccessMessage("");

    setEditingAdmin(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setShowForm(true);
  }

  function startEdit(admin: Admin) {
    setErrorMessage("");
    setSuccessMessage("");

    setEditingAdmin(admin);

    setForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
    });

    setShowForm(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error("Nama Admin wajib diisi.");
      }

      if (editingAdmin) {
        const response = await fetch("/api/owner/admins", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            adminId: editingAdmin.id,
            name: form.name.trim(),
            phone: form.phone.trim(),
            ...(form.password
              ? { password: form.password }
              : {}),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Gagal memperbarui Admin.",
          );
        }

        setSuccessMessage(
          data.message || "Admin berhasil diperbarui.",
        );
      } else {
        if (!form.email.trim()) {
          throw new Error("Email Admin wajib diisi.");
        }

        if (!form.password) {
          throw new Error("Password Admin wajib diisi.");
        }

        const response = await fetch("/api/owner/admins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Gagal membuat Admin.",
          );
        }

        setSuccessMessage(
          data.message || "Admin berhasil dibuat.",
        );
      }

      resetForm();
      await fetchAdmins();
    } catch (error) {
      console.error("Save admin error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan Admin.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(admin: Admin) {
    const confirmed = window.confirm(
      `Hapus Admin "${admin.name}"?\n\nAkun ini tidak akan dapat digunakan untuk login lagi.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(admin.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/owner/admins", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          adminId: admin.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menghapus Admin.",
        );
      }

      setAdmins((current) =>
        current.filter((item) => item.id !== admin.id),
      );

      setSuccessMessage(
        data.message || "Admin berhasil dihapus.",
      );
    } catch (error) {
      console.error("Delete admin error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus Admin.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        {/* Sidebar ditempatkan melalui layout wrapper Owner */}
      </div>

      <main className="min-w-0 flex-1 lg:ml-0">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 pl-20 lg:pl-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-600">
              Management
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              Kelola Admin
            </h1>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              O
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Owner
              </p>
              <p className="text-xs text-gray-500">
                TableGo
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Daftar Admin
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Kelola akun administrator TableGo.
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              + Tambah Admin
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {showForm && (
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingAdmin
                      ? "Edit Admin"
                      : "Tambah Admin"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {editingAdmin
                      ? "Perbarui informasi akun Admin."
                      : "Buat akun administrator baru."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-5 md:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nama
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Nama Admin"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="admin@tablego.id"
                    disabled={saving || !!editingAdmin}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nomor Telepon
                  </label>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="08xxxxxxxxxx"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {editingAdmin
                      ? "Password Baru (opsional)"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Minimal 12 karakter"
                    disabled={saving}
                  />
                </div>

                <div className="flex gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Menyimpan..."
                      : editingAdmin
                        ? "Simpan Perubahan"
                        : "Buat Admin"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-gray-500">
                Memuat data Admin...
              </div>
            ) : admins.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-semibold text-gray-900">
                  Belum ada Admin
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan Admin pertama melalui tombol di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Admin
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Email
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Telepon
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                              {admin.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {admin.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                ID #{admin.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-700">
                          {admin.email}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-700">
                          {admin.phone || "-"}
                        </td>

                        <td className="px-6 py-5">
                          {admin.emailVerified ? (
                            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Belum Verifikasi
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(admin)}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(admin)
                              }
                              disabled={
                                deletingId === admin.id
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === admin.id
                                ? "Menghapus..."
                                : "Hapus"}
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
    </div>
  );
}
