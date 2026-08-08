const features = [
  {
    number: "01",
    title: "Booking Tanpa Antre",
    description:
      "Pilih restoran, tentukan waktu kedatangan, dan booking meja langsung dari TableGo.",
  },
  {
    number: "02",
    title: "Pre-Order Makanan",
    description:
      "Pesan makanan sebelum datang sehingga restoran bisa menyiapkan pesanan terlebih dahulu.",
  },
  {
    number: "03",
    title: "QR Check-In",
    description:
      "Tunjukkan QR Code saat tiba di restoran untuk melakukan konfirmasi kehadiran dengan cepat.",
  },
  {
    number: "04",
    title: "Smart Arrival",
    description:
      "Restoran dapat mengetahui estimasi kedatangan pelanggan sehingga persiapan pesanan menjadi lebih efisien.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-500">
            Kenapa TableGo?
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Pengalaman makan yang lebih
            <span className="text-green-500"> praktis.</span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            TableGo menghubungkan pelanggan dan restoran dalam satu platform
            untuk membuat proses reservasi dan persiapan makanan menjadi lebih
            mudah.
          </p>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="bg-white p-8 transition hover:bg-gray-50 md:p-10"
            >
              <span className="text-sm font-semibold text-green-500">
                {feature.number}
              </span>

              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}