"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import type {
  AdminProductDetail,
  ProductStatus,
  ProductReviewResponse,
} from "@/lib/admin-types";

type ReviewMode = "idle" | "approve" | "reject";

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, { cls: string; label: string }> = {
    DRAFT: { cls: "bg-[#f2f2f2] text-muted", label: "Draft" },
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
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review state
  const [reviewMode, setReviewMode] = useState<ReviewMode>("idle");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = await adminApi.get<AdminProductDetail>(`/admin/products/${id}`);
      setProduct(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(decision: "APPROVED" | "REJECTED") {
    if (!product) return;
    if (decision === "REJECTED" && !reason.trim()) {
      setReviewError("A rejection reason is required.");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      const res = await adminApi.post<ProductReviewResponse>(
        `/admin/products/${product.id}/review`,
        decision === "APPROVED"
          ? { decision }
          : { decision, reason: reason.trim() }
      );
      setProduct((prev) =>
        prev ? { ...prev, status: res.product.status } : prev
      );
      setReviewSuccess(
        decision === "APPROVED"
          ? "Product approved — it is now live on LaCraf."
          : "Product rejected — the artisan has been notified."
      );
      setReviewMode("idle");
      setReason("");
    } catch (e) {
      setReviewError(
        e instanceof Error ? e.message : "Review submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-medium text-error">{error || "Product not found"}</p>
        <Link
          href="/admin/products"
          className="mt-4 text-sm text-muted underline underline-offset-2"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Products
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{product.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={product.status} />
              {product.category && (
                <span className="text-xs text-muted">
                  {product.category.name}
                  {product.subcategory ? ` → ${product.subcategory.name}` : ""}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-muted shrink-0">
            <p>
              Listed{" "}
              {new Date(product.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Review success */}
      {reviewSuccess && (
        <div className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          {reviewSuccess}
        </div>
      )}

      {/* Rejection reason (if rejected) */}
      {product.status === "REJECTED" && product.rejectionReason && (
        <div className="rounded-xl border border-error/15 bg-error/5 p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-error/70">
            Rejection Reason
          </p>
          <p className="mt-1 text-sm">{product.rejectionReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — main details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Product Info */}
          <Section title="Product Details">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Title
                </dt>
                <dd className="mt-1 font-medium">{product.title}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Description
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  {product.description}
                </dd>
              </div>
            </dl>
          </Section>

          {/* Attributes */}
          {product.attributes?.length > 0 && (
            <Section title="Attributes">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {product.attributes.map((a) => (
                  <div key={a.key}>
                    <dt className="text-xs text-muted">{a.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {/* Images */}
          <Section title={`Images (${product.images?.length ?? 0})`}>
            {product.images?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.images.map((img, index) => (
                  <a
                    key={img.id}
                    href={img.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.secureUrl}
                      alt="product"
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                    />
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white uppercase tracking-wider">
                        Main
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No images uploaded.</p>
            )}
          </Section>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <Section title={`Variants (${product.variants.length})`}>
              <div className="divide-y divide-border">
                {product.variants.map((v) => (
                  <div key={v.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{v.label}</span>
                        {v.isDefault && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-right">
                        <span className="font-medium">
                          {(() => { const p = Number(v.price); return isNaN(p) ? "₹—" : `₹${p.toLocaleString("en-IN")}`; })()}
                        </span>
                        <span className="ml-3 text-muted">{v.stock} in stock</span>
                      </div>
                    </div>
                    {v.attributes?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {v.attributes.map((a) => (
                          <span
                            key={a.key}
                            className="rounded-lg bg-[#f7f7f7] px-2.5 py-1 text-xs"
                          >
                            {a.label}: {a.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right column — artisan + review */}
        <div className="space-y-6">
          {/* Artisan Info */}
          <Section title="Artisan">
            {product.artisan ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold">
                    {product.artisan.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">
                      {product.artisan.fullName}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {product.artisan.email}
                    </p>
                  </div>
                </div>
                {product.shop && (
                  <div className="rounded-xl bg-[#f7f7f7] px-3 py-2 text-xs">
                    <span className="text-muted">Shop: </span>
                    <span className="font-medium">{product.shop.shopName}</span>
                  </div>
                )}
                <Link
                  href={`/admin/artisans/${product.artisan.id}`}
                  className="inline-flex text-xs text-brand-dark underline underline-offset-2"
                >
                  View artisan profile →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">No artisan data.</p>
            )}
          </Section>

          {/* Review Panel */}
          {product.status === "UNDER_REVIEW" && (
            <Section title="Review Decision">
              {reviewError && (
                <p className="mb-4 rounded-xl border border-error/20 bg-error/5 px-3 py-2.5 text-sm text-error">
                  {reviewError}
                </p>
              )}

              {reviewMode === "idle" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    Review this product and decide whether to approve or reject
                    it.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setReviewMode("approve");
                        setReviewError("");
                      }}
                      className="flex-1 rounded-xl border-2 border-success/30 bg-success/5 py-2.5 text-sm font-semibold text-success transition-colors hover:bg-success/10"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setReviewMode("reject");
                        setReviewError("");
                      }}
                      className="flex-1 rounded-xl border-2 border-error/30 bg-error/5 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {reviewMode === "approve" && (
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-success/30 bg-success/5 p-3 text-center">
                    <p className="text-sm font-semibold text-success">
                      Approve this product?
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      It will go live on LaCraf immediately.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                      Note for artisan (optional)
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                      rows={3}
                      placeholder="Great product! Welcome to LaCraf."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={1000}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReviewMode("idle");
                        setReason("");
                        setReviewError("");
                      }}
                      className="flex-1 rounded-xl border border-border py-2 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview("APPROVED")}
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-success py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {submitting ? "Approving..." : "Confirm Approve"}
                    </button>
                  </div>
                </div>
              )}

              {reviewMode === "reject" && (
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-error/30 bg-error/5 p-3 text-center">
                    <p className="text-sm font-semibold text-error">
                      Reject this product?
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      The artisan can edit and resubmit after rejection.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                      Rejection Reason *
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-error"
                      rows={4}
                      placeholder="Describe why the product is being rejected and what needs to be fixed…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={1000}
                    />
                    <p className="mt-1 text-right text-xs text-muted">
                      {reason.length}/1000
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReviewMode("idle");
                        setReason("");
                        setReviewError("");
                      }}
                      className="flex-1 rounded-xl border border-border py-2 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview("REJECTED")}
                      disabled={submitting || !reason.trim()}
                      className="flex-1 rounded-xl bg-error py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {submitting ? "Rejecting..." : "Confirm Reject"}
                    </button>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Already reviewed notice */}
          {(product.status === "APPROVED" || product.status === "REJECTED") && (
            <Section title="Review Status">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded-full ${
                    product.status === "APPROVED"
                      ? "bg-success"
                      : "bg-error"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">
                    {product.status === "APPROVED"
                      ? "Product is live"
                      : "Product was rejected"}
                  </p>
                  {product.status === "REJECTED" &&
                    product.rejectionReason && (
                      <p className="mt-1 text-xs text-muted">
                        {product.rejectionReason}
                      </p>
                    )}
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
