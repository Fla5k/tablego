"use client";

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <a href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-gray-900">Table</span>
          <span className="text-green-500">Go</span>
        </a>

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
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Masuk
          </a>

          <a
            href="/register"
            className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Daftar
          </a>
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
            <a href="#home" className="text-sm font-medium text-gray-700">
              Home
            </a>

            <a href="#features" className="text-sm font-medium text-gray-700">
              Fitur
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-700"
            >
              Cara Kerja
            </a>

            <a href="#about" className="text-sm font-medium text-gray-700">
              Tentang
            </a>

            <div className="flex gap-3 pt-2">
              <a
                href="/login"
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium"
              >
                Masuk
              </a>

              <a
                href="/register"
                className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Daftar
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}