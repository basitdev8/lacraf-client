"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { artisan, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !artisan) {
      router.replace("/login");
    }
  }, [artisan, loading, router]);

  if (loading || !artisan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <span className="font-serif text-xl font-bold italic">LaCraf</span>

          <nav className="hidden items-center gap-8 sm:flex">
            <a
              href="/dashboard"
              className="text-sm font-medium text-foreground"
            >
              Dashboard
            </a>
            <a
              href="/onboarding"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Complete Setup
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:block">
              {artisan.fullName}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
