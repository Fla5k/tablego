export default function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-gray-900 px-6 py-16 text-center md:px-12 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            Siap makan tanpa antre?
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
            Jadikan pengalaman makanmu lebih mudah bersama TableGo.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
            Temukan restoran favoritmu, booking meja, dan pesan makanan
            sebelum kamu tiba.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/restaurants"
              className="rounded-xl bg-green-500 px-7 py-3.5 font-semibold text-white transition hover:bg-green-600"
            >
              Mulai Booking
            </a>

            <a
              href="/register"
              className="rounded-xl border border-gray-700 px-7 py-3.5 font-semibold text-white transition hover:bg-gray-800"
            >
              Buat Akun
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}