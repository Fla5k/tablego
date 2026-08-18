import UserNavbar from "@/components/layout/UserNavbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserNavbar />
      {children}
    </>
  );
}
