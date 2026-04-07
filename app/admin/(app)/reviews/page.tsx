"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  artisanId: string;
  artisan?: { id: string; fullName: string; trustScore: number; trustUpdatedAt: string | null };
  customer?: { id: string; fullName: string };
}

interface ReviewsResponse {
  data: AdminReview[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= rating ? "#c9a400" : "#e8e6e3"}
            stroke={i <= rating ? "#c9a400" : "#d0cdc8"}
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const loadReviews = useCallback(async (p: number) => {
    setLoading(true);
    try {
      // Fetch all reviews for all artisans via public endpoint + admin enrichment
      // Admin has access to GET /reviews/artisan/:id — we use a dedicated admin list
      // For now, fetch from all visible + hidden reviews via the admin reviews endpoint
      const res = await fetch(
        `${API_BASE}/admin/reviews?page=${p}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminAccessToken")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to load reviews");
      const json = await res.json();
      const data: ReviewsResponse = json.data ?? json;
      setReviews(data.data ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? p);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  async function handleFlag(reviewId: string) {
    setActioning(reviewId);
    try {
      await adminApi.patch(`/admin/reviews/${reviewId}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isVisible: false } : r))
      );
    } catch {
      // Silently ignore — review row remains visible so admin can retry
    } finally {
      setActioning(null);
    }
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl tracking-[0.04em] text-[#0a0a0a] font-light">
            Review Moderation
          </h1>
          <p className="text-[11px] text-[#8a8a8a] mt-1">
            {total} total reviews
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#f5f4f0] animate-pulse rounded" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[11px] tracking-[0.2em] text-[#9a9a9a]">NO REVIEWS YET</p>
        </div>
      ) : (
        <div className="border border-[#e8e6e3]">
          {/* Table head */}
          <div className="grid grid-cols-[1fr_1fr_80px_120px_80px_80px] gap-4 px-4 py-2.5 bg-[#f5f4f0] border-b border-[#e8e6e3]">
            {["Artisan", "Customer", "Rating", "Comment", "Date", "Action"].map((h) => (
              <span key={h} className="text-[8px] tracking-[0.2em] text-[#9a9a9a] uppercase">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`grid grid-cols-[1fr_1fr_80px_120px_80px_80px] gap-4 px-4 py-3.5 border-b border-[#f0eeeb] last:border-b-0 items-center ${
                !r.isVisible ? "opacity-50" : ""
              }`}
            >
              <div>
                <p className="text-[11px] tracking-[0.04em] text-[#0a0a0a]">
                  {r.artisan?.fullName ?? r.artisanId.slice(0, 8) + "…"}
                </p>
                {r.artisan?.trustUpdatedAt && (
                  <p className="text-[9px] text-[#9a9a9a] mt-0.5">
                    Score updated {formatDate(r.artisan.trustUpdatedAt)}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-[#3a3a3a]">
                {r.customer?.fullName ?? "—"}
              </p>

              <StarRow rating={r.rating} />

              <p className="text-[10px] text-[#5a5a5a] truncate">
                {r.comment ?? <span className="text-[#b0b0b0] italic">No comment</span>}
              </p>

              <p className="text-[9px] text-[#9a9a9a]">{formatDate(r.createdAt)}</p>

              <div>
                {!r.isVisible ? (
                  <span className="text-[8px] tracking-[0.1em] text-[#9a9a9a] uppercase">
                    Removed
                  </span>
                ) : (
                  <button
                    onClick={() => handleFlag(r.id)}
                    disabled={actioning === r.id}
                    className="text-[8px] tracking-[0.12em] border border-[#e8313120] bg-[#e8313108] text-[#c0392b] px-2.5 py-1 hover:bg-[#e8313120] transition-colors disabled:opacity-40 uppercase"
                  >
                    {actioning === r.id ? "…" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-[10px] text-[#9a9a9a]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => loadReviews(page - 1)}
              disabled={page <= 1 || loading}
              className="text-[9px] tracking-[0.15em] border border-[#e0e0e0] px-4 py-2 hover:border-[#0a0a0a] transition-colors disabled:opacity-40"
            >
              PREV
            </button>
            <button
              onClick={() => loadReviews(page + 1)}
              disabled={page >= totalPages || loading}
              className="text-[9px] tracking-[0.15em] border border-[#e0e0e0] px-4 py-2 hover:border-[#0a0a0a] transition-colors disabled:opacity-40"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
