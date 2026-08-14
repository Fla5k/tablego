"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <a
            href="#home"
            className="text-sm font-medium text-gray-700 transition hover:text-green-500"
          >
            Home
          </a>

          <a
            href="#features"
            className="text-sm font-medium text-gray-700 transition hover:text-green-500"
          >
            Fitur
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-700 transition hover:text-green-500"
          >
            Cara Kerja
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-gray-700 transition hover:text-green-500"
          >
            Tentang
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
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
            <a
              href="#home"
              className="text-sm font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Fitur
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Cara Kerja
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Tentang
            </a>

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
          </div>
        </div>
      )}
    </nav>
  );
}
