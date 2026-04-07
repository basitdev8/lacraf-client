"use client";

import { useState } from "react";
import { ReviewList, ReviewItem } from "@/components/artisan/review-list";
import { ReviewEligibilityGate } from "@/components/artisan/review-eligibility-gate";
import { StarDisplay } from "@/components/store/star-display";

interface ArtisanReviewSectionProps {
  artisanId: string;
  initialReviews: ReviewItem[];
  initialTotal: number;
  isUnrated: boolean;
  averageRating: number | null;
}

export function ArtisanReviewSection({
  artisanId,
  initialReviews,
  initialTotal,
  isUnrated,
  averageRating,
}: ArtisanReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [total, setTotal] = useState(initialTotal);

  function handleNewReview(review: ReviewItem) {
    // Optimistically prepend the new review
    setReviews((prev) => [review, ...prev]);
    setTotal((t) => t + 1);
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase">
          Customer Reviews
          {total > 0 && (
            <span className="ml-2 text-[#b0b0b0]">({total})</span>
          )}
        </p>
        {!isUnrated && averageRating != null && (
          <StarDisplay rating={averageRating} count={total} showCount size="sm" />
        )}
      </div>

      {/* Eligibility gate — renders ReviewSubmitForm only when eligible */}
      <ReviewEligibilityGate
        artisanId={artisanId}
        onReviewSubmitted={handleNewReview}
      />

      <div className="mt-6">
        <ReviewList
          artisanId={artisanId}
          initialReviews={reviews}
          initialTotal={total}
        />
      </div>
    </section>
  );
}
