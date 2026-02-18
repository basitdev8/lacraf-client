"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import type { ArtisanDetail, KycStatusValue } from "@/lib/admin-types";

type ReviewDecision = "APPROVED" | "REJECTED";
type ReviewMode = "idle" | "approve" | "reject";

const DOC_LABELS: Record<string, string> = {
  "aadhaar-front": "Aadhaar Card — Front",
  "aadhaar-back": "Aadhaar Card — Back",
  pan: "PAN Card",
  "bank-proof": "Bank Proof",
  "business-cert": "Business Certificate",
  gst: "GST Certificate",
};

function KycBadge({ status }: { status: KycStatusValue }) {
  const map: Record<KycStatusValue, { cls: string; label: string }> = {
    PENDING: { cls: "bg-[#f2f2f2] text-muted", label: "Pending" },
    UNDER_REVIEW: {
      cls: "bg-brand-light text-brand-dark",
      label: "Under Review",
    },
    APPROVED: { cls: "bg-success/10 text-success", label: "Approved" },
    REJECTED: { cls: "bg-error/10 text-error", label: "Rejected" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function ArtisanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewMode, setReviewMode] = useState<ReviewMode>("idle");
  const [note, setNote] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showBlockForm, setShowBlockForm] = useState(false);

  const fetchArtisan = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.get<ArtisanDetail>(`/admin/artisans/${id}`);
      setArtisan(data);
    } catch {
      setError("Failed to load artisan details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArtisan();
  }, [fetchArtisan]);

  const handleReview = async () => {
    if (!artisan) return;
    if (reviewMode === "idle") return;
    if (reviewMode === "reject" && !note.trim()) {
      setReviewError("A reason is required when rejecting.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const decision: ReviewDecision =
        reviewMode === "approve" ? "APPROVED" : "REJECTED";
      const body: { decision: ReviewDecision; note?: string } = { decision };
      if (note.trim()) body.note = note.trim();

      await adminApi.post(`/admin/artisans/${id}/review`, body);
      setReviewSuccess(
        decision === "APPROVED"
          ? "Artisan approved successfully. They can now start selling."
          : "Artisan rejected. They have been notified via email."
      );
      setReviewMode("idle");
      setNote("");
      // Refresh data
      await fetchArtisan();
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!artisan) return;
    setBlockSubmitting(true);
    try {
      await adminApi.post(`/admin/artisans/${id}/block`, {
        reason: blockReason.trim() || undefined,
      });
      setShowBlockForm(false);
      setBlockReason("");
      await fetchArtisan();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to block artisan");
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleUnblock = async () => {
    if (!artisan) return;
    setBlockSubmitting(true);
    try {
      await adminApi.post(`/admin/artisans/${id}/unblock`);
      await fetchArtisan();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unblock artisan");
    } finally {
      setBlockSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-error">{error || "Artisan not found"}</p>
        <Link
          href="/admin/artisans"
          className="mt-4 inline-block text-sm text-muted underline underline-offset-2"
        >
          ← Back to artisans
        </Link>
      </div>
    );
  }

  const kycStatus = artisan.kyc?.status;
  const canReview = kycStatus === "UNDER_REVIEW";

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/admin/artisans"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Artisans
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-xl font-bold text-brand-dark">
              {artisan.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{artisan.fullName}</h1>
              <p className="text-sm text-muted">{artisan.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Blocked badge */}
            {!artisan.isActive && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                Blocked
              </span>
            )}
            {/* Approved badge */}
            {artisan.isApproved && artisan.isActive && (
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                Approved Seller
              </span>
            )}
            {/* Block / Unblock */}
            {artisan.isActive ? (
              <button
                onClick={() => setShowBlockForm(true)}
                disabled={blockSubmitting}
                className="rounded-xl border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/5 disabled:opacity-40"
              >
                Block Account
              </button>
            ) : (
              <button
                onClick={handleUnblock}
                disabled={blockSubmitting}
                className="rounded-xl border border-success/30 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/5 disabled:opacity-40"
              >
                {blockSubmitting ? "Unblocking…" : "Unblock Account"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Block form inline */}
      {showBlockForm && (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-6">
          <h3 className="mb-3 font-semibold text-error">Block this artisan?</h3>
          <p className="mb-4 text-sm text-muted">
            This will immediately invalidate their session. They will not be able to log in until unblocked.
          </p>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Reason (optional)
            </label>
            <textarea
              rows={3}
              className="textarea-underline"
              placeholder="Reason for blocking this account…"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBlock}
              disabled={blockSubmitting}
              className="rounded-xl bg-error px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {blockSubmitting ? "Blocking…" : "Confirm Block"}
            </button>
            <button
              onClick={() => {
                setShowBlockForm(false);
                setBlockReason("");
              }}
              className="text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review success */}
      {reviewSuccess && (
        <div className="rounded-2xl border border-success/20 bg-success/5 px-5 py-4 text-sm text-success">
          {reviewSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — Profile + Shop */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile */}
          <Section title="Profile">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Field label="Full Name" value={artisan.fullName} />
              <Field label="Email" value={artisan.email} />
              <Field label="Phone" value={artisan.phone} />
              <Field
                label="Gender"
                value={
                  artisan.gender
                    ? artisan.gender.charAt(0) +
                      artisan.gender.slice(1).toLowerCase().replace(/_/g, " ")
                    : null
                }
              />
              <Field
                label="Category"
                value={
                  artisan.category.charAt(0) +
                  artisan.category.slice(1).toLowerCase()
                }
              />
              <Field
                label="Email Verified"
                value={artisan.emailVerified ? "Yes" : "No"}
              />
              <Field label="Village / Town" value={artisan.village} />
              <Field label="District" value={artisan.district} />
              <Field label="State" value={artisan.state} />
            </div>
          </Section>

          {/* Shop */}
          {artisan.shop ? (
            <Section title="Shop">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted">Shop Name</p>
                  <p className="mt-0.5 text-base font-semibold">
                    {artisan.shop.shopName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted">Address</p>
                  <p className="mt-0.5 text-sm">{artisan.shop.address}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted">Description</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {artisan.shop.description}
                  </p>
                </div>
              </div>
            </Section>
          ) : (
            <Section title="Shop">
              <p className="text-sm text-muted">
                Artisan has not set up a shop yet.
              </p>
            </Section>
          )}
        </div>

        {/* Right column — KYC + Review */}
        <div className="space-y-6">
          {/* KYC Status */}
          <Section title="KYC Status">
            {artisan.kyc ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <KycBadge status={artisan.kyc.status} />
                </div>

                {artisan.kyc.submittedAt && (
                  <div>
                    <p className="text-xs text-muted">Submitted</p>
                    <p className="text-sm">
                      {new Date(artisan.kyc.submittedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}

                {artisan.kyc.reviewedAt && (
                  <div>
                    <p className="text-xs text-muted">Reviewed</p>
                    <p className="text-sm">
                      {new Date(artisan.kyc.reviewedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}

                {artisan.kyc.rejectionReason && (
                  <div className="rounded-xl border border-error/10 bg-error/5 px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-error/70">
                      Rejection Reason
                    </p>
                    <p className="text-sm">{artisan.kyc.rejectionReason}</p>
                  </div>
                )}

                {/* Documents */}
                {Object.keys(artisan.kyc.documents).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted">
                      Documents
                    </p>
                    <div className="space-y-2">
                      {Object.entries(artisan.kyc.documents).map(
                        ([type, url]) => (
                          <a
                            key={type}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-foreground/20 hover:bg-[#fafafa]"
                          >
                            <div className="flex items-center gap-2.5">
                              <svg
                                className="h-4 w-4 shrink-0 text-muted"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.75}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="font-medium">
                                {DOC_LABELS[type] ?? type}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-brand-dark">
                              View
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </span>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">No KYC submitted yet.</p>
            )}
          </Section>

          {/* Review Panel */}
          {canReview && (
            <Section title="Review Decision">
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  Review this artisan&apos;s KYC documents and make a decision.
                  The artisan will be notified via email.
                </p>

                {/* Decision toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setReviewMode(
                        reviewMode === "approve" ? "idle" : "approve"
                      )
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                      reviewMode === "approve"
                        ? "border-success bg-success/10 text-success"
                        : "border-border text-muted hover:border-success/40 hover:text-success"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
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
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      setReviewMode(reviewMode === "reject" ? "idle" : "reject")
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                      reviewMode === "reject"
                        ? "border-error bg-error/10 text-error"
                        : "border-border text-muted hover:border-error/40 hover:text-error"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </button>
                </div>

                {/* Note field */}
                {reviewMode !== "idle" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted">
                      {reviewMode === "reject"
                        ? "Reason for rejection"
                        : "Note to artisan"}
                      {reviewMode === "reject" && (
                        <span className="ml-1 text-error">*</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      className="textarea-underline"
                      placeholder={
                        reviewMode === "reject"
                          ? "Explain what documents need to be re-uploaded or corrected…"
                          : "Optional welcome note or message…"
                      }
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                )}

                {reviewError && (
                  <p className="rounded-lg bg-error/5 px-3 py-2 text-sm text-error">
                    {reviewError}
                  </p>
                )}

                {reviewMode !== "idle" && (
                  <button
                    onClick={handleReview}
                    disabled={reviewSubmitting}
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-40 ${
                      reviewMode === "approve"
                        ? "bg-success text-white hover:opacity-90"
                        : "bg-error text-white hover:opacity-90"
                    }`}
                  >
                    {reviewSubmitting
                      ? "Submitting…"
                      : reviewMode === "approve"
                        ? "Confirm Approval"
                        : "Confirm Rejection"}
                  </button>
                )}
              </div>
            </Section>
          )}

          {/* Already reviewed info */}
          {kycStatus === "APPROVED" && (
            <div className="rounded-2xl border border-success/20 bg-success/5 px-5 py-4">
              <p className="text-sm font-semibold text-success">
                Application approved
              </p>
              <p className="mt-1 text-xs text-muted">
                This artisan is an approved seller on LaCraf.
              </p>
            </div>
          )}
          {kycStatus === "REJECTED" && (
            <div className="rounded-2xl border border-error/20 bg-error/5 px-5 py-4">
              <p className="text-sm font-semibold text-error">
                Application rejected
              </p>
              <p className="mt-1 text-xs text-muted">
                The artisan has been notified and can re-upload documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
