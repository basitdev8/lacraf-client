"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrustBadge } from "@/components/store/trust-badge";
import { StarDisplay } from "@/components/store/star-display";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export type ProductType = "FINISHED" | "RAW" | "SEMI_FINISHED";
export type ProductionStage = "WOOL_COLLECTION" | "CLEANING" | "SPINNING" | "WEAVING" | "DYEING" | "EMBROIDERY" | "FINISHING" | "OTHER";

export interface StorefrontProduct {
  id: string;
  title: string;
  productType?: ProductType;
  productionStage?: ProductionStage | null;
  supplierType?: string;
  isMadeToOrder: boolean;
  leadTimeDays: number | null;
  images: Array<{
    id: string;
    publicId: string;
    secureUrl: string;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    label: string;
    price: number;
    stock: number;
    isDefault: boolean;
  }>;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  artisan: {
    id: string;
    shop: { shopName: string } | null;
    trustScore?: number | null;
    trustTier?: "NONE" | "BRONZE" | "SILVER" | "GOLD" | null;
    isUnrated?: boolean;
    reviewCount?: number;
    averageRating?: number | null;
    businessCertApproved?: boolean;
    govRecognizedApproved?: boolean;
  } | null;
}

interface ProductsResponse {
  products: StorefrontProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchStorefrontProducts(params: {
  categoryId?: string;
  subcategoryId?: string;
  page: number;
  limit: number;
  trustTier?: string;
  sort?: string;
  order?: string;
  productType?: string;
  productionStage?: string;
}): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.subcategoryId) qs.set("subcategoryId", params.subcategoryId);
  if (params.trustTier) qs.set("trustTier", params.trustTier);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  if (params.productType) qs.set("productType", params.productType);
  if (params.productionStage) qs.set("productionStage", params.productionStage);
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));

  try {
    const res = await fetch(
      `${API_BASE}/storefront/products?${qs.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return { products: [], total: 0, page: 1, limit: params.limit, totalPages: 0 };
    }
    const json = await res.json();
    const data = json.data ?? json;
    return {
      products: data.products ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? params.limit,
      totalPages: data.totalPages ?? 0,
    };
  } catch {
    return { products: [], total: 0, page: 1, limit: params.limit, totalPages: 0 };
  }
}

function formatPrice(price: number): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function getDefaultPrice(variants: StorefrontProduct["variants"]): number | null {
  if (!variants?.length) return null;
  const def = variants.find((v) => v.isDefault) ?? variants[0];
  const p = Number(def.price);
  return isNaN(p) ? null : p;
}

function ProductCard({ product }: { product: StorefrontProduct }) {
  const imageUrl = product.images?.[0]?.secureUrl ?? null;
  const price = getDefaultPrice(product.variants);
  const shopName = product.artisan?.shop?.shopName;
  const artisan = product.artisan;

  return (
    <Link href={`/shop/product/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative w-full bg-[#c8c4bd] overflow-hidden aspect-[3/4]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-[#c8c4bd]" />
        )}
        {product.isMadeToOrder && (
          <span className="absolute top-2.5 left-2.5 text-[8px] tracking-[0.15em] bg-white text-[#0a0a0a] px-2 py-0.5">
            MADE TO ORDER
          </span>
        )}
        {product.productType === "RAW" && (
          <span className="absolute top-2.5 right-2.5 text-[7px] tracking-[0.15em] bg-[#e8f4e8] text-[#3a7a3a] px-2 py-0.5">
            RAW MATERIAL
          </span>
        )}
        {product.productType === "SEMI_FINISHED" && (
          <span className="absolute top-2.5 right-2.5 text-[7px] tracking-[0.15em] bg-[#f4eee8] text-[#7a5a3a] px-2 py-0.5">
            SEMI-FINISHED
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        {shopName && (
          <p className="text-[8px] tracking-[0.18em] text-[#8a8a8a] uppercase">
            {shopName}
          </p>
        )}
        <p className="text-[10px] tracking-[0.18em] text-[#0a0a0a] leading-snug uppercase font-light">
          {product.title}
        </p>
        {price !== null && (
          <p className="text-[10px] tracking-[0.06em] text-[#0a0a0a]">
            {formatPrice(price)}
          </p>
        )}
        {/* Trust tier badge + star rating */}
        {artisan && (
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <TrustBadge tier={artisan.trustTier ?? "NONE"} size="sm" />
            {!artisan.isUnrated &&
              artisan.averageRating != null &&
              artisan.reviewCount != null &&
              artisan.reviewCount > 0 && (
                <StarDisplay
                  rating={artisan.averageRating}
                  count={artisan.reviewCount}
                  showCount
                  size="sm"
                />
              )}
          </div>
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
  categoryId?: string;
  subcategoryId?: string;
  trustTier?: string;
  sort?: string;
  order?: string;
  productType?: string;
  productionStage?: string;
}

const PAGE_SIZE = 12;

export default function ProductGrid({ categoryId, subcategoryId, trustTier, sort, order, productType, productionStage }: ProductGridProps) {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadProducts = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const result = await fetchStorefrontProducts({
        categoryId,
        subcategoryId,
        trustTier,
        sort,
        order,
        productType,
        productionStage,
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
    [categoryId, subcategoryId, trustTier, sort, order, productType, productionStage]
  );

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
