"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setMessage("Token verifikasi tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Verifikasi email gagal.");
        }

        setSuccess(true);
        setMessage(data.message);
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
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            loading ? "bg-gray-100" : success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <span className="text-4xl">
            {loading ? "⏳" : success ? "✓" : "!"}
          </span>
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-500">
          TableGo
        </p>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {loading
            ? "Memverifikasi Email..."
            : success
              ? "Email Berhasil Diverifikasi!"
              : "Verifikasi Gagal"}
        </h1>

        <p className="mt-4 text-sm leading-6 text-gray-500">
          {loading ? "Mohon tunggu sebentar." : message}
        </p>

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
