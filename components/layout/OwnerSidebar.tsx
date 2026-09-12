"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: "▦",
  },
  {
    label: "Kelola Admin",
    href: "/owner/admins",
    icon: "♙",
  },
  {
    label: "Kelola Manager",
    href: "/owner/managers",
    icon: "♧",
  },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error(data.message || "Logout gagal.");
        setLoggingOut(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Owner logout error:", error);
      setLoggingOut(false);
    }
  }

  const isProfileActive = pathname.startsWith("/profile");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      {/* BRAND */}
      <div className="flex h-20 items-center border-b border-gray-100 px-6">
        <Link href="/owner" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-lg font-black text-white">
            T
          </div>

          <div>
            <p className="text-lg font-extrabold tracking-tight text-gray-900">
              Table<span className="text-green-600">Go</span>
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Owner Panel
            </p>
          </div>
        </Link>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Overview
        </p>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/owner"
                ? pathname === "/owner"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* BUSINESS */}
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Business
        </p>

        <div className="space-y-1">
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
              ▣
            </span>

            <span>Restoran</span>
          </div>

          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
              ◫
            </span>

            <span>Booking</span>
          </div>

          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
              ▥
            </span>

            <span>Laporan</span>
          </div>
        </div>
      </div>

      {/* OWNER ACCOUNT */}
      <div className="border-t border-gray-100 p-4">
        {/* OWNER INFO */}
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
            O
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">Owner</p>

            <p className="truncate text-xs text-gray-500">TableGo</p>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <Link
          href="/profile/edit"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            isProfileActive
              ? "bg-green-50 text-green-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
              isProfileActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            ♙
          </span>

          <span>Edit Profil</span>
        </Link>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-sm text-red-600">
            ↪
          </span>

          <span>{loggingOut ? "Keluar..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
