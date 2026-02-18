"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";

export default function AdminLoginPage() {
  const { admin, loading, login } = useAdminAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && admin) {
      router.replace("/admin/dashboard");
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f7f7] px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="font-serif text-2xl font-bold italic">LaCraf</span>
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p className="mt-1 text-xs tracking-widest text-muted uppercase">
            Admin Portal
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Sign in to Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Access the LaCraf management dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input-underline"
                placeholder="admin@lacraf.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="input-underline"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-error/5 px-4 py-2.5 text-center text-sm text-error">
                {error}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="btn-brand w-full"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          This portal is for authorized administrators only.
        </p>
      </div>
    </div>
  );
}
