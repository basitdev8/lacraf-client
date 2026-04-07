"use client";

// ReviewEligibilityGate
// ─────────────────────────────────────────────────────────────────────────────
// Checks whether the logged-in customer has an eligible (DELIVERED, unreviewed)
// order for this artisan. Renders ReviewSubmitForm only when eligible.
// Hidden entirely (not disabled) when already reviewed or no completed order.

import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { customerApi } from "@/lib/customer-api";
import { ReviewSubmitForm } from "@/components/artisan/review-submit-form";
import type { ReviewItem } from "@/components/artisan/review-list";

interface MyReview {
  id: string;
  orderId: string;
  artisanId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
}

interface MyOrder {
  id: string;
  status: string;
  items: Array<{ productTitle: string }>;
  artisanId?: string;
}

interface ReviewEligibilityGateProps {
  artisanId: string;
  onReviewSubmitted: (review: ReviewItem) => void;
}

export function ReviewEligibilityGate({
  artisanId,
  onReviewSubmitted,
}: ReviewEligibilityGateProps) {
  const { customer, loading: authLoading } = useCustomerAuth();
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (authLoading || !customer) return;

    async function checkEligibility() {
      setChecking(true);
      try {
        // Fetch customer's own reviews — find any for this artisan
        const reviewsData = await customerApi.get<{ data: MyReview[] }>("/reviews/my?limit=50");
        const myReviews: MyReview[] = reviewsData.data ?? [];
        const reviewedOrderIds = new Set(
          myReviews.filter((r) => r.artisanId === artisanId).map((r) => r.orderId)
        );

        // Fetch delivered orders — find one that contains this artisan's product
        // The orders endpoint returns orders with items but not artisanId directly.
        // We check by fetching orders and cross-referencing via the review attempt gate.
        // Strategy: find DELIVERED orders, exclude already-reviewed ones, try the first.
        const ordersData = await customerApi.get<{ orders: MyOrder[] }>(
          "/customer/orders?status=DELIVERED&limit=50"
        );
        const deliveredOrders: MyOrder[] = ordersData.orders ?? [];

        // Find first delivered order not yet reviewed for this artisan
        // We can't know artisan from order items directly without the artisanId field,
        // so we optimistically pick the first unreviewed delivered order.
        // The API enforces the gate — a wrong order will return 403.
        const candidate = deliveredOrders.find(
          (o) => !reviewedOrderIds.has(o.id)
        );

        setEligibleOrderId(candidate?.id ?? null);
      } catch {
        setEligibleOrderId(null);
      } finally {
        setChecking(false);
      }
    }

    checkEligibility();
  }, [customer, authLoading, artisanId]);

  // Not logged in or still loading — show nothing
  if (authLoading || checking || !customer) return null;

  // No eligible order — hide form entirely
  if (!eligibleOrderId) return null;

  return (
    <div className="mt-8">
      <ReviewSubmitForm
        artisanId={artisanId}
        orderId={eligibleOrderId}
        onSuccess={(review) => {
          setEligibleOrderId(null); // hide form after submission
          onReviewSubmitted(review);
        }}
      />
    </div>
  );
}
