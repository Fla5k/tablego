"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserNavbar() {
  const pathname = usePathname();

  const isRestaurantsActive =
    pathname === "/restaurants" || pathname.startsWith("/restaurants/");

  const isBookingsActive =
    pathname === "/bookings" || pathname.startsWith("/bookings/");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/restaurants"
          className="shrink-0 text-2xl font-bold tracking-tight"
        >
          <span className="text-gray-900">Table</span>
          <span className="text-green-500">Go</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 rounded-xl bg-gray-50 p-1">
          <Link
            href="/restaurants"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isRestaurantsActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
          >
            Restoran
          </Link>

          <Link
            href="/bookings"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isBookingsActive
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
          >
            Booking Saya
          </Link>
        </nav>
      </div>
    </header>
  );
}
