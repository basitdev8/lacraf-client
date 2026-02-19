"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Product, ProductsListResponse, ProductStatus } from "@/lib/types";

const STATUS_FILTERS: { label: string; value: ProductStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "DRAFT" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Live", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, { cls: string; label: string }> = {
    DRAFT: { cls: "bg-[#f2f2f2] text-muted", label: "Draft" },
    UNDER_REVIEW: {
      cls: "bg-brand-light text-brand-dark",
      label: "Under Review",
    },
    APPROVED: { cls: "bg-success/10 text-success", label: "Live" },
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

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam =
    (searchParams.get("status") as ProductStatus | "all") ?? "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [error, setError] = useState("");

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
        const res = await api.getWithParams<ProductsListResponse>(
          "/products",
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
    [statusParam]
  );

  useEffect(() => {
    setPage(1);
    load(1);
  }, [statusParam, load]);

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.push(`/seller/products?${params.toString()}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft product?")) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  async function handlePublish(id: string) {
    setPublishing(id);
    try {
      await api.post(`/products/${id}/publish`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "UNDER_REVIEW" } : p))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
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

      {/* Status filter tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-white p-1 w-fit flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              statusParam === f.value
                ? "bg-brand-light text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
            <svg
              className="h-6 w-6 text-brand-dark"
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
            {statusParam === "all"
              ? "Add your first product to start selling."
              : `No ${statusParam.toLowerCase().replace("_", " ")} products.`}
          </p>
          {statusParam === "all" && (
            <Link
              href="/seller/products/new"
              className="btn-brand mt-5 text-sm"
            >
              Add Product
            </Link>
          )}
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
                  Category
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Status
                </th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted md:table-cell">
                  Added
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#fafafa]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-[#f7f7f7]">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0].secureUrl}
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
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.title}</p>
                        {product.status === "REJECTED" &&
                          product.rejectionReason && (
                            <p className="mt-0.5 truncate text-xs text-error">
                              {product.rejectionReason}
                            </p>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-muted sm:table-cell">
                    {product.subcategory?.name ?? product.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-muted md:table-cell">
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(product.status === "DRAFT" ||
                        product.status === "REJECTED") && (
                        <Link
                          href={`/seller/products/${product.id}/edit`}
                          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-[#f7f7f7]"
                        >
                          Edit
                        </Link>
                      )}
                      {(product.status === "DRAFT" ||
                        product.status === "REJECTED") && (
                        <button
                          onClick={() => handlePublish(product.id)}
                          disabled={publishing === product.id}
                          className="rounded-lg border border-brand bg-brand-light px-3 py-1.5 text-xs font-medium text-brand-dark hover:bg-brand/20 disabled:opacity-50"
                        >
                          {publishing === product.id
                            ? "Submitting..."
                            : "Submit for Review"}
                        </button>
                      )}
                      {product.status === "DRAFT" && (
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="rounded-lg border border-error/20 bg-error/5 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-50"
                        >
                          {deleting === product.id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted">
                Page {page} of {totalPages}
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
