"use client";

import { useState } from "react";

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

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#e0e0e0]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-[10px] tracking-[0.2em] text-[#0a0a0a]">
          {title}
        </span>
        <span className="text-[#8a8a8a] text-base leading-none">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="pb-4 text-[11px] leading-relaxed text-[#5a5a5a] tracking-wide">
          {children}
        </div>
      )}
    </div>
  );
}

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
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    defaultVariant
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price = selectedVariant ? Number(selectedVariant.price) : null;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQty = selectedVariant ? Math.min(selectedVariant.stock, 10) : 1;

  function handleAddToBag() {
    if (!selectedVariant || !inStock) return;
    // TODO: Integrate with customer cart API
    // POST /api/v1/cart/items { productId, variantId, quantity }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Suppress unused variable warning
  void productId;
  void artisanId;

  return (
    <div className="flex flex-col">
      {/* Shop attribution */}
      {shopName && (
        <p className="text-[9px] tracking-[0.22em] text-[#8a8a8a] uppercase mb-2">
          {shopName}
        </p>
      )}

      {/* Title */}
      <h1
        className="text-2xl md:text-3xl tracking-[0.04em] text-[#0a0a0a] font-light uppercase leading-snug mb-4"
      >
        {title}
      </h1>

      {/* Price */}
      {price !== null && (
        <p className="text-base tracking-[0.06em] text-[#0a0a0a] mb-3">
          {formatPrice(price)}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {giCertUrl && (
          <span className="inline-flex items-center gap-1 text-[8px] tracking-[0.15em] border border-[#0a0a0a] px-2.5 py-1 text-[#0a0a0a]">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            GI CERTIFIED
          </span>
        )}
        {isMadeToOrder && (
          <span className="inline-flex items-center text-[8px] tracking-[0.15em] border border-[#8a8a8a] px-2.5 py-1 text-[#8a8a8a]">
            MADE TO ORDER
            {leadTimeDays && ` · ${leadTimeDays}d`}
          </span>
        )}
      </div>

      {/* Variant selector (SIZE) */}
      {variants.length > 1 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-[0.2em] text-[#0a0a0a]">SIZE</p>
            <button className="text-[9px] tracking-[0.15em] text-[#8a8a8a] underline underline-offset-2 hover:text-[#0a0a0a] transition-colors">
              Size Guide
            </button>
          </div>
          <div className="relative">
            <select
              value={selectedVariant?.id ?? ""}
              onChange={(e) => {
                const v = variants.find((va) => va.id === e.target.value);
                if (v) {
                  setSelectedVariant(v);
                  setQuantity(1);
                }
              }}
              className="w-full border border-[#e0e0e0] text-[10px] tracking-[0.15em] py-3 px-4 appearance-none bg-white text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors focus:outline-none focus:border-[#0a0a0a]"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock === 0}>
                  {v.label} {v.stock === 0 ? "(Out of Stock)" : ""}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8a8a8a"
              strokeWidth="1.5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-5">
        <p className="text-[9px] tracking-[0.2em] text-[#0a0a0a] mb-2">
          QUANTITY
        </p>
        <div className="flex items-center gap-0 border border-[#e0e0e0] w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors text-sm"
          >
            −
          </button>
          <span className="w-10 text-center text-[11px] tracking-wide">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            className="w-10 h-10 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 text-sm"
          >
            +
          </button>
        </div>
        {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
          <p className="text-[9px] tracking-wide text-[#8a8a8a] mt-1.5">
            Only {selectedVariant.stock} left
          </p>
        )}
      </div>

      {/* Add to bag */}
      <button
        onClick={handleAddToBag}
        disabled={!inStock}
        className="w-full bg-[#0a0a0a] text-white text-[10px] tracking-[0.25em] py-4 hover:opacity-80 transition-opacity disabled:opacity-30 mb-3"
      >
        {added ? "ADDED ✓" : !inStock ? "OUT OF STOCK" : "ADD TO BAG"}
      </button>

      {/* Request a commission */}
      <button className="w-full border border-[#e0e0e0] text-[10px] tracking-[0.2em] text-[#0a0a0a] py-4 hover:border-[#0a0a0a] transition-colors mb-6">
        REQUEST A COMMISSION
      </button>

      {/* Info line */}
      <p className="text-[9px] tracking-wide text-[#8a8a8a] text-center mb-6">
        Ships in 5–7 days · Insured white-glove delivery
      </p>

      {/* Accordions */}
      <div className="border-b border-[#e0e0e0]">
        <AccordionItem title="THE PROVENANCE">
          <p>
            Each piece carries the story of its origin — the hands that shaped
            it, the land that inspired it, and the tradition that guided it.
            Provenance certificates are available on request.
          </p>
        </AccordionItem>
        <AccordionItem title="CARE & PRESERVATION">
          <p>
            Dry clean only. Store in a cool, dry place away from direct sunlight.
            For Pashmina pieces, fold gently and avoid hanging. Use a cedar block
            to prevent moths.
          </p>
        </AccordionItem>
        <AccordionItem title="SHIPPING & WHITE GLOVE SERVICE">
          <p>
            All orders are shipped fully insured with a signature-required
            delivery. International shipping available. Customs duties may apply
            depending on your country.
          </p>
        </AccordionItem>
      </div>
    </div>
  );
}
