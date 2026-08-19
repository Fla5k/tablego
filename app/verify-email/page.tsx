"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verificationStarted = useRef(false);

  const [loading, setLoading] = useState(Boolean(token));
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    async function verifyEmail() {
      // Jika halaman dibuka tanpa token,
      // tampilkan informasi bahwa email verifikasi sudah dikirim.
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage(
          "Link verifikasi telah dikirim ke email kamu. Silakan cek inbox dan klik tombol Verifikasi Email.",
        );
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Verifikasi email gagal.");
        }

        setSuccess(true);
        setMessage(data.message || "Email kamu berhasil diverifikasi.");
      } catch (error) {
        console.error("Verify email error:", error);

        setSuccess(false);

        setMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat verifikasi email.",
        );
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {/* Icon */}
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            loading
              ? "bg-gray-100"
              : !token
                ? "bg-blue-100"
                : success
                  ? "bg-green-100"
                  : "bg-red-100"
          }`}
        >
          <span className="text-4xl">
            {loading ? "⏳" : !token ? "✉️" : success ? "✓" : "!"}
          </span>
        </div>

        {/* Brand */}
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-500">
          TableGo
        </p>

        {/* Title */}
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {loading
            ? "Memverifikasi Email..."
            : !token
              ? "Cek Email Kamu"
              : success
                ? "Email Berhasil Diverifikasi!"
                : "Verifikasi Gagal"}
        </h1>

        {/* Message */}
        <p className="mt-4 text-sm leading-6 text-gray-500">
          {loading ? "Mohon tunggu sebentar." : message}
        </p>

        {/* Email sent */}
        {!loading && !token && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left">
            <p className="text-sm font-medium text-blue-700">
              📧 Email verifikasi sudah dikirim.
            </p>

            <p className="mt-2 text-xs leading-5 text-blue-600">
              Buka inbox email kamu, lalu klik tombol{" "}
              <strong>Verifikasi Email</strong> untuk mengaktifkan akun TableGo.
            </p>
          </div>
        )}

        {/* Verification success */}
        {!loading && token && success && (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-left">
            <p className="text-sm font-medium text-green-700">
              ✓ Akun kamu sekarang sudah aktif.
            </p>

            <p className="mt-2 text-xs leading-5 text-green-600">
              Kamu sekarang dapat masuk dan menggunakan TableGo.
            </p>
          </div>
        )}

        {/* Button */}
        {!loading && (
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600"
          >
            {success ? "Masuk ke TableGo" : "Kembali ke Login"}
          </Link>
        )}
      </div>
    </main>
  );
}

function VerifyEmailLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <span className="text-4xl">⏳</span>
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-500">
          TableGo
        </p>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">Memuat...</h1>

        <p className="mt-4 text-sm leading-6 text-gray-500">
          Mohon tunggu sebentar.
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
