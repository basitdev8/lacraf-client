import type { Metadata } from "next";
import { AdminAuthProvider } from "@/context/admin-auth-context";

export const metadata: Metadata = {
  title: "LaCraf — Admin",
  description: "LaCraf admin panel",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
