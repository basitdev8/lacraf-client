"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface PublicProduct {
  id: string;
  title: string;
  status: string;
  images: Array<{
    id: string;
    url: string;
    publicId?: string;
    isDefault?: boolean;
  }>;
  variants: Array<{
    id: string;
    price: number;
    isDefault?: boolean;
    stock: number;
  }>;
  shop?: { shopName: string };
  category?: { name: string; slug: string };
  subcategory?: { name: string; slug: string };
  hasGiCertificate?: boolean;
}

interface ProductsResponse {
  products: PublicProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchPublicProducts(params: {
  categorySlug?: string;
  subcategorySlug?: string;
  page: number;
  limit: number;
}): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  if (params.categorySlug) qs.set("categorySlug", params.categorySlug);
  if (params.subcategorySlug) qs.set("subcategorySlug", params.subcategorySlug);
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));

  // Public browse endpoint — returns APPROVED products visible to all visitors.
  // Backend: GET /api/v1/products/browse
  const res = await fetch(`${API_BASE}/products/browse?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { products: [], total: 0, page: 1, limit: params.limit, totalPages: 0 };
  }

  const json = await res.json();
  const data = json.data ?? json;
  return {
    products: data.products ?? data.items ?? [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? params.limit,
    totalPages: data.totalPages ?? 0,
  };
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function getDefaultPrice(variants: PublicProduct["variants"]): number | null {
  if (!variants || variants.length === 0) return null;
  const def = variants.find((v) => v.isDefault) ?? variants[0];
  return def.price;
}

function getDefaultImage(images: PublicProduct["images"]): string | null {
  if (!images || images.length === 0) return null;
  const def = images.find((i) => i.isDefault) ?? images[0];
  return def.url;
}

function ProductCard({ product }: { product: PublicProduct }) {
  const imageUrl = getDefaultImage(product.images);
  const price = getDefaultPrice(product.variants);

  return (
    <Link href={`/shop/product/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative w-full bg-[#d4d0cb] overflow-hidden aspect-[3/4]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // Placeholder matching the screenshot gray
          <div className="absolute inset-0 bg-[#c8c4bd]" />
        )}
        {product.hasGiCertificate && (
          <span className="absolute top-2.5 left-2.5 text-[8px] tracking-[0.15em] bg-white text-[#0a0a0a] px-2 py-0.5">
            GI TAGGED
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        <p className="text-[10px] tracking-[0.18em] text-[#0a0a0a] leading-snug uppercase font-light">
          {product.title}
        </p>
        {price !== null && (
          <p className="text-[10px] tracking-[0.06em] text-[#0a0a0a]">
            {formatPrice(price)}
          </p>
        )}
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full bg-[#e8e5e0] aspect-[3/4]" />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-2 bg-[#e8e5e0] w-3/4" />
        <div className="h-2 bg-[#e8e5e0] w-1/3" />
      </div>
    </div>
  );
}

interface ProductGridProps {
  categorySlug: string;
  subcategorySlug?: string;
}

const PAGE_SIZE = 12;

export default function ProductGrid({
  categorySlug,
  subcategorySlug,
}: ProductGridProps) {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadProducts = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const result = await fetchPublicProducts({
        categorySlug,
        subcategorySlug,
        page: pageNum,
        limit: PAGE_SIZE,
      });

      setProducts((prev) =>
        replace ? result.products : [...prev, ...result.products]
      );
      setTotal(result.total);
      setPage(pageNum);

      if (replace) setLoading(false);
      else setLoadingMore(false);
    },
    [categorySlug, subcategorySlug]
  );

  // Reload from page 1 when filters change
  useEffect(() => {
    loadProducts(1, true);
  }, [loadProducts]);

  const hasMore = products.length < total;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[11px] tracking-[0.2em] text-[#8a8a8a]">
          NO PRODUCTS FOUND
        </p>
        <p className="text-xs text-[#b0b0b0] mt-2">
          Check back soon — new pieces are being added.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => loadProducts(page + 1, false)}
            disabled={loadingMore}
            className="text-[10px] tracking-[0.2em] border border-[#e0e0e0] px-10 py-3 hover:border-[#0a0a0a] transition-colors disabled:opacity-40"
          >
            {loadingMore ? "LOADING..." : "SHOW MORE"}
          </button>
        </div>
      )}
    </div>
  );
}
