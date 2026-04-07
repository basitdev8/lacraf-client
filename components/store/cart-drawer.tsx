"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

function formatPrice(price: number): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function CartDrawer() {
  const {
    items,
    total,
    itemCount,
    loading,
    drawerOpen,
    setDrawerOpen,
    updateItem,
    removeItem,
  } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[60] transition-opacity duration-300 ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] transition-transform duration-300 ease-in-out flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-[#e8e6e3] flex-shrink-0">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-[#0a0a0a]">
            Your Bag ({itemCount})
          </h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-[10px] tracking-[0.15em] text-[#8a8a8a] uppercase">
                Loading...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d0d0d0"
                strokeWidth="1"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="text-[10px] tracking-[0.15em] text-[#8a8a8a] uppercase">
                Your bag is empty
              </p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-[10px] tracking-[0.2em] text-[#0a0a0a] underline underline-offset-4 decoration-[#d0d0d0] hover:decoration-[#0a0a0a] transition-colors uppercase mt-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const imageUrl = item.product.images?.[0]?.url;
                const price = item.variant ? Number(item.variant.price) : 0;

                return (
                  <li
                    key={item.id}
                    className="flex gap-4 pb-5 border-b border-[#f0eeeb]"
                  >
                    {/* Image */}
                    <Link
                      href={`/shop/product/${item.productId}`}
                      onClick={() => setDrawerOpen(false)}
                      className="w-20 h-24 bg-[#f5f5f3] flex-shrink-0 relative overflow-hidden"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.product.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f0eeeb]" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/product/${item.productId}`}
                        onClick={() => setDrawerOpen(false)}
                        className="block"
                      >
                        <p className="text-[11px] tracking-[0.04em] text-[#0a0a0a] leading-snug truncate">
                          {item.product.title}
                        </p>
                      </Link>
                      {item.variant && (
                        <p className="text-[9px] tracking-[0.1em] text-[#8a8a8a] mt-0.5 uppercase">
                          {item.variant.label}
                        </p>
                      )}
                      <p className="text-[11px] tracking-[0.06em] text-[#0a0a0a] mt-1.5">
                        {formatPrice(price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#e0e0e0]">
                          <button
                            onClick={() =>
                              item.quantity <= 1
                                ? removeItem(item.id)
                                : updateItem(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-[11px] text-[#0a0a0a] hover:bg-[#faf9f7] transition-colors"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-[10px] tracking-[0.06em] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-[11px] text-[#0a0a0a] hover:bg-[#faf9f7] transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[9px] tracking-[0.1em] text-[#8a8a8a] underline underline-offset-2 decoration-[#d0d0d0] hover:text-[#0a0a0a] hover:decoration-[#0a0a0a] transition-colors uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#e8e6e3] px-6 py-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] tracking-[0.22em] text-[#8a8a8a] uppercase">
                Subtotal
              </span>
              <span className="text-sm tracking-[0.06em] text-[#0a0a0a]">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[9px] tracking-[0.04em] text-[#8a8a8a] mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/account/orders"
              onClick={() => setDrawerOpen(false)}
              className="block w-full h-[48px] bg-[#0a0a0a] text-white text-[10px] tracking-[0.28em] uppercase flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
