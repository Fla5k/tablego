import ManagerNavbar from "@/components/layout/ManagerNavbar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ManagerNavbar />
      {children}
    </>
  );
}
