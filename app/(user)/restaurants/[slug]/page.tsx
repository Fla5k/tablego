import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

interface RestaurantDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const dayNames = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

function createSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function getIndonesiaDayOfWeek(): number {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(new Date());

  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return dayMap[day] ?? 1;
}

function getIndonesiaTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { slug } = await params;

  const restaurants = await prisma.restaurant.findMany({
    include: {
      operatingHours: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
    },
  });

  const restaurant = restaurants.find(
    (item) => createSlug(item.name) === slug.toLowerCase(),
  );

  if (!restaurant) {
    notFound();
  }

  const today = getIndonesiaDayOfWeek();
  const currentTime = getIndonesiaTime();

  const todayOperatingHour = restaurant.operatingHours.find(
    (hour) => hour.dayOfWeek === today,
  );

  const isOpenNow =
    !!todayOperatingHour &&
    !todayOperatingHour.isClosed &&
    currentTime >= todayOperatingHour.openTime &&
    currentTime < todayOperatingHour.closeTime;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative h-[400px] overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            Restoran
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">
            {restaurant.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white">
            <span>{restaurant.address}</span>

            {restaurant.phone && <span>{restaurant.phone}</span>}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* MAIN */}
          <div className="space-y-8">
            {/* ABOUT */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Tentang Restoran
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                {restaurant.description || "Belum ada deskripsi restoran."}
              </p>
            </div>

            {/* OPERATING HOURS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Jam Operasional
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Waktu Indonesia Barat (WIB)
                  </p>
                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    isOpenNow
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isOpenNow ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  {isOpenNow ? "Buka sekarang" : "Tutup sekarang"}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
                {dayNames.map((dayName, index) => {
                  const dayOfWeek = index + 1;

                  const operatingHour = restaurant.operatingHours.find(
                    (hour) => hour.dayOfWeek === dayOfWeek,
                  );

                  const isToday = dayOfWeek === today;

                  return (
                    <div
                      key={dayOfWeek}
                      className={`flex items-center justify-between gap-4 px-4 py-4 ${
                        index !== dayNames.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } ${isToday ? "bg-green-50" : "bg-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            isToday ? "text-green-700" : "text-gray-900"
                          }`}
                        >
                          {dayName}
                        </span>

                        {isToday && (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Hari ini
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-sm font-medium ${
                          operatingHour?.isClosed
                            ? "text-red-500"
                            : "text-gray-600"
                        }`}
                      >
                        {!operatingHour || operatingHour.isClosed
                          ? "Tutup"
                          : `${operatingHour.openTime} – ${operatingHour.closeTime}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INFORMATION */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Informasi Restoran
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Nama Restoran</span>

                  <span className="font-medium text-gray-900">
                    {restaurant.name}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Alamat</span>

                  <span className="text-right font-medium text-gray-900">
                    {restaurant.address}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Telepon</span>

                  <span className="font-medium text-gray-900">
                    {restaurant.phone || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOOKING CARD */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-green-600">
                Reservasi Restoran
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-900">
                Booking meja sekarang
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Pilih tanggal, waktu, jumlah tamu, dan meja yang tersedia
                sebelum datang ke restoran.
              </p>

              <Link
                href={`/restaurants/${createSlug(restaurant.name)}/booking`}
                className={`mt-6 block rounded-xl px-5 py-3.5 text-center font-semibold text-white transition ${
                  isOpenNow ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"
                }`}
              >
                Booking Sekarang
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
