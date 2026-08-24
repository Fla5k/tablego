"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function validatePassword(password: string) {
  return {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordRules = validatePassword(password);

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const normalizedName = String(formData.get("name") || "").trim();
    const normalizedEmail = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const normalizedPhone = String(formData.get("phone") || "").trim();
    const formPassword = String(formData.get("password") || "");
    const formConfirmPassword = String(formData.get("confirmPassword") || "");

    // Pastikan data benar-benar terbaca dari form
    if (!normalizedName || !normalizedEmail || !formPassword) {
      setErrorMessage("Silakan isi nama, email, dan password.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Password belum memenuhi semua persyaratan keamanan.");
      return;
    }

    if (formPassword !== formConfirmPassword) {
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
          name: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
          password: formPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registrasi gagal.");
      }

      setSuccessMessage(
        "Registrasi berhasil! Silakan cek email kamu untuk melakukan verifikasi.",
      );

      form.reset();
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push(
          `/verify-email?email=${encodeURIComponent(normalizedEmail)}`,
        );
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
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  disabled={loading}
                  autoComplete="name"
                  required
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
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  disabled={loading}
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Gunakan email yang benar dan bisa kamu akses untuk verifikasi
                  akun.
                </p>
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
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  disabled={loading}
                  autoComplete="tel"
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
                  name="password"
                  type="password"
                  placeholder="Buat password yang kuat"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />

                {/* Password Requirements */}
                <div className="mt-3 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-700">
                    Persyaratan password:
                  </p>

                  <div className="mt-2 space-y-1.5">
                    <PasswordRequirement
                      valid={passwordRules.length}
                      text="Minimal 12 karakter"
                    />

                    <PasswordRequirement
                      valid={passwordRules.uppercase}
                      text="Mengandung huruf besar (A-Z)"
                    />

                    <PasswordRequirement
                      valid={passwordRules.lowercase}
                      text="Mengandung huruf kecil (a-z)"
                    />

                    <PasswordRequirement
                      valid={passwordRules.number}
                      text="Mengandung angka (0-9)"
                    />

                    <PasswordRequirement
                      valid={passwordRules.special}
                      text="Mengandung karakter khusus (!@#$%^&*)"
                    />
                  </div>
                </div>
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
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                />

                {confirmPassword && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {password === confirmPassword
                      ? "✓ Password cocok"
                      : "✕ Password belum cocok"}
                  </p>
                )}
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
            🔒 Akun harus diverifikasi melalui email sebelum dapat digunakan.
          </p>
        </div>
      </div>
    </main>
  );
}

function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          valid ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        {valid ? "✓" : ""}
      </span>

      <span className={`text-xs ${valid ? "text-green-700" : "text-gray-500"}`}>
        {text}
      </span>
    </div>
  );
}
