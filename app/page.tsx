export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-5xl font-bold text-blue-600">
        🍽️ TableGo
      </h1>

      <p className="mt-6 max-w-xl text-center text-lg text-gray-600">
        Booking restoran tanpa antre.
        <br />
        Reservasi meja dan pre-order makanan dengan mudah.
      </p>

      <div className="mt-10 flex gap-4">
        <button className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition">
          Mulai Sekarang
        </button>

        <button className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition">
          Lihat Restoran
        </button>
      </div>
    </main>
  );
}