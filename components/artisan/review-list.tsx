"use client";

import { useState } from "react";
import { StarDisplay } from "@/components/store/star-display";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { id: string; fullName: string } | null;
}

interface ReviewListProps {
  artisanId: string;
  initialReviews: ReviewItem[];
  initialTotal: number;
  pageSize?: number;
}

// ── Relative time ──────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1");

// ── ReviewList ─────────────────────────────────────────────────────────────

export function ReviewList({
  artisanId,
  initialReviews,
  initialTotal,
  pageSize = 5,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const qs = new URLSearchParams({
        page: String(nextPage),
        limit: String(pageSize),
      });
      const res = await fetch(
        `${API_BASE}/reviews/artisan/${artisanId}?${qs}`
      );
      if (res.ok) {
        const data = await res.json();
        const newItems: ReviewItem[] = data.data ?? [];
        setReviews((prev) => [...prev, ...newItems]);
        setTotal(data.total ?? total);
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
    }
  }

  if (reviews.length === 0) {
    return (
      <p className="text-[11px] tracking-[0.1em] text-[#9a9a9a] py-6">
        No reviews yet.
      </p>
    );
  }

  return (
    <div>
      <div className="divide-y divide-[#f0eeeb]">
        {reviews.map((r) => (
          <div key={r.id} className="py-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-[11px] tracking-[0.08em] text-[#0a0a0a] font-medium">
                  {r.customer?.fullName ?? "Anonymous"}
                </p>
                <StarDisplay rating={r.rating} showCount={false} size="sm" />
              </div>
              <span className="text-[9px] tracking-[0.08em] text-[#9a9a9a] shrink-0">
                {relativeTime(r.createdAt)}
              </span>
            </div>
            {r.comment && (
              <p className="text-[12px] leading-[1.7] text-[#5a5a5a] tracking-[0.02em]">
                {r.comment}
              </p>
            )}
          </div>
        ))}
      </div>

      {reviews.length < total && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-6 text-[9px] tracking-[0.2em] border border-[#e0e0e0] px-8 py-2.5 hover:border-[#0a0a0a] transition-colors disabled:opacity-40 uppercase"
        >
          {loading ? "Loading..." : `Show More (${total - reviews.length} remaining)`}
        </button>
      )}
    </div>
  );
}
