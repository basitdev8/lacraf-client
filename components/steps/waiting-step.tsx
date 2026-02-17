"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { KycStatus } from "@/lib/types";
import { StepIndicator } from "@/components/step-indicator";

interface WaitingStepProps {
  onApproved: () => void;
  onRejected: () => void;
}

export function WaitingStep({ onApproved, onRejected }: WaitingStepProps) {
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const data = await api.get<KycStatus>("/kyc/status");
      setStatus(data);

      if (data.status === "APPROVED") {
        onApproved();
      } else if (data.status === "REJECTED") {
        onRejected();
      }
    } catch {
      // Silently retry
    } finally {
      setLoading(false);
    }
  }, [onApproved, onRejected]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="mt-4 text-sm text-muted">Loading status...</p>
      </div>
    );
  }

  const isRejected = status?.status === "REJECTED";

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <StepIndicator currentStep="waiting" />

        {isRejected ? (
          <div className="mx-auto max-w-md text-center">
            {/* Warning icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-error/20 bg-error/5">
              <svg
                className="h-6 w-6 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Verification Unsuccessful
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your documents could not be verified. Please review the feedback
              below and re-submit.
            </p>

            {status?.rejectionReason && (
              <div className="mx-auto mt-8 rounded-xl bg-[#fafafa] px-6 py-5 text-left">
                <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted">
                  Reviewer Note
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  {status.rejectionReason}
                </p>
              </div>
            )}

            <div className="mt-8">
              <button onClick={onRejected} className="btn-dark">
                Re-upload Documents
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
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md text-center">
            {/* Success icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-[#fafafa]">
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Application Submitted
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your application has been submitted successfully. Our team will
              review your information and visit your workshop within 72 hours.
            </p>

            {/* What happens next */}
            <div className="mt-10 rounded-xl bg-[#fafafa] px-6 py-6 text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                What happens next
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "SMS updates to your registered phone",
                  "Email updates to your inbox",
                  "Notifications on your LaCraf account",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-xs font-medium text-muted">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => (window.location.href = "/")}
                className="btn-outline"
              >
                Return Home
              </button>
            </div>

            <p className="mt-8 text-xs text-muted">
              Need help? Contact Seller Support at{" "}
              <span className="font-medium text-foreground">
                1800-XXX-XXXX
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
