"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { api } from "@/lib/api";

interface VerifyStepProps {
  email: string;
  onComplete: () => void;
}

export function VerifyStep({ email, onComplete }: VerifyStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      submitOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      submitOtp(pasted);
    }
  };

  const submitOtp = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-email", { email, otp: code });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await api.post("/auth/resend-verification", { email });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Mail icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border">
          <svg
            className="h-6 w-6 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>

        {/* OTP inputs */}
        <div className="mt-8 flex justify-center gap-2.5" onPaste={handlePaste}>
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
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="h-12 w-11 rounded-lg border border-border bg-transparent text-center text-lg font-semibold text-foreground transition-all focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-error/5 px-4 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-border border-t-foreground" />
            Verifying...
          </div>
        )}

        <div className="mt-8">
          {resent ? (
            <p className="text-sm text-success">Code resent successfully</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              {resending ? "Sending..." : "Didn\u2019t get the code?"}{" "}
              {!resending && (
                <span className="font-medium text-foreground underline underline-offset-2">
                  Resend
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
