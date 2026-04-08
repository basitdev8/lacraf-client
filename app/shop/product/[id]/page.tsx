import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ProductImageGallery from "@/components/store/product-image-gallery";
import ProductPurchasePanel from "@/components/store/product-purchase-panel";
import { StorefrontProduct } from "@/components/store/product-grid";
import { TrustBadge, CertBadge } from "@/components/store/trust-badge";
import { StarDisplay } from "@/components/store/star-display";
import { ReviewList, ReviewItem } from "@/components/artisan/review-list";
import { CraftJourneyTimeline } from "@/components/store/craft-journey-timeline";
import { CraftJourneyStage, SupplyChainLink, ProductType } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// ── Full product type returned by /storefront/products/:id ─────────────────
interface FullProduct extends StorefrontProduct {
  description: string;
  giCertUrl: string | null;
  giCertPublicId: string | null;
  productType: ProductType;
  productionStage: string | null;
  supplierType: string;
  craftJourney?: CraftJourneyStage[];
  supplyChainOutput?: SupplyChainLink[];
  attributes: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    value: string;
  }>;
  variants: Array<{
    id: string;
    label: string;
    price: number;
    stock: number;
    isDefault: boolean;
    images: Array<{ id: string; secureUrl: string; sortOrder: number; publicId: string }>;
    attributes: Array<{
      id: string;
      key: string;
      label: string;
      type: string;
      value: string;
    }>;
  }>;
  artisan: {
    id: string;
    fullName: string;
    shop: {
      shopName: string;
      description: string;
      address: string;
    } | null;
    trustScore?: number | null;
    trustTier?: "NONE" | "BRONZE" | "SILVER" | "GOLD" | null;
    isUnrated?: boolean;
    reviewCount?: number;
    averageRating?: number | null;
    businessCertApproved?: boolean;
    govRecognizedApproved?: boolean;
    reviews?: ReviewItem[];
  } | null;
}

async function fetchProduct(id: string): Promise<FullProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/storefront/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

async function fetchRelatedProducts(
  categoryId: string,
  excludeId: string
): Promise<StorefrontProduct[]> {
  try {
    const qs = new URLSearchParams({
      categoryId,
      limit: "5",
      page: "1",
    });
    const res = await fetch(
      `${API_BASE}/storefront/products?${qs.toString()}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json;
    const all: StorefrontProduct[] = data.products ?? [];
    return all.filter((p) => p.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

function formatPrice(price: number): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

// ── Related product card ───────────────────────────────────────────────────
function RelatedCard({ product }: { product: StorefrontProduct }) {
  const img = product.images?.[0]?.secureUrl;
  const rawPrice =
    product.variants.find((v) => v.isDefault)?.price ??
    product.variants[0]?.price;
  const price = rawPrice !== undefined ? Number(rawPrice) : undefined;

  return (
    <Link
      href={`/shop/product/${product.id}`}
      className="group flex-shrink-0 w-56 md:w-auto"
    >
      <div className="relative w-full bg-[#f5f4f0] aspect-[3/4] overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 224px, 25vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-[#f5f4f0]" />
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <p className="text-[11px] tracking-[0.08em] text-[#0a0a0a] leading-snug group-hover:opacity-70 transition-opacity">
          {product.title}
        </p>
        {price !== undefined && !isNaN(price) && (
          <p className="text-[11px] tracking-[0.04em] text-[#6a6a6a]">
            {formatPrice(price)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) notFound();

  const relatedProducts = product.category?.id
    ? await fetchRelatedProducts(product.category.id, product.id)
    : [];

  const artisan = product.artisan;
  const shop = artisan?.shop;

  // Collect all images: product images + variant images for the gallery
  const allImages = [
    ...product.images.map((img) => ({
      id: img.id,
      secureUrl: img.secureUrl,
      sortOrder: img.sortOrder,
      publicId: img.publicId,
    })),
    ...product.variants.flatMap((v) =>
      v.images.map((img) => ({
        id: img.id,
        secureUrl: img.secureUrl,
        sortOrder: img.sortOrder,
        publicId: img.publicId,
      }))
    ),
  ].sort((a, b) => a.sortOrder - b.sortOrder);

  // Map attributes for display
  const displayAttributes = product.attributes.slice(0, 4);

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[9px] tracking-[0.15em] text-[#9a9a9a]">
          <Link
            href="/shop"
            className="hover:text-[#0a0a0a] transition-colors"
          >
            HOME
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={`/shop/${product.category.slug}`}
                className="hover:text-[#0a0a0a] transition-colors uppercase"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#0a0a0a]">{product.title}</span>
        </nav>
      </div>

      {/* ── Hero: Gallery + Purchase Panel ─────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-0 md:gap-16 pb-6">
          {/* Gallery */}
          <div>
            <ProductImageGallery images={allImages} />
          </div>

          {/* Purchase panel — sticky on desktop */}
          <div className="pt-8 md:pt-0 pb-10">
            <div className="md:sticky md:top-24">
              <ProductPurchasePanel
                productId={product.id}
                title={product.title}
                shopName={shop?.shopName ?? null}
                artisanId={artisan?.id ?? null}
                variants={product.variants}
                giCertUrl={product.giCertUrl}
                isMadeToOrder={product.isMadeToOrder}
                leadTimeDays={product.leadTimeDays}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── The Narrative ─────────────────────────────────────────── */}
      <section className="bg-[#faf9f7]">
        <div className="max-w-[900px] mx-auto px-6 py-20 md:py-28 text-center">
          <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-8">
            The Narrative
          </p>

          {/* Decorative line */}
          <div className="w-8 h-px bg-[#d8d6d3] mx-auto mb-10" />

          <h2
            className="text-3xl md:text-[42px] text-[#0a0a0a] leading-[1.15] mb-8 font-light"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {product.title}
          </h2>

          <p className="text-[12px] md:text-[13px] leading-[2] text-[#6a6a6a] tracking-[0.02em] max-w-[620px] mx-auto">
            {product.description}
          </p>

          {shop && (
            <p className="text-[9px] tracking-[0.3em] text-[#9a9a9a] mt-10 uppercase">
              — {shop.shopName},{" "}
              {shop.address?.split(",").slice(-2).join(",").trim()}
            </p>
          )}

          {/* Decorative line */}
          <div className="w-8 h-px bg-[#d8d6d3] mx-auto mt-10" />
        </div>
      </section>

      {/* ── Attributes — Elegant horizontal strip ─────────────────── */}
      {displayAttributes.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
          <div className="flex items-center justify-center">
            {displayAttributes.map((attr, i) => (
              <div key={attr.id} className="flex items-center">
                <div className="text-center px-8 md:px-14">
                  <p className="text-[8px] tracking-[0.3em] text-[#9a9a9a] uppercase mb-2.5">
                    {attr.label}
                  </p>
                  <p className="text-[12px] tracking-[0.1em] text-[#0a0a0a] font-medium">
                    {attr.value}
                  </p>
                </div>
                {/* Vertical divider between attributes */}
                {i < displayAttributes.length - 1 && (
                  <div className="w-px h-10 bg-[#e0deda]" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Artisan Section — Editorial layout ────────────────────── */}
      {artisan && (
        <section className="border-t border-[#e8e6e3]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Artisan bio — left side */}
            <div className="flex flex-col justify-center px-8 md:px-20 py-16 md:py-24 order-2 md:order-1">
              <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-6">
                The Artisan
              </p>

              <h3
                className="text-3xl md:text-4xl text-[#0a0a0a] mb-4 leading-[1.15] font-light"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {artisan.fullName}
              </h3>

              {/* Trust score + tier badge */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <TrustBadge tier={artisan.trustTier ?? "NONE"} size="md" />
                {artisan.businessCertApproved && (
                  <CertBadge type="business" size="md" />
                )}
                {artisan.govRecognizedApproved && (
                  <CertBadge type="gov" size="md" />
                )}
              </div>
              <div className="flex items-center gap-3 mb-7">
                {artisan.isUnrated ? (
                  <span className="text-[9px] tracking-[0.15em] text-[#9a9a9a] uppercase">
                    Unrated
                  </span>
                ) : (
                  <>
                    {artisan.trustScore != null && (
                      <span className="text-[11px] tracking-[0.08em] text-[#3a3a3a]">
                        {(artisan.trustScore / 10).toFixed(1)} / 10
                      </span>
                    )}
                    {artisan.averageRating != null && artisan.reviewCount != null && (
                      <StarDisplay
                        rating={artisan.averageRating}
                        count={artisan.reviewCount}
                        showCount
                        size="sm"
                      />
                    )}
                  </>
                )}
              </div>

              {shop?.description ? (
                <div className="mb-9">
                  {/* Pull quote style */}
                  <div className="border-l-2 border-[#e0deda] pl-6">
                    <p
                      className="text-[15px] leading-[1.7] text-[#5a5a5a] italic mb-4"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      &ldquo;
                      {shop.description.slice(0, 150)}
                      {shop.description.length > 150 ? "..." : ""}
                      &rdquo;
                    </p>
                  </div>
                  {shop.description.length > 150 && (
                    <p className="text-[11px] leading-[1.8] text-[#6a6a6a] tracking-[0.02em] mt-5 max-w-sm">
                      {shop.description.slice(150, 400)}
                      {shop.description.length > 400 ? "..." : ""}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] leading-[1.8] text-[#6a6a6a] tracking-[0.02em] mb-9 max-w-sm">
                  A master craftsperson with generations of expertise, dedicated
                  to preserving the art forms of their region.
                </p>
              )}

              <Link
                href={`/shop/atelier/${artisan.id}`}
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#0a0a0a] uppercase group self-start"
              >
                <span className="border-b border-[#0a0a0a] pb-0.5 group-hover:opacity-60 transition-opacity">
                  View Atelier
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Artisan image placeholder — right side */}
            <div className="relative min-h-[420px] md:min-h-[560px] bg-[#eae8e4] order-1 md:order-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ddd9d3] to-[#c8c3bb]" />
              {/* Subtle textile texture */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #0a0a0a 0, #0a0a0a 1px, transparent 0, transparent 50%)",
                  backgroundSize: "6px 6px",
                }}
              />
              {/* Centered label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[10px] tracking-[0.3em] text-[#9a9a9a] uppercase">
                  Atelier Portrait
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Customer Reviews ──────────────────────────────────────── */}
      {artisan && (
        <section className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
          <div className="flex items-baseline justify-between mb-8">
            <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase">
              Customer Reviews
            </p>
            {!artisan.isUnrated && artisan.averageRating != null && artisan.reviewCount != null && (
              <StarDisplay rating={artisan.averageRating} count={artisan.reviewCount} showCount size="sm" />
            )}
          </div>
          <ReviewList
            artisanId={artisan.id}
            initialReviews={artisan.reviews ?? []}
            initialTotal={artisan.reviewCount ?? 0}
          />
        </section>
      )}

      {/* ── Craft Journey Timeline (finished products only) ──────────── */}
      {product.productType === "FINISHED" &&
        product.craftJourney &&
        product.craftJourney.length > 0 && (
          <section className="border-t border-[#e8e6e3] bg-white">
            <CraftJourneyTimeline stages={product.craftJourney} />
          </section>
        )}

      {/* ── Used In Products (raw / semi-finished products) ──────────── */}
      {(product.productType === "RAW" || product.productType === "SEMI_FINISHED") &&
        product.supplyChainOutput &&
        product.supplyChainOutput.length > 0 && (
          <section className="border-t border-[#e8e6e3]">
            <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
              <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-10 text-center">
                Used In Finished Products
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {product.supplyChainOutput.map((link) => {
                  const fp = link.finishedProduct;
                  const img = fp.images?.[0]?.secureUrl;
                  return (
                    <Link
                      key={fp.id}
                      href={`/shop/product/${fp.id}`}
                      className="group"
                    >
                      <div className="relative w-full aspect-[3/4] bg-[#f5f4f0] overflow-hidden mb-3">
                        {img ? (
                          <Image
                            src={img}
                            alt={fp.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#f5f4f0]" />
                        )}
                      </div>
                      <p className="text-[11px] tracking-[0.06em] text-[#0a0a0a] leading-snug group-hover:opacity-60 transition-opacity">
                        {fp.title}
                      </p>
                      {fp.artisan?.shop?.shopName && (
                        <p className="text-[9px] tracking-[0.08em] text-[#9a9a9a] mt-1">
                          {fp.artisan.shop.shopName}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      {/* ── Authenticity Chain — Centered certification display ────── */}
      <section className="bg-[#faf9f7]">
        <div className="max-w-[800px] mx-auto px-6 py-20 md:py-24">
          <div className="text-center">
            <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-10">
              Authenticity & Provenance
            </p>

            {/* Certification badge */}
            <div className="inline-flex flex-col items-center border border-[#e0deda] px-16 py-12">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="0.8"
                className="mb-5 opacity-40"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>

              {product.giCertUrl ? (
                <>
                  <p className="text-[11px] tracking-[0.25em] text-[#0a0a0a] font-medium uppercase">
                    GI Certified
                  </p>
                  <p className="text-[9px] tracking-[0.2em] text-[#9a9a9a] mt-2 uppercase">
                    Authenticity Verified
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] tracking-[0.25em] text-[#8a8a8a] uppercase">
                    Craftsman Authenticated
                  </p>
                  <p className="text-[9px] tracking-[0.2em] text-[#b0b0b0] mt-2 uppercase">
                    GI Certificate Pending
                  </p>
                </>
              )}
            </div>

            <p className="text-[11px] leading-[1.9] text-[#6a6a6a] tracking-[0.02em] max-w-[480px] mx-auto mt-10">
              Each piece is physically tagged with a unique GI code, traceable
              to its region of origin. We maintain blockchain-verified
              certificates ensuring the provenance of your piece remains
              immutable.
            </p>
          </div>
        </div>
      </section>

      {/* ── You May Also Like ─────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#e8e6e3] py-16 md:py-20 px-6 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h3
              className="text-xl md:text-2xl tracking-[0.02em] text-[#0a0a0a] font-light"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              You May Also Like
            </h3>
            {product.category && (
              <Link
                href={`/shop/${product.category.slug}`}
                className="text-[9px] tracking-[0.22em] text-[#9a9a9a] uppercase hover:text-[#0a0a0a] transition-colors"
              >
                View All
              </Link>
            )}
          </div>

          <div className="flex gap-5 md:grid md:grid-cols-4 md:gap-8 overflow-x-auto pb-4 md:pb-0 md:overflow-visible">
            {relatedProducts.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: "Product — LaCraf" };

  return {
    title: `${product.title} — LaCraf`,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: product.images?.[0]?.secureUrl
        ? [product.images[0].secureUrl]
        : [],
    },
  };
}
