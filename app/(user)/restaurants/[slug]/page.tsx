import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface RestaurantDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function createSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { slug } = await params;

  const restaurants = await prisma.restaurant.findMany();

  const restaurant = restaurants.find(
    (item) => createSlug(item.name) === slug.toLowerCase(),
  );

  if (!restaurant) {
    notFound();
  }

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
                className="mt-6 block rounded-xl bg-green-500 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-green-600"
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
