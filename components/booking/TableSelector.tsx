"use client";

import { useEffect, useState } from "react";

interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  available: boolean;
}

interface TableSelectorProps {
  slug: string;
  guestCount: number;
  selectedDate: string;
  selectedTime: string;
  selectedTable: number | null;
  onSelectTable: (tableId: number) => void;
}

export default function TableSelector({
  slug,
  guestCount,
  selectedDate,
  selectedTime,
  selectedTable,
  onSelectTable,
}: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // PAGINATION
  // =========================================================

  const TABLES_PER_PAGE = 9;

  const [currentPage, setCurrentPage] = useState(0);

  // =========================================================
  // FETCH TABLES
  // =========================================================

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        setError("");

        if (!selectedDate) {
          setTables([]);
          setCurrentPage(0);
          setLoading(false);
          return;
        }

        const query = new URLSearchParams({
          date: selectedDate,
          time: selectedTime,
        });

        const response = await fetch(
          `/api/restaurants/${slug}?${query.toString()}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil data restoran.");
        }

        setTables(data.restaurant.tables ?? []);
        setCurrentPage(0);
      } catch (error) {
        console.error("Fetch tables error:", error);

        setTables([]);
        setCurrentPage(0);

        setError(
          error instanceof Error ? error.message : "Gagal mengambil data meja.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [slug, selectedDate, selectedTime]);

  // =========================================================
  // FILTER KAPASITAS
  // =========================================================

  const suitableTables = tables.filter((table) => table.capacity >= guestCount);

  // =========================================================
  // PAGINATION DATA
  // =========================================================

  const totalPages = Math.ceil(suitableTables.length / TABLES_PER_PAGE);

  const startIndex = currentPage * TABLES_PER_PAGE;

  const visibleTables = suitableTables.slice(
    startIndex,
    startIndex + TABLES_PER_PAGE,
  );

  // =========================================================
  // RESET PAGE JIKA JUMLAH MEJA BERUBAH
  // =========================================================

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }

    if (totalPages === 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-500">
          Seating
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">4. Pilih Meja</h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Pilih meja yang sesuai dengan jumlah tamu dan masih tersedia.
        </p>
      </div>

      {/* BELUM PILIH TANGGAL */}

      {!selectedDate && (
        <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
          <div className="text-2xl">📅</div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            Pilih tanggal terlebih dahulu.
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Setelah memilih tanggal, meja yang tersedia akan ditampilkan.
          </p>
        </div>
      )}

      {/* LOADING */}

      {selectedDate && loading && (
        <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">Memuat meja...</p>
        </div>
      )}

      {/* ERROR */}

      {selectedDate && !loading && error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-500">{error}</p>
        </div>
      )}

      {/* FLOOR PLAN */}

      {selectedDate && !loading && !error && (
        <>
          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            {/* WINDOW */}

            <div className="mb-7 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Window
              </span>
            </div>

            {/* TABLES */}

            {suitableTables.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                  {visibleTables.map((table) => {
                    const isSelected = selectedTable === table.id;

                    const isUnavailable = !table.available;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => {
                          if (!isUnavailable) {
                            onSelectTable(table.id);
                          }
                        }}
                        className={`group flex flex-col items-center text-center transition ${
                          isUnavailable
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        {/* TABLE */}

                        <div
                          className={`relative flex h-20 w-full max-w-[90px] items-center justify-center rounded-xl border-2 bg-white transition-all ${
                            isUnavailable
                              ? "border-red-200 bg-red-50"
                              : isSelected
                                ? "border-green-500 bg-green-50 shadow-md"
                                : "border-gray-200 group-hover:border-green-400 group-hover:shadow-sm"
                          }`}
                        >
                          {/* TOP CHAIR */}

                          <span
                            className={`absolute -top-2 h-3 w-6 rounded-md border bg-white ${
                              isUnavailable
                                ? "border-red-200"
                                : isSelected
                                  ? "border-green-500"
                                  : "border-gray-300"
                            }`}
                          />

                          {/* BOTTOM CHAIR */}

                          <span
                            className={`absolute -bottom-2 h-3 w-6 rounded-md border bg-white ${
                              isUnavailable
                                ? "border-red-200"
                                : isSelected
                                  ? "border-green-500"
                                  : "border-gray-300"
                            }`}
                          />

                          {/* LEFT CHAIR */}

                          <span
                            className={`absolute -left-2 h-6 w-3 rounded-md border bg-white ${
                              isUnavailable
                                ? "border-red-200"
                                : isSelected
                                  ? "border-green-500"
                                  : "border-gray-300"
                            }`}
                          />

                          {/* RIGHT CHAIR */}

                          <span
                            className={`absolute -right-2 h-6 w-3 rounded-md border bg-white ${
                              isUnavailable
                                ? "border-red-200"
                                : isSelected
                                  ? "border-green-500"
                                  : "border-gray-300"
                            }`}
                          />

                          {/* NUMBER */}

                          <span
                            className={`relative z-10 text-sm font-bold ${
                              isUnavailable
                                ? "text-red-400"
                                : isSelected
                                  ? "text-green-600"
                                  : "text-gray-900"
                            }`}
                          >
                            {table.tableNumber}
                          </span>
                        </div>

                        {/* CAPACITY */}

                        <span className="mt-4 text-xs text-gray-500">
                          {table.capacity} orang
                        </span>

                        {/* STATUS */}

                        <span
                          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                            isUnavailable
                              ? "text-red-500"
                              : isSelected
                                ? "text-green-600"
                                : "text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isUnavailable
                                ? "bg-red-400"
                                : isSelected
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                            }`}
                          />

                          {isUnavailable
                            ? "Sudah Dibooking"
                            : isSelected
                              ? "Dipilih"
                              : "Tersedia"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* PAGINATION */}

                {totalPages > 1 && (
                  <div className="mt-7 flex items-center justify-between">
                    {/* PREVIOUS */}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(0, page - 1))
                      }
                      disabled={currentPage === 0}
                      aria-label="Meja sebelumnya"
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold transition ${
                        currentPage === 0
                          ? "cursor-not-allowed border-gray-200 text-gray-300"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      ←
                    </button>

                    {/* PAGE INDICATOR */}

                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500">
                        Halaman {currentPage + 1} dari {totalPages}
                      </p>

                      <div className="mt-2 flex items-center justify-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, index) => (
                          <span
                            key={index}
                            className={`h-1.5 rounded-full transition-all ${
                              index === currentPage
                                ? "w-5 bg-green-500"
                                : "w-1.5 bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* NEXT */}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages - 1, page + 1),
                        )
                      }
                      disabled={currentPage === totalPages - 1}
                      aria-label="Meja berikutnya"
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold transition ${
                        currentPage === totalPages - 1
                          ? "cursor-not-allowed border-gray-200 text-gray-300"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl bg-white p-6 text-center">
                <p className="text-sm font-medium text-gray-700">
                  Tidak ada meja yang sesuai.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Coba kurangi jumlah tamu atau pilih waktu lain.
                </p>
              </div>
            )}

            {/* BAR */}

            <div className="mt-7 rounded-xl bg-gray-900 py-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Bar / Counter
              </span>
            </div>
          </div>

          {/* LEGEND */}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              Tersedia
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Dipilih
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Sudah Dibooking
            </div>
          </div>

          {/* SELECTED TABLE */}

          {selectedTable && (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
              <div>
                <p className="text-xs text-green-600">Meja pilihanmu</p>

                <p className="mt-1 font-semibold text-green-900">
                  {tables.find((table) => table.id === selectedTable)
                    ?.tableNumber ?? "-"}
                </p>
              </div>

              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                Dipilih
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
