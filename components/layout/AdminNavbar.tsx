"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
};

export default function AdminNavbar() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          router.push("/login");
          return;
        }

        if (data.user.role !== "ADMIN") {
          router.push("/restaurants");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Admin navbar error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout gagal.");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
      setLoggingOut(false);
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* LOGO */}

        <Link
          href="/admin"
          className="shrink-0 text-2xl font-bold tracking-tight"
        >
          <span className="text-gray-900">Table</span>
          <span className="text-green-500">Go</span>
        </Link>

        {/* ADMIN AREA */}

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
          ) : (
            <div ref={profileRef} className="relative">
              {/* PROFILE BUTTON */}

              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                aria-label="Buka profil admin"
                aria-expanded={profileOpen}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-sm font-bold text-white ring-2 ring-transparent transition hover:ring-green-200 focus:outline-none focus:ring-green-300"
              >
                {avatarLetter}
              </button>

              {/* PROFILE DROPDOWN */}

              {profileOpen && (
                <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                        {avatarLetter}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {user?.name || "Admin"}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          Administrator
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Informasi Akun
                      </p>

                      <div className="mt-3 space-y-3">
                        <div>
                          <p className="text-xs text-gray-400">Nama</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {user?.name || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="mt-1 break-all text-sm font-medium text-gray-900">
                            {user?.email || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Telepon</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {user?.phone || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut || loading}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>
    </header>
  );
}
