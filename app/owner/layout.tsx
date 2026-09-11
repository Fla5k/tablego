import OwnerSidebar from "@/components/layout/OwnerSidebar";

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <OwnerSidebar />

      <div className="min-w-0">{children}</div>
    </div>
  );
}
