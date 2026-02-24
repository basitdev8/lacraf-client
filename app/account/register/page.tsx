"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerApi } from "@/lib/customer-api";

export default function CustomerRegisterPage() {
  const { customer, loading } = useCustomerAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      await customerApi.post("/customer/auth/register", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      router.push(`/account/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl font-bold italic">
            LaCraf
          </Link>
          <p className="mt-1 text-xs tracking-widest text-muted uppercase">
            Create Account
          </p>
        </div>

        <h1 className="text-2xl font-semibold">Join LaCraf</h1>
        <p className="mt-1.5 text-sm text-muted">
          Create your account to start shopping
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Full Name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              className="input-underline"
              placeholder="Your full name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>

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
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Phone{" "}
              <span className="text-muted/60 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              autoComplete="tel"
              className="input-underline"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              className="input-underline"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Confirm Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              className="input-underline"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
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
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/account/login"
            className="font-medium text-brand-dark underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-muted">
          Are you an artisan?{" "}
          <Link
            href="/onboarding"
            className="font-medium text-brand-dark underline underline-offset-2"
          >
            Register as artisan
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
