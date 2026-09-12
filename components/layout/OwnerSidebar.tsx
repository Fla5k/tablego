"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/owner", icon: "▦" },
  { label: "Kelola Admin", href: "/owner/admins", icon: "♙" },
  { label: "Kelola Manager", href: "/owner/managers", icon: "♧" },
];

export default function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col">
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

        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Business
        </p>

        <div className="space-y-1">
          {/* Restoran — AKTIF */}
          <Link
            href="/owner/restaurants"
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              pathname.startsWith("/owner/restaurants")
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                pathname.startsWith("/owner/restaurants")
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              ▣
            </span>

            <span>Restoran</span>
          </Link>

          {/* Booking — belum aktif */}
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
              ◫
            </span>

            <span>Booking</span>
          </div>

          {/* Laporan — belum aktif */}
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
              ▥
            </span>

            <span>Laporan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
