"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "@/lib/customer-api";
import type { Order, OrderStatus } from "@/lib/customer-types";

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  CRAFTING: "bg-purple-50 text-purple-700 border-purple-200",
  PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SHIPPED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
};

const PROGRESS_STEPS: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

function getProgressIndex(status: OrderStatus): number {
  const idx = PROGRESS_STEPS.indexOf(status);
  if (status === "CRAFTING") return 1;
  return idx;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    customerApi
      .get<{ order: Order }>(`/orders/${id}`)
      .then((data) => setOrder(data.order))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load order")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const canCancel =
    order &&
    (order.status === "CONFIRMED" || order.status === "PENDING_PAYMENT");

  const handleCancel = async () => {
    if (!order || !canCancel) return;
    setCancelling(true);
    try {
      await customerApi.post(`/orders/${order.id}/cancel`);
      setOrder({ ...order, status: "CANCELLED" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-error">{error || "Order not found"}</p>
        <Link
          href="/account/orders"
          className="mt-3 inline-block text-sm font-medium text-brand-dark hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const progressIdx = getProgressIndex(order.status);
  const isCancelledOrRefunded =
    order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <svg
              className="h-3.5 w-3.5"
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
            Back to orders
          </Link>
          <h1 className="text-2xl font-semibold">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            STATUS_COLORS[order.status] || "bg-gray-50 text-gray-700 border-gray-200"
          }`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelledOrRefunded && progressIdx >= 0 && (
        <div className="mb-8 rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between">
            {PROGRESS_STEPS.map((step, i) => {
              const isCompleted = i <= progressIdx;
              const isCurrent = i === progressIdx;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-brand text-foreground"
                          : "border-2 border-border text-muted"
                      }`}
                    >
                      {isCompleted ? (
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
                      ) : (
                        i + 1
                      )}
                    </div>
                    <p
                      className={`mt-2 text-[10px] font-medium uppercase tracking-wider ${
                        isCurrent ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {step.replace(/_/g, " ")}
                    </p>
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        i < progressIdx ? "bg-brand" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-white">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">
                Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium">{item.productTitle}</p>
                    {item.variantLabel && (
                      <p className="mt-0.5 text-xs text-muted">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          {/* Order total */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>
                  {order.shippingFee === 0
                    ? "Free"
                    : `₹${order.shippingFee.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="text-sm font-semibold mb-3">Shipping Address</h2>
              <div className="text-sm text-muted">
                <p className="font-medium text-foreground">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p className="mt-1">{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="text-sm font-semibold mb-2">Notes</h2>
              <p className="text-sm text-muted">{order.notes}</p>
            </div>
          )}

          {/* Cancel button */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full rounded-xl border border-error/30 bg-white px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/5 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
