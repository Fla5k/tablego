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
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-gray-900">Table</span>
          <span className="text-green-500">Go</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {!user ? (
            <>
              <Link
                href="/#home"
                className="text-sm font-medium text-gray-700 transition hover:text-green-500"
              >
                Home
              </Link>

              <Link
                href="/#features"
                className="text-sm font-medium text-gray-700 transition hover:text-green-500"
              >
                Fitur
              </Link>

              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-gray-700 transition hover:text-green-500"
              >
                Cara Kerja
              </Link>

              <Link
                href="/#about"
                className="text-sm font-medium text-gray-700 transition hover:text-green-500"
              >
                Tentang
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/restaurants"
                className="text-sm font-medium text-gray-700 transition hover:text-green-500"
              >
                Restoran
              </Link>

              <Link
                href="/bookings"
                className="text-sm font-medium text-gray-700 transition hover:text-green-500"
              >
                Booking Saya
              </Link>
            </>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          ) : user ? (
            <>
              <span className="max-w-32 truncate text-sm font-medium text-gray-700">
                Halo, {user.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
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

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-700 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {!user ? (
              <>
                <Link
                  href="/#home"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>

                <Link
                  href="/#features"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Fitur
                </Link>

                <Link
                  href="/#how-it-works"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Cara Kerja
                </Link>

                <Link
                  href="/#about"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Tentang
                </Link>

                <div className="flex gap-3 pt-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium"
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
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-400">Login sebagai</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {user.name}
                  </p>
                </div>

                <Link
                  href="/"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Kembali ke Beranda
                </Link>

                <Link
                  href="/restaurants"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Restoran
                </Link>

                <Link
                  href="/bookings"
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Booking Saya
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
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
