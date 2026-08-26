"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setShowResend(false);

    if (!email || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data.message || "Login gagal.";

        if (
          message.toLowerCase().includes("belum diverifikasi") ||
          message.toLowerCase().includes("verifikasi")
        ) {
          setShowResend(true);
        }

        throw new Error(message);
      }

      /*
       * Redirect berdasarkan role.
       *
       * ADMIN   → Dashboard Admin
       * MANAGER → Dashboard Manager
       * CUSTOMER → Halaman restoran untuk booking
       */
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user?.role === "MANAGER") {
        router.push("/manager");
      } else {
        router.push("/restaurants");
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Masukkan email terlebih dahulu.");
      return;
    }

    try {
      setResendLoading(true);

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengirim ulang email verifikasi.",
        );
      }

      setSuccessMessage(data.message);
      setShowResend(false);
    } catch (error) {
      console.error("Resend verification error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim ulang email verifikasi.",
      );
    } finally {
      setResendLoading(false);
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
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-green-500 hover:text-green-600"
            >
              Daftar
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
              Masuk ke Akun
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Masuk untuk melanjutkan ke dashboard TableGo.
            </p>
          </div>

          {/* Card */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  disabled={loading || resendLoading}
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
                  placeholder="Masukkan password"
                  disabled={loading || resendLoading}
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
                disabled={loading || resendLoading}
                className="w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Resend Verification */}
            {showResend && (
              <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-yellow-800">
                  Email belum diverifikasi
                </p>

                <p className="mt-1 text-xs leading-5 text-yellow-700">
                  Belum menerima email verifikasi? Kirim ulang ke email{" "}
                  <strong>{email}</strong>.
                </p>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-3 w-full rounded-xl border border-yellow-300 bg-white px-4 py-3 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendLoading
                    ? "Mengirim email..."
                    : "Kirim ulang email verifikasi"}
                </button>
              </div>
            )}

            {/* Register */}
            <div className="mt-6 border-t border-gray-100 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-green-500 hover:text-green-600"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            🔒 Data akun kamu aman dan terlindungi.
          </p>
        </div>
      </div>
    </main>
  );
}
