import Link from "next/link";

const footerLinks = {
  Platform: ["Restoran", "Booking", "Pre-Order", "QR Check-In"],
  Perusahaan: ["Tentang Kami", "Karier", "Kontak"],
  Bantuan: ["Pusat Bantuan", "FAQ", "Kebijakan Privasi"],
};

export default function Footer() {
  return (
    <footer id="about" className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              <span className="text-gray-900">Table</span>
              <span className="text-green-500">Go</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600">
              Platform booking restoran yang membantu pelanggan makan tanpa
              perlu menghabiskan waktu untuk antre.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 transition hover:text-green-500"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-gray-200 pt-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 TableGo. All rights reserved.</p>

          <p>Made for better dining experiences.</p>
        </div>
      </div>
    </footer>
  );
}
