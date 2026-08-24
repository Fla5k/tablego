"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

export default function UserNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const isRestaurantsActive =
    pathname === "/restaurants" || pathname.startsWith("/restaurants/");

  const isBookingsActive =
    pathname === "/bookings" || pathname.startsWith("/bookings/");

  // =========================
  // GET CURRENT USER
  // =========================

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.success && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Fetch current user error:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchCurrentUser();
  }, []);

  // =========================
  // CLOSE USER MENU
  // =========================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout gagal.");
      }

      setUser(null);
      setIsUserMenuOpen(false);

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =========================
  // USER INITIAL
  // =========================

  const userInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6">
        {/* =========================
            LOGO
        ========================= */}

        <div className="flex items-center">
          <Link
            href="/restaurants"
            className="text-[25px] font-bold tracking-[-0.04em]"
          >
            <span className="text-gray-950">Table</span>
            <span className="text-green-500">Go</span>
          </Link>
        </div>

        {/* =========================
            NAVIGATION
        ========================= */}

        <nav className="flex h-full items-center gap-8">
          <Link
            href="/restaurants"
            className={`relative flex h-full items-center text-[14px] font-semibold transition ${
              isRestaurantsActive
                ? "text-gray-950"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            Restoran
            {isRestaurantsActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-green-500" />
            )}
          </Link>

          <Link
            href="/bookings"
            className={`relative flex h-full items-center text-[14px] font-semibold transition ${
              isBookingsActive
                ? "text-gray-950"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            Booking Saya
            {isBookingsActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-green-500" />
            )}
          </Link>
        </nav>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="flex items-center justify-end gap-4">
          {/* USER */}

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-label="Buka informasi user"
              aria-expanded={isUserMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {loadingUser ? <span className="text-xs">...</span> : userInitial}
            </button>

            {/* USER DROPDOWN */}

            {isUserMenuOpen && (
              <div className="absolute right-0 top-[52px] w-[300px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                {/* PROFILE HEADER */}

                <div className="border-b border-gray-100 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-950 text-base font-bold text-white">
                      {userInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-950">
                        {user?.name || "User"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {user?.email || "Email tidak tersedia"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PROFILE DETAILS */}

                <div className="px-5 py-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Nama
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {user?.name || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-900">
                        {user?.email || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Telepon
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {user?.phone || "Belum ditambahkan"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Akun
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {user?.role || "CUSTOMER"}
                      </span>
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
            className="text-sm font-semibold text-gray-600 transition hover:text-red-600"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
