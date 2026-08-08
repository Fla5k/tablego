const steps = [
  {
    number: "01",
    title: "Cari Restoran",
    description:
      "Temukan restoran yang sesuai dengan lokasi, waktu, dan kebutuhanmu.",
  },
  {
    number: "02",
    title: "Booking Meja",
    description:
      "Pilih tanggal, waktu kedatangan, jumlah orang, dan meja yang tersedia.",
  },
  {
    number: "03",
    title: "Pre-Order Makanan",
    description:
      "Pilih makanan sebelum datang agar restoran dapat mempersiapkan pesananmu.",
  },
  {
    number: "04",
    title: "Smart Arrival",
    description:
      "Restoran mendapatkan informasi estimasi kedatangan untuk mempersiapkan pesanan.",
  },
  {
    number: "05",
    title: "QR Check-In",
    description:
      "Saat tiba, scan QR Code untuk mengonfirmasi kehadiran dengan cepat.",
  },
  {
    number: "06",
    title: "Makan Tanpa Antre",
    description:
      "Masuk ke restoran, duduk di meja yang sudah disiapkan, dan nikmati makananmu.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-500">
            Cara Kerja
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Dari booking sampai
            <span className="text-green-500"> makan.</span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            TableGo membuat proses makan di restoran menjadi lebih terencana,
            cepat, dan nyaman.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gray-200 md:block" />

          <div className="space-y-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative flex gap-6 md:gap-10"
              >
                {/* Number */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-green-500 shadow-sm">
                  {step.number}
                </div>

                {/* Content */}
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-2xl leading-7 text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}