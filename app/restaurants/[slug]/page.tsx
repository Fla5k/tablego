import { restaurants } from "@/lib/restaurants";
import { notFound } from "next/navigation";

interface RestaurantDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { slug } = await params;

  const restaurant = restaurants.find(
    (restaurant) => restaurant.slug === slug
  );

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            {restaurant.category}
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">
            {restaurant.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white">
            <span>★ {restaurant.rating}</span>
            <span>{restaurant.reviewCount} ulasan</span>
            <span>{restaurant.location}</span>
            <span>{restaurant.priceRange}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="space-y-8">
            {/* About */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Tentang Restoran
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                {restaurant.description}
              </p>
            </div>

            {/* Opening Hours */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Jam Operasional
              </h2>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Senin - Jumat</span>
                  <span className="font-medium text-gray-900">
                    09:00 - 22:00
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Sabtu - Minggu</span>
                  <span className="font-medium text-gray-900">
                    08:00 - 23:00
                  </span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Menu Populer
              </h2>

              <div className="mt-5 divide-y divide-gray-100">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Cappuccino
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Espresso dengan susu creamy
                    </p>
                  </div>

                  <span className="font-semibold text-gray-900">
                    Rp20.000
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Pasta</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Pasta dengan saus pilihan
                    </p>
                  </div>

                  <span className="font-semibold text-gray-900">
                    Rp35.000
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Cheesecake
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Cheesecake lembut dengan topping buah
                    </p>
                  </div>

                  <span className="font-semibold text-gray-900">
                    Rp25.000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Mau makan di sini?
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-900">
                Booking meja sekarang
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Pilih waktu kedatangan dan pesan makanan sebelum kamu tiba.
              </p>

              <a
                href={`/restaurants/${restaurant.slug}/booking`}
                className="mt-6 block rounded-xl bg-green-500 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-green-600"
              >
                Booking Sekarang
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}