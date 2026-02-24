"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/customer-auth-context";

function VerifiedBanner() {
  const params = useSearchParams();
  if (params.get("verified") !== "true") return null;
  return (
    <div className="mb-6 rounded-xl border border-success/20 bg-success/5 px-4 py-3.5 text-center">
      <p className="text-sm font-medium text-success">
        Email verified successfully!
      </p>
      <p className="mt-0.5 text-xs text-muted">
        You can now sign in to your account.
      </p>
    </div>
  );
}

function LoginForm() {
  const { login, customer, loading } = useCustomerAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && customer) {
      router.replace("/account");
    }
  }, [customer, loading, router]);

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
      router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl font-bold italic">
            LaCraf
          </Link>
          <p className="mt-1 text-xs tracking-widest text-muted uppercase">
            My Account
          </p>
        </div>

        <Suspense>
          <VerifiedBanner />
        </Suspense>

        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="input-underline"
              placeholder="your@email.com"
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
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-error/5 px-4 py-2.5 text-center text-sm text-error">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-brand w-full"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          New here?{" "}
          <Link
            href="/account/register"
            className="font-medium text-brand-dark underline underline-offset-2"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to shop
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return <LoginForm />;
}
