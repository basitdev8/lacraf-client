"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import type { Shop, ProductsListResponse } from "@/lib/types";

export default function SellerOverviewPage() {
  const { artisan } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [productCounts, setProductCounts] = useState({
    draft: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.get<Shop>("/shop/me");
        setShop(s);
      } catch {
        /* no shop */
      }
      try {
        const [draft, review, approved, rejected] = await Promise.allSettled([
          api.getWithParams<ProductsListResponse>("/products", {
            status: "DRAFT",
            limit: 1,
          }),
          api.getWithParams<ProductsListResponse>("/products", {
            status: "UNDER_REVIEW",
            limit: 1,
          }),
          api.getWithParams<ProductsListResponse>("/products", {
            status: "APPROVED",
            limit: 1,
          }),
          api.getWithParams<ProductsListResponse>("/products", {
            status: "REJECTED",
            limit: 1,
          }),
        ]);
        setProductCounts({
          draft: draft.status === "fulfilled" ? draft.value.total : 0,
          under_review:
            review.status === "fulfilled" ? review.value.total : 0,
          approved:
            approved.status === "fulfilled" ? approved.value.total : 0,
          rejected:
            rejected.status === "fulfilled" ? rejected.value.total : 0,
        });
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    load();
  }, []);

  const firstName = artisan?.fullName.split(" ")[0] ?? "Artisan";
  const totalListed = productCounts.approved;
  const totalPending = productCounts.under_review;
  const totalDraft = productCounts.draft;
  const totalRejected = productCounts.rejected;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Welcome back,{" "}
            <span className="decoration-brand underline decoration-[3px] underline-offset-4">
              {firstName}
            </span>
          </h1>
          {shop && (
            <p className="mt-1.5 text-sm text-muted">
              Managing{" "}
              <span className="font-medium text-foreground">
                {shop.shopName}
              </span>
            </p>
          )}
        </div>
        <Link href="/seller/products/new" className="btn-brand text-sm">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Live Products",
              value: totalListed,
              color: "text-success",
              bg: "bg-success/5 border-success/15",
              href: "/seller/products?status=APPROVED",
            },
            {
              label: "Under Review",
              value: totalPending,
              color: "text-brand-dark",
              bg: "bg-brand-light border-brand/20",
              href: "/seller/products?status=UNDER_REVIEW",
            },
            {
              label: "Drafts",
              value: totalDraft,
              color: "text-muted",
              bg: "bg-white border-border",
              href: "/seller/products?status=DRAFT",
            },
            {
              label: "Rejected",
              value: totalRejected,
              color: "text-error",
              bg: "bg-error/5 border-error/15",
              href: "/seller/products?status=REJECTED",
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`rounded-2xl border p-5 transition-shadow hover:shadow-sm ${stat.bg}`}
            >
              <p className={`text-3xl font-bold tabular-nums ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted">
                {stat.label}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/seller/products/new"
            className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
              <svg
                className="h-5 w-5 text-brand-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">List a Product</p>
              <p className="text-xs text-muted mt-0.5">
                Add a new craft to your shop
              </p>
            </div>
          </Link>

          <Link
            href="/seller/products"
            className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
              <svg
                className="h-5 w-5 text-brand-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">Manage Products</p>
              <p className="text-xs text-muted mt-0.5">
                Edit, publish or delete listings
              </p>
            </div>
          </Link>

          <Link
            href="/seller/orders"
            className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
              <svg
                className="h-5 w-5 text-brand-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">View Orders</p>
              <p className="text-xs text-muted mt-0.5">
                Track and fulfil customer orders
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Shop Info */}
      {shop && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Your Shop
          </h2>
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{shop.shopName}</p>
                <p className="mt-1 text-sm text-muted">{shop.address}</p>
                {shop.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted">
                    {shop.description}
                  </p>
                )}
              </div>
              <Link
                href="/seller/profile"
                className="shrink-0 text-xs text-brand-dark underline underline-offset-2"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        </div>
      )}
    </div>
  );
}
