"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserNavbar() {
  const router = useRouter();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/restaurants" className="text-2xl font-bold tracking-tight">
          <span className="text-gray-900">Table</span>
          <span className="text-green-500">Go</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            ← Kembali
          </button>

          <Link
            href="/restaurants"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Restoran
          </Link>

          <Link
            href="/bookings"
            className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-100"
          >
            Booking Saya
          </Link>
        </div>
      </div>
    </nav>
  );
}
