import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ProductImageGallery from "@/components/store/product-image-gallery";
import ProductPurchasePanel from "@/components/store/product-purchase-panel";
import { StorefrontProduct } from "@/components/store/product-grid";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// ── Full product type returned by /storefront/products/:id ─────────────────
interface FullProduct extends StorefrontProduct {
  description: string;
  giCertUrl: string | null;
  giCertPublicId: string | null;
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

// ── Related product card (thin strip version) ───────────────────────────────
function RelatedCard({ product }: { product: StorefrontProduct }) {
  const img = product.images?.[0]?.secureUrl;
  const rawPrice =
    product.variants.find((v) => v.isDefault)?.price ??
    product.variants[0]?.price;
  const price = rawPrice !== undefined ? Number(rawPrice) : undefined;

  return (
    <Link href={`/shop/product/${product.id}`} className="group flex-shrink-0 w-48 md:w-auto">
      <div className="relative w-full bg-[#c8c4bd] aspect-[3/4] overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="200px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-[#c8c4bd]" />
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-[10px] tracking-[0.15em] text-[#0a0a0a] uppercase font-light leading-snug">
          {product.title}
        </p>
        {price !== undefined && !isNaN(price) && (
          <p className="text-[10px] text-[#0a0a0a]">
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

  // Map attributes for display (pick a few key ones for the editorial grid)
  const displayAttributes = product.attributes.slice(0, 4);

  return (
    <>
      {/* ── Hero: Image + Purchase panel ──────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-0 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-0 md:gap-12 md:pt-6">
          {/* Gallery */}
          <div className="px-6 md:px-0">
            <ProductImageGallery images={allImages} />
          </div>

          {/* Purchase panel */}
          <div className="px-6 md:px-0 pt-6 md:pt-0 pb-10">
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

      {/* ── The Narrative ─────────────────────────────────────────────── */}
      <section className="border-t border-[#e0e0e0] mt-10 py-16 px-6 text-center max-w-[780px] mx-auto">
        <p className="text-[9px] tracking-[0.3em] text-[#8a8a8a] mb-6">
          THE NARRATIVE
        </p>
        <h2
          className="text-2xl md:text-4xl text-[#0a0a0a] leading-snug mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {product.title.split(" ").slice(0, 4).join(" ").toUpperCase()}.
        </h2>
        <p className="text-[11px] md:text-xs leading-relaxed text-[#5a5a5a] tracking-wide max-w-[580px] mx-auto">
          {product.description}
        </p>
        {shop && (
          <p className="text-[9px] tracking-[0.2em] text-[#8a8a8a] mt-8 uppercase">
            — {shop.shopName}, {shop.address?.split(",").slice(-2).join(",").trim()}
          </p>
        )}
      </section>

      {/* ── Attributes grid ───────────────────────────────────────────── */}
      {displayAttributes.length > 0 && (
        <section className="border-t border-[#e0e0e0] py-10 px-6 max-w-[1200px] mx-auto">
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: `repeat(${Math.min(displayAttributes.length, 4)}, 1fr)`,
            }}
          >
            {displayAttributes.map((attr) => (
              <div key={attr.id} className="text-center">
                <p className="text-[8px] tracking-[0.25em] text-[#8a8a8a] uppercase mb-2">
                  {attr.label}
                </p>
                <p className="text-[11px] tracking-[0.1em] text-[#0a0a0a] font-medium uppercase">
                  {attr.value}
                  {/* Unit hint for number types */}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Artisan section ───────────────────────────────────────────── */}
      {artisan && (
        <section className="border-t border-[#e0e0e0]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Placeholder artisan/atelier image — replace with real photo when available */}
            <div className="relative min-h-[360px] bg-[#c8c4bd]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b8b4ad] to-[#a0998e]" />
              {/* Decorative texture overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #0a0a0a 0, #0a0a0a 1px, transparent 0, transparent 50%)",
                  backgroundSize: "8px 8px",
                }}
              />
            </div>

            {/* Artisan bio */}
            <div className="flex flex-col justify-center px-8 md:px-14 py-14">
              <p className="text-[9px] tracking-[0.3em] text-[#8a8a8a] uppercase mb-4">
                THE ARTISAN
              </p>
              <h3
                className="text-2xl md:text-3xl text-[#0a0a0a] italic mb-5 leading-snug"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Meet {artisan.fullName}
              </h3>
              {shop?.description ? (
                <p className="text-[11px] leading-relaxed text-[#5a5a5a] tracking-wide mb-7 max-w-sm">
                  {shop.description.slice(0, 300)}
                  {shop.description.length > 300 ? "..." : ""}
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-[#5a5a5a] tracking-wide mb-7 max-w-sm">
                  A master craftsperson with generations of expertise, dedicated
                  to preserving the art forms of their region.
                </p>
              )}
              <Link
                href={`/shop/atelier/${artisan.id}`}
                className="text-[10px] tracking-[0.2em] text-[#0a0a0a] border-b border-[#0a0a0a] pb-0.5 hover:opacity-60 transition-opacity self-start"
              >
                VIEW ATELIER
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Authenticity Chain ────────────────────────────────────────── */}
      <section className="border-t border-[#e0e0e0] py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-xl md:text-2xl tracking-[0.08em] text-[#0a0a0a] uppercase font-light mb-4">
                Authenticity Chain
              </h3>
              <p className="text-[11px] leading-relaxed text-[#5a5a5a] tracking-wide max-w-sm">
                This item is physically tagged with a unique GI code, traceable
                to the Kashmir region. We maintain a blockchain-verified
                certificate to ensure the provenance of your piece remains
                immutable.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-8 border border-[#e0e0e0]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="1"
                className="mb-3 opacity-30"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {product.giCertUrl ? (
                <>
                  <p className="text-[10px] tracking-[0.2em] text-[#0a0a0a] font-medium">
                    GI CERTIFIED
                  </p>
                  <p className="text-[9px] tracking-[0.15em] text-[#8a8a8a] mt-1">
                    AUTHENTICITY VERIFIED
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] tracking-[0.2em] text-[#8a8a8a]">
                    CRAFTSMAN AUTHENTICATED
                  </p>
                  <p className="text-[9px] tracking-[0.15em] text-[#b0b0b0] mt-1">
                    GI CERTIFICATE PENDING
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── You may also like ─────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#e0e0e0] py-12 px-6 max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] tracking-[0.25em] text-[#0a0a0a] uppercase">
              You May Also Like
            </h3>
            {product.category && (
              <Link
                href={`/shop/${product.category.slug}`}
                className="text-[9px] tracking-[0.2em] text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors"
              >
                VIEW ALL
              </Link>
            )}
          </div>

          {/* Horizontal scroll on mobile, 4-col grid on desktop */}
          <div className="flex gap-4 md:grid md:grid-cols-4 overflow-x-auto pb-4 md:pb-0 md:overflow-visible">
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
