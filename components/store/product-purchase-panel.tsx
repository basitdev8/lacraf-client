"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

interface Variant {
  id: string;
  label: string;
  price: number;
  stock: number;
  isDefault: boolean;
}

interface ProductPurchasePanelProps {
  productId: string;
  title: string;
  shopName: string | null;
  artisanId: string | null;
  variants: Variant[];
  giCertUrl: string | null;
  isMadeToOrder: boolean;
  leadTimeDays: number | null;
}

function formatPrice(price: number): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

/* ── Animated Accordion ──────────────────────────────────────────────────── */
function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div className="border-t border-[#e8e6e3]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-[10px] tracking-[0.22em] text-[#0a0a0a] uppercase">
          {title}
        </span>
        <span
          className="text-[#8a8a8a] text-xs leading-none transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? `${contentHeight}px` : "0px" }}
      >
        <div
          ref={contentRef}
          className="pb-5 text-[11px] leading-[1.8] text-[#6a6a6a] tracking-[0.02em]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────────────────────────── */
export default function ProductPurchasePanel({
  productId,
  title,
  shopName,
  artisanId,
  variants,
  giCertUrl,
  isMadeToOrder,
  leadTimeDays,
}: ProductPurchasePanelProps) {
  const { addItem, setDrawerOpen } = useCart();
  const router = useRouter();

  const defaultVariant =
    variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    defaultVariant
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const rawPrice = selectedVariant ? Number(selectedVariant.price) : null;
  const price = rawPrice !== null && !isNaN(rawPrice) ? rawPrice : null;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQty = selectedVariant ? Math.min(selectedVariant.stock, 10) : 1;

  async function handleAddToBag() {
    if (!selectedVariant || !inStock || adding) return;

    const token = localStorage.getItem("customerAccessToken");
    if (!token) {
      router.push("/account/login");
      return;
    }

    try {
      setAdding(true);
      await addItem(productId, selectedVariant.id, quantity);
      setAdded(true);
      setDrawerOpen(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // Error is handled silently — user sees the button revert
    } finally {
      setAdding(false);
    }
  }

  // Suppress unused variable warning
  void artisanId;

  return (
    <div className="flex flex-col">
      {/* Shop attribution */}
      {shopName && (
        <p className="text-[9px] tracking-[0.35em] text-[#9a9a9a] uppercase mb-4">
          {shopName}
        </p>
      )}

      {/* Title — Serif, elegant, mixed case (like Hermes/Chanel) */}
      <h1
        className="text-2xl md:text-[32px] tracking-[0.02em] text-[#0a0a0a] font-light leading-[1.2] mb-5"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h1>

      {/* Price */}
      {price !== null && (
        <p className="text-sm tracking-[0.08em] text-[#0a0a0a] mb-6">
          {formatPrice(price)}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2.5 mb-7">
        {giCertUrl && (
          <span className="inline-flex items-center gap-1.5 text-[8px] tracking-[0.18em] border border-[#0a0a0a] px-3 py-1.5 text-[#0a0a0a] uppercase">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            GI Certified
          </span>
        )}
        {isMadeToOrder && (
          <span className="inline-flex items-center text-[8px] tracking-[0.18em] border border-[#c8c4bd] px-3 py-1.5 text-[#8a8a8a] uppercase">
            Made to Order
            {leadTimeDays && ` · ${leadTimeDays} days`}
          </span>
        )}
      </div>

      {/* ── Variant selector — Horizontal clickable boxes (like Gucci/LV) ── */}
      {variants.length > 1 && (
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] tracking-[0.25em] text-[#0a0a0a] uppercase">
              Size
            </p>
            <button className="text-[9px] tracking-[0.15em] text-[#8a8a8a] underline underline-offset-4 decoration-[#d0d0d0] hover:text-[#0a0a0a] hover:decoration-[#0a0a0a] transition-colors">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const isOutOfStock = v.stock === 0;

              return (
                <button
                  key={v.id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }
                  }}
                  disabled={isOutOfStock}
                  className={`
                    min-w-[52px] h-[44px] px-4 text-[10px] tracking-[0.12em]
                    border transition-all duration-200
                    ${
                      isSelected
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                        : isOutOfStock
                          ? "border-[#e8e6e3] text-[#c8c4bd] line-through cursor-not-allowed"
                          : "border-[#d8d6d3] text-[#0a0a0a] hover:border-[#0a0a0a]"
                    }
                  `}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quantity ──────────────────────────────────────────────────── */}
      <div className="mb-7">
        <p className="text-[9px] tracking-[0.25em] text-[#0a0a0a] uppercase mb-3">
          Quantity
        </p>
        <div className="flex items-center border border-[#d8d6d3] w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center text-[#0a0a0a] hover:bg-[#faf9f7] transition-colors text-sm"
          >
            −
          </button>
          <span className="w-11 text-center text-[11px] tracking-[0.08em] select-none">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            className="w-11 h-11 flex items-center justify-center text-[#0a0a0a] hover:bg-[#faf9f7] transition-colors disabled:opacity-25 text-sm"
          >
            +
          </button>
        </div>
        {selectedVariant &&
          selectedVariant.stock <= 5 &&
          selectedVariant.stock > 0 && (
            <p className="text-[9px] tracking-[0.06em] text-[#b08968] mt-2 italic">
              Only {selectedVariant.stock} remaining
            </p>
          )}
      </div>

      {/* ── Add to Bag + Wishlist ─────────────────────────────────────── */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={handleAddToBag}
          disabled={!inStock}
          className={`
            flex-1 h-[52px] text-[10px] tracking-[0.28em] uppercase
            transition-all duration-300
            ${
              added
                ? "bg-[#1a1a1a] text-white"
                : "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
            }
            disabled:opacity-25 disabled:cursor-not-allowed
          `}
        >
          {added
            ? "Added to Bag"
            : adding
              ? "Adding..."
              : !inStock
                ? "Out of Stock"
                : "Add to Bag"}
        </button>
        <button
          onClick={() => setWishlisted((w) => !w)}
          className="w-[52px] h-[52px] border border-[#d8d6d3] flex items-center justify-center hover:border-[#0a0a0a] transition-colors"
          aria-label="Add to wishlist"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#0a0a0a" : "none"}
            stroke="#0a0a0a"
            strokeWidth="1.2"
            className="transition-all duration-300"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Request a commission */}
      <button className="w-full h-[52px] border border-[#d8d6d3] text-[10px] tracking-[0.22em] text-[#0a0a0a] uppercase hover:border-[#0a0a0a] transition-colors mb-7">
        Request a Commission
      </button>

      {/* Shipping info */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9a9a9a"
            strokeWidth="1.2"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span className="text-[9px] tracking-[0.06em] text-[#9a9a9a]">
            Complimentary shipping
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9a9a9a"
            strokeWidth="1.2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-[9px] tracking-[0.06em] text-[#9a9a9a]">
            Insured delivery
          </span>
        </div>
      </div>

      {/* ── Accordions ───────────────────────────────────────────────── */}
      <div className="border-b border-[#e8e6e3]">
        <AccordionItem title="The Provenance">
          <p>
            Each piece carries the story of its origin — the hands that shaped
            it, the land that inspired it, and the tradition that guided it.
            Provenance certificates are available on request.
          </p>
        </AccordionItem>
        <AccordionItem title="Materials & Composition">
          <p>
            Crafted from the finest natural materials, selected for their
            quality and sustainability. Each material is sourced responsibly from
            artisan communities across the region.
          </p>
        </AccordionItem>
        <AccordionItem title="Care & Preservation">
          <p>
            Dry clean only. Store in a cool, dry place away from direct
            sunlight. For Pashmina pieces, fold gently and avoid hanging. Use a
            cedar block to prevent moths.
          </p>
        </AccordionItem>
        <AccordionItem title="Shipping & Returns">
          <p>
            All orders ship fully insured with signature-required white-glove
            delivery within 5–7 business days. International shipping available.
            Returns accepted within 14 days of delivery in original condition.
          </p>
        </AccordionItem>
      </div>
    </div>
  );
}
