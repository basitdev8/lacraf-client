"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Shop } from "@/lib/types";
import { StepIndicator } from "@/components/step-indicator";

interface ShopStepProps {
  artisanName: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export function ShopStep({ artisanName, onComplete, onSkip }: ShopStepProps) {
  const [form, setForm] = useState({
    shopName: "",
    description: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firstName = artisanName.split(" ")[0] || "Artisan";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.description.length < 50) {
      setError("Description must be at least 50 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post<Shop>("/shop/setup", form);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Shop setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <StepIndicator currentStep="shop" />

        <div className="text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Welcome,{" "}
            <span className="decoration-brand underline decoration-[3px] underline-offset-4">
              {firstName}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Tell us about your craft business. You can always update these
            details later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg">
          <div className="space-y-8">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Shop Name
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={150}
                placeholder="What would you like to call your shop?"
                className="input-underline"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Shop Address
              </label>
              <input
                type="text"
                required
                minLength={5}
                maxLength={255}
                placeholder="House number, street, city, state"
                className="input-underline"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-xs font-medium text-muted">
                  About Your Craft
                </label>
                <span className="text-[0.6875rem] tabular-nums text-muted">
                  {form.description.length} / 2000
                </span>
              </div>
              <textarea
                required
                minLength={50}
                maxLength={2000}
                rows={4}
                placeholder="Describe your craft, your story, what makes your products special... (min 50 characters)"
                className="textarea-underline"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {form.description.length > 0 && form.description.length < 50 && (
                <p className="mt-1 text-xs text-brand-dark">
                  {50 - form.description.length} more characters needed
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-lg bg-error/5 px-4 py-2.5 text-center text-sm text-error">
              {error}
            </p>
          )}

          <div className="mt-10 flex flex-col items-center gap-4">
            <button type="submit" disabled={loading} className="btn-brand">
              {loading ? "Setting up..." : "Continue"}
              {!loading && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Skip for now, go to dashboard →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
