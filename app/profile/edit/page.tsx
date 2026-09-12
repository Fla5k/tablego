"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import UserNavbar from "@/components/layout/UserNavbar";
import ManagerNavbar from "@/components/layout/ManagerNavbar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import OwnerSidebar from "@/components/layout/OwnerSidebar";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  restaurantId?: number | null;
  restaurant?: {
    id: number;
    name: string;
    address: string;
  } | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
        setName(data.user.name);
        setPhone(data.user.phone ?? "");
      } catch (error) {
        console.error("Load profile error:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfileLoading(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setProfileError(data.message || "Gagal memperbarui profil.");
        return;
      }

      setUser((current) =>
        current
          ? {
              ...current,
              name: data.user.name,
              phone: data.user.phone,
            }
          : data.user,
      );

      setName(data.user.name);
      setPhone(data.user.phone ?? "");

      setProfileMessage(data.message || "Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Update profile error:", error);
      setProfileError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordLoading(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setPasswordError(data.message || "Gagal mengubah password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(data.message || "Password berhasil diubah.");
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setPasswordLoading(false);
    }
  }

  function renderNavigation() {
    if (user?.role === "OWNER") {
      return <OwnerSidebar />;
    }

    if (user?.role === "ADMIN") {
      return <AdminNavbar />;
    }

    if (user?.role === "MANAGER") {
      return <ManagerNavbar />;
    }

    return <UserNavbar />;
  }

  if (loading) {
    return (
      <>
        <UserNavbar />

        <main className="min-h-screen bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-center text-sm text-gray-500">
                Memuat profil...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const isOwner = user.role === "OWNER";
  const isManager = user.role === "MANAGER";

  return (
    <>
      {renderNavigation()}

      <main
        className={`min-h-screen bg-gray-50 px-4 py-10 ${
          isOwner ? "lg:pl-64" : ""
        }`}
      >
        <div className="mx-auto max-w-3xl">
          {/* HEADER */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
              Pengaturan Akun
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Edit Profil
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola informasi profil dan keamanan akun kamu.
            </p>
          </div>

          <div className="space-y-6">
            {/* INFORMASI PROFIL */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Perbarui informasi dasar akun kamu.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* NAMA */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Nama
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Masukkan nama"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 pr-12 text-sm text-gray-500"
                    />

                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    >
                      🔒
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Email tidak dapat diubah.
                  </p>
                </div>

                {/* TELEPON */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    No. Telepon
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={30}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Role
                  </label>

                  <div className="relative">
                    <input
                      id="role"
                      type="text"
                      value={user.role}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 pr-12 text-sm text-gray-500"
                    />

                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    >
                      🔒
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Role akun ditentukan oleh sistem dan tidak dapat diubah
                    sendiri.
                  </p>
                </div>

                {/* CABANG MANAGER */}
                {isManager && (
                  <div>
                    <label
                      htmlFor="restaurant"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Cabang Restoran
                    </label>

                    <div className="relative">
                      <input
                        id="restaurant"
                        type="text"
                        value={
                          user.restaurant?.name ?? "Belum terhubung ke restoran"
                        }
                        readOnly
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 pr-12 text-sm text-gray-500"
                      />

                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      >
                        🔒
                      </span>
                    </div>

                    {user.restaurant?.address && (
                      <p className="mt-2 text-xs text-gray-500">
                        {user.restaurant.address}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      Cabang ditentukan oleh Admin dan tidak dapat diubah
                      sendiri.
                    </p>
                  </div>
                )}

                {/* PROFILE MESSAGE */}
                {profileMessage && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {profileMessage}
                  </div>
                )}

                {profileError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {profileError}
                  </div>
                )}

                {/* SAVE BUTTON */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </section>

            {/* KEAMANAN */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Keamanan Akun
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ganti password akun kamu secara berkala untuk menjaga
                  keamanan.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {/* PASSWORD LAMA */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password Saat Ini
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Masukkan password saat ini"
                  />
                </div>

                {/* PASSWORD BARU */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password Baru
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={100}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Minimal 8 karakter"
                  />
                </div>

                {/* KONFIRMASI PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Konfirmasi Password Baru
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={100}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Masukkan kembali password baru"
                  />
                </div>

                {/* PASSWORD MESSAGE */}
                {passwordMessage && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {passwordMessage}
                  </div>
                )}

                {passwordError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                {/* CHANGE PASSWORD BUTTON */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {passwordLoading ? "Mengubah..." : "Ganti Password"}
                  </button>
                </div>
              </form>
            </section>

            {/* BACK */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => router.push(isOwner ? "/owner" : "/")}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                ← Kembali
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
