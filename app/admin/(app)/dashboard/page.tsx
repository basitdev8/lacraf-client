"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/admin-api";
import type { DashboardStats } from "@/lib/admin-types";

interface StatCard {
  key: keyof DashboardStats;
  label: string;
  description: string;
  accent: string;
  textColor: string;
  filterHref?: string;
}

const statCards: StatCard[] = [
  {
    key: "totalArtisans",
    label: "Total Artisans",
    description: "Registered on the platform",
    accent: "border-border bg-white",
    textColor: "text-foreground",
    filterHref: "/admin/artisans?filter=all",
  },
  {
    key: "pendingReview",
    label: "Pending Review",
    description: "Awaiting admin action",
    accent: "border-brand/25 bg-brand-light/60",
    textColor: "text-foreground",
    filterHref: "/admin/artisans?filter=under-review",
  },
  {
    key: "approved",
    label: "Approved",
    description: "Active sellers",
    accent: "border-success/20 bg-success/5",
    textColor: "text-success",
    filterHref: "/admin/artisans?filter=approved",
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "KYC or documents declined",
    accent: "border-error/20 bg-error/5",
    textColor: "text-error",
    filterHref: "/admin/artisans?filter=rejected",
  },
  {
    key: "blocked",
    label: "Blocked",
    description: "Suspended accounts",
    accent: "border-orange-200 bg-orange-50",
    textColor: "text-orange-600",
    filterHref: "/admin/artisans?filter=blocked",
  },
  {
    key: "newThisWeek",
    label: "New This Week",
    description: "Joined in the last 7 days",
    accent: "border-blue-200 bg-blue-50",
    textColor: "text-blue-600",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .get<DashboardStats>("/admin/dashboard")
      .then(setStats)
      .catch(() => setError("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Platform overview — artisan onboarding and verification
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const value = stats?.[card.key] ?? 0;
          const inner = (
            <div
              className={`rounded-2xl border p-6 transition-shadow hover:shadow-sm ${card.accent}`}
            >
              <p
                className={`text-4xl font-bold tabular-nums ${card.textColor} ${loading ? "text-muted/30" : ""}`}
              >
                {loading ? "—" : value}
              </p>
              <p className="mt-2 font-medium text-foreground">{card.label}</p>
              <p className="mt-0.5 text-xs text-muted">{card.description}</p>
            </div>
          );

          if (card.filterHref && !loading) {
            return (
              <Link
                key={card.key}
                href={card.filterHref}
                className="block"
              >
                {inner}
              </Link>
            );
          }
          return <div key={card.key}>{inner}</div>;
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/artisans?filter=under-review"
            className="flex items-center gap-2 rounded-xl border border-brand/25 bg-brand-light px-4 py-3 text-sm font-medium transition-shadow hover:shadow-sm"
          >
            <svg
              className="h-4 w-4 text-brand-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Review Pending Applications
            {stats?.pendingReview ? (
              <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs font-bold">
                {stats.pendingReview}
              </span>
            ) : null}
          </Link>

          <Link
            href="/admin/artisans"
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium transition-shadow hover:shadow-sm"
          >
            <svg
              className="h-4 w-4 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            View All Artisans
          </Link>
        </div>
      </div>
    </div>
  );
}
