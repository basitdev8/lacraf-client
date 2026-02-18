"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import type {
  ArtisanListItem,
  ArtisansListResponse,
  ArtisanFilter,
  KycStatusValue,
} from "@/lib/admin-types";

const FILTERS: { value: ArtisanFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "under-review", label: "Under Review" },
  { value: "pending-review", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "blocked", label: "Blocked" },
];

function statusBadge(artisan: ArtisanListItem) {
  if (!artisan.isActive) {
    return (
      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
        Blocked
      </span>
    );
  }
  const status = artisan.kyc?.status;
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-[#f2f2f2] px-2.5 py-0.5 text-xs font-semibold text-muted">
        No KYC
      </span>
    );
  }
  const map: Record<
    KycStatusValue,
    { bg: string; text: string; label: string }
  > = {
    PENDING: {
      bg: "bg-[#f2f2f2]",
      text: "text-muted",
      label: "Pending",
    },
    UNDER_REVIEW: {
      bg: "bg-brand-light",
      text: "text-brand-dark",
      label: "Under Review",
    },
    APPROVED: {
      bg: "bg-success/10",
      text: "text-success",
      label: "Approved",
    },
    REJECTED: {
      bg: "bg-error/10",
      text: "text-error",
      label: "Rejected",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    HANDICRAFT: "Handicraft",
    HANDLOOM: "Handloom",
    EDIBLES: "Edibles",
  };
  return (
    <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted">
      {map[cat] ?? cat}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArtisansInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filter, setFilter] = useState<ArtisanFilter>(
    (searchParams.get("filter") as ArtisanFilter) || "all"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ArtisansListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number | undefined> = {
        filter,
        page,
        limit: 20,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      const result = await adminApi.get<ArtisansListResponse>(
        "/admin/artisans",
        params
      );
      setData(result);
    } catch {
      setError("Failed to load artisans");
    } finally {
      setLoading(false);
    }
  }, [filter, page, debouncedSearch]);

  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    const qs = params.toString();
    router.replace(`/admin/artisans${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filter, debouncedSearch, router]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Artisans</h1>
        <p className="mt-1 text-sm text-muted">
          Manage artisan accounts and review onboarding applications
        </p>
      </div>

      {/* Filters + Search */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.value
                  ? "bg-foreground text-white"
                  : "bg-white border border-border text-muted hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm placeholder:text-muted focus:border-foreground/30 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-error">{error}</div>
        ) : !data || data.artisans.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-muted">No artisans found</p>
            <p className="mt-1 text-xs text-muted">
              Try adjusting your filter or search query
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#fafafa] text-left">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Artisan
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Category
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Shop
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  KYC Status
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Joined
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.artisans.map((artisan) => (
                <tr
                  key={artisan.id}
                  className="group transition-colors hover:bg-[#fafafa]"
                >
                  {/* Artisan */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand-dark">
                        {artisan.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {artisan.fullName}
                        </p>
                        <p className="text-xs text-muted">{artisan.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    {categoryBadge(artisan.category)}
                  </td>

                  {/* Shop */}
                  <td className="px-5 py-4">
                    <p className="text-sm text-foreground">
                      {artisan.shop?.shopName ?? (
                        <span className="text-muted">—</span>
                      )}
                    </p>
                  </td>

                  {/* KYC Status */}
                  <td className="px-5 py-4">{statusBadge(artisan)}</td>

                  {/* Joined */}
                  <td className="px-5 py-4">
                    <p className="text-sm text-muted">
                      {formatDate(artisan.createdAt)}
                    </p>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/artisans/${artisan.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{data.total}</span>{" "}
            artisans
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
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
              Previous
            </button>

            <span className="rounded-lg border border-brand bg-brand-light px-3 py-1.5 text-sm font-semibold text-foreground">
              {page} / {data.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArtisansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      }
    >
      <ArtisansInner />
    </Suspense>
  );
}
