import { CustomerAuthProvider } from "@/context/customer-auth-context";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerAuthProvider>{children}</CustomerAuthProvider>;
}
