"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type OwnerAccountMenuProps = {
  name: string;
};

export default function OwnerAccountMenu({ name }: OwnerAccountMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initial = name?.charAt(0).toUpperCase() || "O";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

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

  return (
    <div ref={menuRef} className="relative">
      {/* ACCOUNT BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-gray-50"
      >
        {/* AVATAR */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
          {initial}
        </div>

        {/* NAME */}
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-[180px] truncate text-sm font-semibold text-gray-900">
            {name}
          </p>

          <p className="text-xs text-gray-500">Owner TableGo</p>
        </div>

        {/* CHEVRON */}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
        >
          {/* ACCOUNT INFO */}
          <div className="border-b border-gray-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {name}
                </p>

                <p className="mt-0.5 text-xs text-gray-500">Owner TableGo</p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="p-2">
            {/* EDIT PROFILE */}
            <Link
              href="/profile/edit"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20h9"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                  />
                </svg>
              </span>

              <span>Edit Profil</span>
            </Link>

            {/* LOGOUT */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 17l5-5-5-5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12H3"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 19V5a2 2 0 00-2-2h-6"
                  />
                </svg>
              </span>

              <span>{loggingOut ? "Keluar..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
