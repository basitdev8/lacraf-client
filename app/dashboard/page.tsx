"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import type { Shop, KycStatus } from "@/lib/types";

export default function DashboardPage() {
  const { artisan } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.get<Shop>("/shop/me");
        setShop(s);
      } catch {
        // No shop yet
      }
      try {
        const k = await api.get<KycStatus>("/kyc/status");
        setKycStatus(k);
      } catch {
        // No KYC yet
      }
      setLoadingData(false);
    }
    load();
  }, []);

  const firstName = artisan?.fullName.split(" ")[0] ?? "Artisan";

  const setupSteps = [
    {
      label: "Email verified",
      desc: "Your email address is confirmed.",
      done: !!artisan?.emailVerified,
      href: null,
    },
    {
      label: "Shop details",
      desc: "Add your shop name, address and story.",
      done: !!shop,
      href: "/onboarding",
    },
    {
      label: "Identity documents",
      desc: "Upload your Aadhaar, PAN and bank proof.",
      done: !!(kycStatus && kycStatus.status !== "PENDING"),
      href: "/onboarding",
    },
    {
      label: "Verification approved",
      desc: "Admin reviews your application.",
      done: kycStatus?.status === "APPROVED",
      href: null,
    },
  ];

  const completedCount = setupSteps.filter((s) => s.done).length;
  const isFullyOnboarded = artisan?.isApproved;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Good to see you,{" "}
          <span className="decoration-brand underline decoration-[3px] underline-offset-4">
            {firstName}
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Here&apos;s an overview of your artisan account.
        </p>
      </div>

      {/* Setup incomplete banner */}
      {!isFullyOnboarded && (
        <div className="rounded-2xl border border-brand/25 bg-brand-light/70 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Complete your seller setup</h2>
              <p className="mt-1 text-sm text-muted">
                {completedCount} of {setupSteps.length} steps done — finish
                setting up to start selling on LaCraf.
              </p>
            </div>
            <Link href="/onboarding" className="btn-brand shrink-0 text-sm">
              Continue setup
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
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-brand/20">
            <div
              className="h-full rounded-full bg-brand transition-all duration-700"
              style={{
                width: `${(completedCount / setupSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Setup checklist */}
      {!loadingData && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Account Setup
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {setupSteps.map((step, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-5 transition-shadow hover:shadow-sm ${
                  step.done
                    ? "border-success/20 bg-white"
                    : "border-border bg-white"
                }`}
              >
                {/* Icon */}
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${
                    step.done ? "bg-success/10" : "bg-brand-light"
                  }`}
                >
                  {step.done ? (
                    <svg
                      className="h-4 w-4 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-brand-dark"
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
                  )}
                </div>

                <p className="text-sm font-medium">{step.label}</p>
                <p className="mt-0.5 text-xs text-muted">{step.desc}</p>

                {!step.done && step.href && (
                  <Link
                    href={step.href}
                    className="mt-3 inline-block text-xs font-medium text-brand-dark underline underline-offset-2"
                  >
                    Complete now →
                  </Link>
                )}
                {step.done && (
                  <p className="mt-3 text-xs font-medium text-success">
                    ✓ Done
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content — two columns on larger screens */}
      {!loadingData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Shop card */}
          {shop ? (
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Your Shop</h2>
                <Link
                  href="/onboarding"
                  className="text-xs text-brand-dark underline underline-offset-2"
                >
                  Edit
                </Link>
              </div>
              <p className="text-lg font-medium">{shop.shopName}</p>
              <p className="mt-1 text-sm text-muted">{shop.address}</p>
              {shop.description && (
                <p className="mt-3 line-clamp-3 text-sm text-muted">
                  {shop.description}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light">
                <svg
                  className="h-5 w-5 text-brand-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                  />
                </svg>
              </div>
              <p className="font-medium">No shop set up yet</p>
              <p className="mt-1 text-sm text-muted">
                Add your shop name, address and craft story.
              </p>
              <Link href="/onboarding" className="btn-brand mt-4 inline-flex">
                Set up shop
              </Link>
            </div>
          )}

          {/* KYC / Verification card */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold">Verification Status</h2>

            {kycStatus ? (
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      kycStatus.status === "APPROVED"
                        ? "bg-success/10 text-success"
                        : kycStatus.status === "REJECTED"
                          ? "bg-error/10 text-error"
                          : "bg-brand-light text-brand-dark"
                    }`}
                  >
                    {kycStatus.status === "UNDER_REVIEW"
                      ? "Under Review"
                      : kycStatus.status}
                  </span>
                  {kycStatus.submittedAt && (
                    <span className="text-xs text-muted">
                      Submitted{" "}
                      {new Date(kycStatus.submittedAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                  )}
                </div>

                {/* Status message */}
                {kycStatus.status === "APPROVED" && (
                  <p className="text-sm text-success">
                    Your documents have been verified. You&apos;re all set to
                    sell on LaCraf!
                  </p>
                )}
                {kycStatus.status === "UNDER_REVIEW" && (
                  <p className="text-sm text-muted">
                    Our team is reviewing your documents. This typically takes
                    up to 72 hours.
                  </p>
                )}
                {kycStatus.status === "REJECTED" && (
                  <>
                    {kycStatus.rejectionReason && (
                      <div className="rounded-xl border border-error/10 bg-error/5 px-4 py-3">
                        <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-error/70">
                          Reviewer Note
                        </p>
                        <p className="mt-1 text-sm">
                          {kycStatus.rejectionReason}
                        </p>
                      </div>
                    )}
                    <Link href="/onboarding" className="btn-brand inline-flex">
                      Re-upload Documents
                    </Link>
                  </>
                )}

                {/* Document list */}
                {kycStatus.documents && kycStatus.documents.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {kycStatus.documents.map((doc) => (
                      <div
                        key={doc.type}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${doc.uploaded ? "bg-success" : "bg-border"}`}
                        />
                        <span
                          className={doc.uploaded ? "text-foreground" : "text-muted"}
                        >
                          {doc.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        {doc.uploaded && (
                          <span className="text-success">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light">
                  <svg
                    className="h-5 w-5 text-brand-dark"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                    />
                  </svg>
                </div>
                <p className="font-medium">No documents submitted</p>
                <p className="mt-1 text-sm text-muted">
                  Upload your identity documents to get verified.
                </p>
                {shop && (
                  <Link href="/onboarding" className="btn-brand mt-4 inline-flex">
                    Upload Documents
                  </Link>
                )}
                {!shop && (
                  <p className="mt-3 text-xs text-muted">
                    Complete shop setup first to unlock this step.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loadingData && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        </div>
      )}
    </div>
  );
}
