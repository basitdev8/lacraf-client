"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Artisan, AuthResponse } from "@/lib/types";

interface RegisterStepProps {
  onComplete: (artisan: Artisan) => void;
}

export function RegisterStep({ onComplete }: RegisterStepProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    category: "HANDICRAFT",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!agreed) {
      setError("Please agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, gender, ...rest } = form;
      const body = {
        ...rest,
        ...(gender ? { gender } : {}),
      };

      const data = await api.post<AuthResponse>("/auth/register", body);
      api.setTokens(data.accessToken, data.refreshToken);
      onComplete(data.artisan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({
    open,
    onClick,
  }: {
    open: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted transition-colors hover:text-foreground"
    >
      {open ? (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden w-[40%] flex-col justify-between bg-[#fafafa] p-12 lg:flex">
        <div>
          <p className="text-sm font-semibold tracking-wide">LaCraf</p>
        </div>
        <div>
          <h2 className="font-serif text-3xl leading-snug">
            Every craft
            <br />
            tells a story.
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Join hundreds of artisans already sharing their
            craft with customers who value authenticity.
          </p>
        </div>
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} LaCraf
        </p>
      </div>

      {/* Right form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Set up your artisan account to start selling.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Full Name
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="Your full name"
                className="input-underline"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input-underline"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 00000 00000"
                className="input-underline"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Passwords side by side on desktop */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="relative">
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="input-underline pr-8"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <div className="absolute bottom-3 right-0">
                  <EyeIcon
                    open={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Confirm Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  className="input-underline pr-8"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
                <div className="absolute bottom-3 right-0">
                  <EyeIcon
                    open={showConfirm}
                    onClick={() => setShowConfirm(!showConfirm)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Craft Category
              </label>
              <select
                required
                className="select-underline"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="HANDICRAFT">Handicraft</option>
                <option value="HANDLOOM">Handloom</option>
                <option value="EDIBLES">Edibles</option>
              </select>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-foreground"
              />
              <span className="text-xs leading-relaxed text-muted">
                I agree to the{" "}
                <span className="text-foreground underline underline-offset-2">
                  Terms of Service
                </span>
                ,{" "}
                <span className="text-foreground underline underline-offset-2">
                  Privacy Policy
                </span>
                , and{" "}
                <span className="text-foreground underline underline-offset-2">
                  Cookie Policy
                </span>
                .
              </span>
            </div>

            {error && (
              <p className="rounded-lg bg-error/5 px-4 py-2.5 text-sm text-error">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-dark w-full">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
