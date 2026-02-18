"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import type {
  AdminProductListItem,
  AdminProductsListResponse,
  ProductStatus,
} from "@/lib/admin-types";

const STATUS_FILTERS: { label: string; value: ProductStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Draft", value: "DRAFT" },
];

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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam =
    (searchParams.get("status") as ProductStatus | "all") ?? "all";

  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, string | number | undefined> = {
          page: p,
          limit: 20,
        };
        if (statusParam !== "all") params.status = statusParam;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        const res = await adminApi.get<AdminProductsListResponse>(
          "/admin/products",
          params
        );
        setProducts(res.products);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [statusParam, debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
    load(1);
  }, [statusParam, debouncedSearch, load]);

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.push(`/admin/products?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Review and manage artisan product listings
          </p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-white p-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusParam === f.value
                  ? "bg-brand-light text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by title or artisan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-brand sm:w-64"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f2f2]">
            <svg
              className="h-6 w-6 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="font-medium">No products found</p>
          <p className="mt-1 text-sm text-muted">
            {statusParam === "UNDER_REVIEW"
              ? "No products pending review right now."
              : "No products match the current filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Product
                </th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell">
                  Artisan
                </th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted md:table-cell">
                  Category
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Status
                </th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted lg:table-cell">
                  Listed
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#fafafa]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-[#f7f7f7]">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0].url}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg
                              className="h-4 w-4 text-muted"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="font-medium line-clamp-2">{product.title}</p>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <div>
                      <p className="font-medium text-xs">
                        {product.artisan?.fullName ?? "—"}
                      </p>
                      <p className="text-xs text-muted">
                        {product.shop?.shopName ?? ""}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-muted md:table-cell">
                    {product.subcategory?.name ?? product.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-muted lg:table-cell">
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-[#f2f2f2]"
                    >
                      {product.status === "UNDER_REVIEW" ? "Review" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted">
                {total} total · Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPage((p) => p - 1);
                    load(page - 1);
                  }}
                  disabled={page <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setPage((p) => p + 1);
                    load(page + 1);
                  }}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
