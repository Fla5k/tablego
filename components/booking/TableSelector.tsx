"use client";

interface Table {
  id: string;
  capacity: number;
  status: "available" | "occupied";
}

const tables: Table[] = [
  {
    id: "T01",
    capacity: 2,
    status: "available",
  },
  {
    id: "T02",
    capacity: 2,
    status: "occupied",
  },
  {
    id: "T03",
    capacity: 4,
    status: "available",
  },
  {
    id: "T04",
    capacity: 4,
    status: "available",
  },
  {
    id: "T05",
    capacity: 6,
    status: "available",
  },
  {
    id: "T06",
    capacity: 6,
    status: "occupied",
  },
];

interface TableSelectorProps {
  guestCount: number;
  selectedTable: string | null;
  onSelectTable: (tableId: string) => void;
}

export default function TableSelector({
  guestCount,
  selectedTable,
  onSelectTable,
}: TableSelectorProps) {
  const suitableTables = tables.filter(
    (table) => table.capacity >= guestCount
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-500">
          Seating
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          4. Pilih Meja
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Pilih meja yang sesuai dengan jumlah tamu dan masih tersedia.
        </p>
      </div>

      {/* Floor Plan */}
      <div className="mt-6 rounded-2xl bg-gray-50 p-5">
        {/* Window */}
        <div className="mb-7 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Window
          </span>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          {suitableTables.map((table) => {
            const isSelected = selectedTable === table.id;
            const isOccupied = table.status === "occupied";

            return (
              <button
                key={table.id}
                type="button"
                disabled={isOccupied}
                onClick={() => onSelectTable(table.id)}
                className={`group flex flex-col items-center text-center transition ${
                  isOccupied
                    ? "cursor-not-allowed opacity-40"
                    : "cursor-pointer"
                }`}
              >
                {/* Table */}
                <div
                  className={`relative flex h-20 w-full max-w-[90px] items-center justify-center rounded-xl border-2 bg-white transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 shadow-md"
                      : isOccupied
                        ? "border-gray-200"
                        : "border-gray-200 group-hover:border-green-400 group-hover:shadow-sm"
                  }`}
                >
                  {/* Chair Top */}
                  <span
                    className={`absolute -top-2 h-3 w-6 rounded-md border bg-white ${
                      isSelected
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                  />

                  {/* Chair Bottom */}
                  <span
                    className={`absolute -bottom-2 h-3 w-6 rounded-md border bg-white ${
                      isSelected
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                  />

                  {/* Chair Left */}
                  <span
                    className={`absolute -left-2 h-6 w-3 rounded-md border bg-white ${
                      isSelected
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                  />

                  {/* Chair Right */}
                  <span
                    className={`absolute -right-2 h-6 w-3 rounded-md border bg-white ${
                      isSelected
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                  />

                  <span
                    className={`relative z-10 text-sm font-bold ${
                      isSelected
                        ? "text-green-600"
                        : "text-gray-900"
                    }`}
                  >
                    {table.id}
                  </span>
                </div>

                {/* Capacity */}
                <span className="mt-4 text-xs text-gray-500">
                  {table.capacity} orang
                </span>

                {/* Status */}
                <span
                  className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                    isOccupied
                      ? "text-red-400"
                      : isSelected
                        ? "text-green-600"
                        : "text-gray-500"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOccupied
                        ? "bg-red-400"
                        : isSelected
                          ? "bg-green-500"
                          : "bg-gray-300"
                    }`}
                  />

                  {isOccupied
                    ? "Terisi"
                    : isSelected
                      ? "Dipilih"
                      : "Tersedia"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bar */}
        <div className="mt-7 rounded-xl bg-gray-900 py-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Bar / Counter
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-center gap-5 text-xs text-gray-500">
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
          Terisi
        </div>
      </div>

      {/* Selected Table */}
      {selectedTable && (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
          <div>
            <p className="text-xs text-green-600">
              Meja pilihanmu
            </p>

            <p className="mt-1 font-semibold text-green-900">
              {selectedTable}
            </p>
          </div>

          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            Dipilih
          </span>
        </div>
      )}
    </div>
  );
}