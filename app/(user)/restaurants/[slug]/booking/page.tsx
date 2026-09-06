"use client";

import { useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import TableSelector from "@/components/booking/TableSelector";

type OperatingHour = {
  id: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type Restaurant = {
  id: number;
  name: string;
  operatingHours: OperatingHour[];
  tables: {
    id: number;
    tableNumber: string;
    capacity: number;
    available: boolean;
  }[];
};

const dayNames = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

function getIndonesiaDayOfWeek(dateString: string): number {
  const date = new Date(`${dateString}T12:00:00+07:00`);

  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(date);

  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return map[day];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function generateTimeSlots(operatingHour: OperatingHour | null): string[] {
  if (!operatingHour || operatingHour.isClosed) {
    return [];
  }

  const openMinutes = timeToMinutes(operatingHour.openTime);
  const closeMinutes = timeToMinutes(operatingHour.closeTime);

  const slots: string[] = [];

  for (
    let currentMinutes = openMinutes;
    currentMinutes < closeMinutes;
    currentMinutes += 30
  ) {
    slots.push(minutesToTime(currentMinutes));
  }

  return slots;
}

function isBookingTimeAllowed(
  operatingHours: OperatingHour[],
  date: string,
  time: string,
): boolean {
  if (!date || !time) {
    return false;
  }

  const dayOfWeek = getIndonesiaDayOfWeek(date);

  const hour = operatingHours.find((item) => item.dayOfWeek === dayOfWeek);

  if (!hour || hour.isClosed) {
    return false;
  }

  const slots = generateTimeSlots(hour);

  return slots.includes(time);
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();

  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [restaurantLoading, setRestaurantLoading] = useState(true);

  const [restaurantError, setRestaurantError] = useState("");

  const [guestCount, setGuestCount] = useState(2);

  const [selectedTime, setSelectedTime] = useState("");

  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setRestaurantLoading(true);
        setRestaurantError("");

        const response = await fetch(`/api/restaurants/${slug}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.restaurant) {
          throw new Error(data.message || "Gagal mengambil data restoran.");
        }

        setRestaurant(data.restaurant);
      } catch (error) {
        console.error("Fetch restaurant booking error:", error);

        setRestaurantError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data restoran.",
        );
      } finally {
        setRestaurantLoading(false);
      }
    }

    if (slug) {
      fetchRestaurant();
    }
  }, [slug]);

  const todayDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  const selectedOperatingHour = useMemo(() => {
    if (!restaurant || !selectedDate) {
      return null;
    }

    const dayOfWeek = getIndonesiaDayOfWeek(selectedDate);

    return (
      restaurant.operatingHours.find((item) => item.dayOfWeek === dayOfWeek) ??
      null
    );
  }, [restaurant, selectedDate]);

  const timeSlots = useMemo(() => {
    return generateTimeSlots(selectedOperatingHour);
  }, [selectedOperatingHour]);

  const selectedDateIsClosed = Boolean(
    selectedOperatingHour?.isClosed || (selectedDate && !selectedOperatingHour),
  );

  const selectedTimeIsAllowed = useMemo(() => {
    if (!restaurant || !selectedDate || !selectedTime) {
      return false;
    }

    return isBookingTimeAllowed(
      restaurant.operatingHours,
      selectedDate,
      selectedTime,
    );
  }, [restaurant, selectedDate, selectedTime]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTable(null);
    setErrorMessage("");

    if (!restaurant || !date) {
      setSelectedTime("");
      return;
    }

    const dayOfWeek = getIndonesiaDayOfWeek(date);

    const hour = restaurant.operatingHours.find(
      (item) => item.dayOfWeek === dayOfWeek,
    );

    if (!hour || hour.isClosed) {
      setSelectedTime("");

      setErrorMessage(
        `Restoran tutup pada hari ${
          dayNames[dayOfWeek - 1]
        }. Silakan pilih tanggal lain.`,
      );

      return;
    }

    const slots = generateTimeSlots(hour);

    if (slots.length === 0) {
      setSelectedTime("");

      setErrorMessage(
        `Tidak ada waktu booking yang tersedia pada hari ${
          dayNames[dayOfWeek - 1]
        }.`,
      );

      return;
    }

    if (!slots.includes(selectedTime)) {
      setSelectedTime(slots[0]);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setSelectedTable(null);
    setErrorMessage("");

    if (!selectedDate || !restaurant) {
      return;
    }

    const allowed = isBookingTimeAllowed(
      restaurant.operatingHours,
      selectedDate,
      time,
    );

    if (!allowed) {
      const dayOfWeek = getIndonesiaDayOfWeek(selectedDate);

      const hour = restaurant.operatingHours.find(
        (item) => item.dayOfWeek === dayOfWeek,
      );

      if (!hour || hour.isClosed) {
        setErrorMessage(`Restoran tutup pada hari ${dayNames[dayOfWeek - 1]}.`);
      } else {
        setErrorMessage(
          `Waktu booking tersedia mulai ${hour.openTime} sampai sebelum ${hour.closeTime} WIB.`,
        );
      }
    }
  };

  const handleContinue = () => {
    if (!restaurant) {
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Silakan pilih tanggal terlebih dahulu.");
      return;
    }

    if (selectedDateIsClosed) {
      const dayOfWeek = getIndonesiaDayOfWeek(selectedDate);

      setErrorMessage(
        `Restoran tutup pada hari ${
          dayNames[dayOfWeek - 1]
        }. Silakan pilih tanggal lain.`,
      );

      return;
    }

    if (!selectedTimeIsAllowed) {
      const hour = selectedOperatingHour;

      if (hour && !hour.isClosed) {
        setErrorMessage(
          `Waktu booking hanya tersedia ${hour.openTime}–${hour.closeTime} WIB.`,
        );
      } else {
        setErrorMessage("Waktu booking tidak tersedia.");
      }

      return;
    }

    if (!selectedTable) {
      setErrorMessage("Silakan pilih meja terlebih dahulu.");
      return;
    }

    setErrorMessage("");

    const bookingData = new URLSearchParams({
      date: selectedDate,
      time: selectedTime,
      guests: guestCount.toString(),
      table: selectedTable.toString(),
    });

    router.push(
      `/restaurants/${slug}/booking/confirmation?${bookingData.toString()}`,
    );
  };

  if (restaurantLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">Memuat data restoran...</p>
          </div>
        </div>
      </main>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <h1 className="text-xl font-bold text-red-700">
              Restoran tidak ditemukan
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {restaurantError || "Data restoran tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/restaurants")}
              className="mt-6 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Kembali ke Restoran
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-500">
            Booking Meja
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Booking Meja di {restaurant.name}
          </h1>

          <p className="mt-3 text-gray-600">
            Tentukan waktu kedatangan dan jumlah orang sebelum melanjutkan.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            {/* TANGGAL */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  1
                </span>

                <h2 className="text-lg font-semibold text-gray-900">
                  Pilih Tanggal
                </h2>
              </div>

              <input
                type="date"
                value={selectedDate}
                min={todayDate}
                onChange={(event) => handleDateChange(event.target.value)}
                className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              {selectedDate && selectedOperatingHour && (
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                    selectedOperatingHour.isClosed
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {selectedOperatingHour.isClosed ? (
                    <span className="font-medium">
                      Restoran tutup pada hari{" "}
                      {dayNames[selectedOperatingHour.dayOfWeek - 1]}.
                    </span>
                  ) : (
                    <span>
                      Jam operasional:{" "}
                      <strong>
                        {selectedOperatingHour.openTime}–
                        {selectedOperatingHour.closeTime} WIB
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* WAKTU */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  2
                </span>

                <h2 className="text-lg font-semibold text-gray-900">
                  Pilih Waktu Kedatangan
                </h2>
              </div>

              {!selectedDate ? (
                <div className="mt-5 rounded-xl bg-gray-50 px-4 py-5 text-center">
                  <p className="text-sm text-gray-500">
                    Pilih tanggal terlebih dahulu untuk melihat waktu booking.
                  </p>
                </div>
              ) : selectedDateIsClosed ? (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-5 text-center">
                  <p className="text-sm font-medium text-red-500">
                    Restoran tutup pada tanggal yang dipilih.
                  </p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="mt-5 rounded-xl bg-gray-50 px-4 py-5 text-center">
                  <p className="text-sm text-gray-500">
                    Tidak ada waktu booking yang tersedia.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {timeSlots.map((time) => {
                    const allowed = isBookingTimeAllowed(
                      restaurant.operatingHours,
                      selectedDate,
                      time,
                    );

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!allowed}
                        onClick={() => handleTimeChange(time)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          !allowed
                            ? "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-300"
                            : selectedTime === time
                              ? "border-green-500 bg-green-500 text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* JUMLAH ORANG */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  3
                </span>

                <h2 className="text-lg font-semibold text-gray-900">
                  Jumlah Orang
                </h2>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setGuestCount((count) => Math.max(1, count - 1));
                    setSelectedTable(null);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-600 transition hover:bg-gray-50"
                >
                  −
                </button>

                <div className="flex h-12 min-w-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-5">
                  <span className="text-lg font-semibold text-gray-900">
                    {guestCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuestCount((count) => Math.min(20, count + 1));
                    setSelectedTable(null);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-600 transition hover:bg-gray-50"
                >
                  +
                </button>

                <span className="text-sm text-gray-500">orang</span>
              </div>
            </div>

            {/* RINGKASAN */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm text-gray-500">Ringkasan Booking</p>

                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    {restaurant.name}
                  </h2>
                </div>

                <div className="hidden sm:block">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    Booking Meja
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedDate || "Pilih tanggal"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Waktu</p>

                  <p className="mt-1 text-sm font-medium text-green-600">
                    {selectedTime || "Pilih waktu"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Tamu</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {guestCount} orang
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Meja</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedTable ?? "Pilih meja"}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-500">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={
                  !selectedDate ||
                  selectedDateIsClosed ||
                  !selectedTimeIsAllowed ||
                  !selectedTable
                }
                className="mt-6 w-full rounded-xl bg-green-500 px-5 py-3.5 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Lanjutkan
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                🔒 Data kamu aman dan tidak akan dibagikan ke pihak lain.
              </p>
            </div>
          </div>

          {/* TABLE SELECTOR */}
          <aside className="lg:sticky lg:top-6">
            <TableSelector
              slug={slug}
              guestCount={guestCount}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
