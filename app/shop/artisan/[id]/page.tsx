import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TrustBadge, CertBadge } from "@/components/store/trust-badge";
import { StarDisplay } from "@/components/store/star-display";
import { ReviewList, ReviewItem } from "@/components/artisan/review-list";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// ── Types ──────────────────────────────────────────────────────────────────

interface ArtisanShopData {
  shop: {
    shopName: string;
    description: string;
    address: string;
    artisanId: string;
    createdAt: string;
  };
  artisan: {
    id: string;
    fullName: string;
    trustScore: number | null;
    trustTier: "NONE" | "BRONZE" | "SILVER" | "GOLD";
    trustUpdatedAt: string | null;
    isUnrated: boolean;
    reviewCount: number;
    averageRating: number | null;
    businessCertApproved: boolean;
    govRecognizedApproved: boolean;
    reviews: ReviewItem[];
  };
  products: Array<{
    id: string;
    title: string;
    images: Array<{ id: string; secureUrl: string; sortOrder: number }>;
    variants: Array<{ id: string; price: number; stock: number; isDefault: boolean }>;
    category: { id: string; name: string } | null;
  }>;
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchArtisanShop(artisanId: string): Promise<ArtisanShopData | null> {
  try {
    const res = await fetch(`${API_BASE}/storefront/shops/${artisanId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

function formatPrice(price: number) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchArtisanShop(id);

  if (!data) notFound();

  const { shop, artisan, products } = data;

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 pt-5 pb-8 text-[9px] tracking-[0.2em] text-[#8a8a8a]">
        <Link href="/shop" className="hover:text-[#0a0a0a] transition-colors">HOME</Link>
        <span>/</span>
        <span className="text-[#0a0a0a]">{shop.shopName.toUpperCase()}</span>
      </nav>

      {/* ── Artisan header ───────────────────────────────────────── */}
      <div className="border-b border-[#e8e6e3] pb-10 mb-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-3">
              Artisan Atelier
            </p>
            <h1
              className="text-4xl md:text-5xl text-[#0a0a0a] font-light leading-[1.1] mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {shop.shopName}
            </h1>

            {/* Trust + cert badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <TrustBadge tier={artisan.trustTier} size="md" />
              {artisan.businessCertApproved && <CertBadge type="business" size="md" />}
              {artisan.govRecognizedApproved && <CertBadge type="gov" size="md" />}
            </div>

            {/* Trust score + stars */}
            <div className="flex items-center gap-4">
              {artisan.isUnrated ? (
                <span className="text-[10px] tracking-[0.15em] text-[#9a9a9a] uppercase">
                  Unrated
                </span>
              ) : (
                <>
                  {artisan.trustScore != null && (
                    <span className="text-[13px] tracking-[0.05em] text-[#0a0a0a]">
                      {(artisan.trustScore / 10).toFixed(1)}
                      <span className="text-[10px] text-[#9a9a9a]"> / 10</span>
                    </span>
                  )}
                  {artisan.averageRating != null && (
                    <StarDisplay
                      rating={artisan.averageRating}
                      count={artisan.reviewCount}
                      showCount
                      size="md"
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cert tooltip panel */}
          {(artisan.businessCertApproved || artisan.govRecognizedApproved) && (
            <div className="border border-[#e8e6e3] p-5 max-w-xs shrink-0">
              <p className="text-[8px] tracking-[0.25em] text-[#9a9a9a] uppercase mb-3">
                Verified Credentials
              </p>
              {artisan.businessCertApproved && (
                <div className="flex items-start gap-2 mb-2.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.8" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                  </svg>
                  <div>
                    <p className="text-[10px] tracking-[0.06em] text-[#0a0a0a] font-medium">Business Certified</p>
                    <p className="text-[9px] text-[#8a8a8a] leading-snug mt-0.5">
                      Business identity verified by LaCraf — registered entity, KYC-approved.
                    </p>
                  </div>
                </div>
              )}
              {artisan.govRecognizedApproved && (
                <div className="flex items-start gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.8" className="mt-0.5 shrink-0">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div>
                    <p className="text-[10px] tracking-[0.06em] text-[#0a0a0a] font-medium">Gov Recognized</p>
                    <p className="text-[9px] text-[#8a8a8a] leading-snug mt-0.5">
                      Holds GST registration recognized by the Government of India.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {shop.description && (
          <p className="text-[13px] leading-[1.8] text-[#5a5a5a] tracking-[0.02em] max-w-2xl mt-8">
            {shop.description}
          </p>
        )}
      </div>

      {/* ── Products ──────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="mb-16">
          <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-8">
            Collection
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((p) => {
              const img = p.images?.[0]?.secureUrl;
              const variant = p.variants.find((v) => v.isDefault) ?? p.variants[0];
              const price = variant ? Number(variant.price) : null;
              return (
                <Link key={p.id} href={`/shop/product/${p.id}`} className="group block">
                  <div className="relative w-full bg-[#c8c4bd] aspect-[3/4] overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#c8c4bd]" />
                    )}
                  </div>
                  <div className="mt-2.5 space-y-0.5">
                    <p className="text-[10px] tracking-[0.18em] text-[#0a0a0a] leading-snug uppercase font-light">
                      {p.title}
                    </p>
                    {price !== null && !isNaN(price) && (
                      <p className="text-[10px] tracking-[0.06em] text-[#0a0a0a]">
                        {formatPrice(price)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase">
            Customer Reviews
            {artisan.reviewCount > 0 && (
              <span className="ml-2 text-[#b0b0b0]">({artisan.reviewCount})</span>
            )}
          </p>
          {!artisan.isUnrated && artisan.averageRating != null && (
            <StarDisplay rating={artisan.averageRating} count={artisan.reviewCount} showCount size="sm" />
          )}
        </div>
        <ReviewList
          artisanId={artisan.id}
          initialReviews={artisan.reviews}
          initialTotal={artisan.reviewCount}
        />
      </section>
    </div>
  );
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchArtisanShop(id);
  if (!data) return { title: "Artisan — LaCraf" };
  return {
    title: `${data.shop.shopName} — LaCraf`,
    description: data.shop.description?.slice(0, 160),
  };
}
