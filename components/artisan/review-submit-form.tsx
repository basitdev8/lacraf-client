"use client";

import { useState } from "react";
import { customerApi } from "@/lib/customer-api";
import type { ReviewItem } from "@/components/artisan/review-list";

interface ReviewSubmitFormProps {
  artisanId: string;
  orderId: string;
  onSuccess: (review: ReviewItem) => void;
}

export function ReviewSubmitForm({ artisanId, orderId, onSuccess }: ReviewSubmitFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await customerApi.post<{ review: ReviewItem; artisan: unknown }>("/reviews", {
        artisanId,
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });

      setDone(true);
      onSuccess(res.review);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to submit review. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-[#d4edda] bg-[#f4faf5] px-5 py-4">
        <p className="text-[11px] tracking-[0.08em] text-[#2d6a4f]">
          Thank you — your review has been submitted.
        </p>
      </div>
    );
  }

  const display = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="border border-[#e8e6e3] p-5 space-y-4">
      <p className="text-[9px] tracking-[0.3em] text-[#9a9a9a] uppercase">
        Leave a Review
      </p>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${i} star${i !== 1 ? "s" : ""}`}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={i <= display ? "#c9a400" : "#e8e6e3"}
                stroke={i <= display ? "#c9a400" : "#d0cdc8"}
                strokeWidth="1"
              />
            </svg>
          </button>
        ))}
        {display > 0 && (
          <span className="text-[9px] tracking-[0.1em] text-[#8a8a8a] ml-2">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][display]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Share your experience (optional)"
        className="w-full text-[12px] text-[#0a0a0a] border border-[#e0e0e0] px-3 py-2.5 resize-none focus:outline-none focus:border-[#0a0a0a] placeholder:text-[#b0b0b0] transition-colors"
      />

      {error && (
        <p className="text-[10px] text-[#c0392b] tracking-[0.05em]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || rating < 1}
        className="text-[9px] tracking-[0.2em] border border-[#0a0a0a] bg-[#0a0a0a] text-white px-8 py-2.5 hover:bg-white hover:text-[#0a0a0a] transition-colors disabled:opacity-40 uppercase"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
