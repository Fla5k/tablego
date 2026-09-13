"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mainMenu = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: "▣",
  },
  {
    label: "Kelola Admin",
    href: "/owner/admins",
    icon: "▤",
  },
  {
    label: "Kelola Manager",
    href: "/owner/managers",
    icon: "♙",
  },
];

const businessMenu = [
  {
    label: "Restoran",
    href: "/owner/restaurants",
    icon: "▦",
  },
  {
    label: "Booking",
    href: "/owner/bookings",
    icon: "▤",
  },
  {
    label: "Laporan",
    href: "#",
    icon: "▥",
    disabled: true,
  },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/owner") {
      return pathname === "/owner";
    }

    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-gray-200 px-6">
        <Link
          href="/owner"
          className="text-2xl font-bold tracking-tight"
          onClick={closeMobileMenu}
        >
          <span className="text-gray-900">Table</span>
          <span className="text-green-600">Go</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Menu */}
        <div>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>

          <nav className="space-y-1">
            {mainMenu.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Business */}
        <div className="mt-8">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Business
          </p>

          <nav className="space-y-1">
            {businessMenu.map((item) => {
              const active = isActive(item.href);

              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-base">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Link
          href="/owner"
          className="text-xl font-bold tracking-tight"
          onClick={closeMobileMenu}
        >
          <span className="text-gray-900">Table</span>
          <span className="text-green-600">Go</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <span className="text-xl">{mobileOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
