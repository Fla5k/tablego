"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setIsProfileOpen(false);
      setIsOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const isRestaurantsActive =
    pathname === "/restaurants" || pathname.startsWith("/restaurants/");

  const isBookingsActive =
    pathname === "/bookings" || pathname.startsWith("/bookings/");

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6">
        {/* =========================
            LOGO
        ========================= */}

        <div className="flex items-center justify-start">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-900">Table</span>
            <span className="text-green-500">Go</span>
          </Link>
        </div>

        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <div className="hidden items-center justify-center md:flex">
          {user ? (
            <div className="flex items-center gap-8">
              <Link
                href="/restaurants"
                className={`relative py-5 text-sm font-semibold transition ${
                  isRestaurantsActive
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Restoran
                {isRestaurantsActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-green-500" />
                )}
              </Link>

              <Link
                href="/bookings"
                className={`relative py-5 text-sm font-semibold transition ${
                  isBookingsActive
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Booking Saya
                {isBookingsActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-green-500" />
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-8">
              <Link
                href="/#home"
                className="py-5 text-sm font-semibold text-gray-600 transition hover:text-green-500"
              >
                Home
              </Link>

              <Link
                href="/#features"
                className="py-5 text-sm font-semibold text-gray-600 transition hover:text-green-500"
              >
                Fitur
              </Link>

              <Link
                href="/#how-it-works"
                className="py-5 text-sm font-semibold text-gray-600 transition hover:text-green-500"
              >
                Cara Kerja
              </Link>

              <Link
                href="/#about"
                className="py-5 text-sm font-semibold text-gray-600 transition hover:text-green-500"
              >
                Tentang
              </Link>
            </div>
          )}
        </div>

        {/* =========================
            DESKTOP RIGHT SIDE
        ========================= */}

        <div className="hidden items-center justify-end gap-3 md:flex">
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
          ) : user ? (
            <>
              {/* PROFILE */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white transition hover:bg-gray-800 ${
                    isProfileOpen ? "ring-2 ring-green-500 ring-offset-2" : ""
                  }`}
                  aria-label="Buka profil"
                  aria-expanded={isProfileOpen}
                >
                  {getInitials(user.name)}
                </button>

                {/* PROFILE DROPDOWN */}

                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        Akun Saya
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {user.name}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-400">
                            Nama
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-medium text-gray-900">
                            {user.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-400">
                            Nomor Telepon
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {user.phone || "Belum ditambahkan"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Masuk
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* =========================
            MOBILE BUTTON
        ========================= */}

        <div className="flex justify-end md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}

      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  href="/#home"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>

                <Link
                  href="/#features"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Fitur
                </Link>

                <Link
                  href="/#how-it-works"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Cara Kerja
                </Link>

                <Link
                  href="/#about"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Tentang
                </Link>

                <div className="mt-3 flex gap-3 border-t border-gray-100 pt-4">
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Masuk
                  </Link>

                  <Link
                    href="/register"
                    className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* USER INFO MOBILE */}

                <div className="mb-2 flex items-center gap-3 border-b border-gray-100 px-3 pb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {getInitials(user.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/restaurants"
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                    isRestaurantsActive
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-600"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Restoran
                </Link>

                <Link
                  href="/bookings"
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                    isBookingsActive
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-600"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Booking Saya
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
