import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main id="home" className="min-h-screen bg-white">
      <Navbar />

      <section className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-green-500">
            Smart Restaurant Booking
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
            Booking Restoran
            <br />
            <span className="text-green-500">Tanpa Antre.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Pesan meja, pilih menu, dan datang tanpa perlu menghabiskan waktu
            untuk mengantre.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/restaurants"
              className="rounded-xl bg-green-500 px-7 py-3.5 font-semibold text-white transition hover:bg-green-600"
            >
              Cari Restoran
            </a>

            <a
              href="#how-it-works"
              className="rounded-xl border border-gray-200 px-7 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Pelajari Cara Kerja
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}