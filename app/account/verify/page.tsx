"use client";

import { useState, useRef, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";

function VerifyForm() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await customerApi.post("/customer/auth/verify-email", {
        email,
        otp: otpString,
      });
      router.push("/account/login?verified=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const data = await customerApi.post<{ message: string }>(
        "/customer/auth/resend-verification",
        { email }
      );
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-muted">No email provided.</p>
          <Link
            href="/account/register"
            className="mt-4 inline-block text-sm font-medium text-brand-dark underline underline-offset-2"
          >
            Go to registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl font-bold italic">
            LaCraf
          </Link>
          <p className="mt-1 text-xs tracking-widest text-muted uppercase">
            Verify Email
          </p>
        </div>

        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-1.5 text-sm text-muted">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          {/* OTP inputs */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e.key)}
                className="h-12 w-10 rounded-lg border border-border bg-white text-center text-lg font-semibold outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand"
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-error/5 px-4 py-2.5 text-center text-sm text-error">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 rounded-lg bg-success/5 px-4 py-2.5 text-center text-sm text-success">
              {success}
            </p>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="btn-brand w-full"
            >
              {submitting ? "Verifying..." : "Verify email"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-brand-dark underline underline-offset-2 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-muted">
          <Link
            href="/account/login"
            className="hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
