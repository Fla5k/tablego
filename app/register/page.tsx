"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "CUSTOMER" | "ADMIN";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CUSTOMER");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Silakan lengkapi semua data wajib.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registrasi gagal.");
      }

      setSuccessMessage(
        "Registrasi berhasil! Kamu akan diarahkan ke halaman login.",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat registrasi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
          </Link>

          <p className="text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-500 hover:text-green-600"
            >
              Masuk
            </Link>
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto flex max-w-md justify-center px-6 py-12">
        <div className="w-full">
          {/* Heading */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
              TableGo
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Buat Akun
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Daftar untuk mulai menggunakan layanan TableGo.
            </p>
          </div>

          {/* Card */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Daftar Sebagai
                </label>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRole("CUSTOMER")}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      role === "CUSTOMER"
                        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                        : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        role === "CUSTOMER" ? "text-green-700" : "text-gray-900"
                      }`}
                    >
                      Customer
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Untuk melakukan booking meja.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRole("ADMIN")}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      role === "ADMIN"
                        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                        : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        role === "ADMIN" ? "text-green-700" : "text-gray-900"
                      }`}
                    >
                      Admin
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Untuk mengelola TableGo.
                    </p>
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Pilih jenis akun yang ingin kamu buat.
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama Lengkap
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Masukkan nama lengkap"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Nomor Telepon{" "}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="08xxxxxxxxxx"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 6 karakter"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Konfirmasi Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-700">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? "Membuat Akun..." : "Daftar"}
              </button>
            </form>

            {/* Login */}
            <div className="mt-6 border-t border-gray-100 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-green-500 hover:text-green-600"
                >
                  Masuk sekarang
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            🔒 Data akun kamu disimpan dengan aman.
          </p>
        </div>
      </div>
    </main>
  );
}
