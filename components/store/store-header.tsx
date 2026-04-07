"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import type { StoreCategory } from "@/app/shop/layout";
import { useCart } from "@/context/cart-context";
import CartDrawer from "./cart-drawer";

/* ── Nav items with subcategory mapping ───────────────── */
const NAV_ITEMS = [
  { name: "HANDLOOMS", slug: "handloom" },
  { name: "HANDICRAFTS", slug: "handicraft" },
  { name: "THE ATELIER", slug: "edibles" },
  { name: "GIFTS", slug: "gifts", comingSoon: true },
];

const SUGGESTED_SEARCHES = [
  "Pashmina",
  "Gifts for mens",
  "Kashmiri Shawls",
  "Wool Socks",
  "Handbags",
  "Blankets",
];

/* ── Props ────────────────────────────────────────────── */
interface StoreHeaderProps {
  categories: StoreCategory[];
  variant?: "default" | "transparent";
}

export default function StoreHeader({
  categories,
  variant = "default",
}: StoreHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, setDrawerOpen } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Current category from URL
  const currentSlug = pathname.startsWith("/shop/")
    ? pathname.split("/shop/")[1]?.split("?")[0]?.split("/")[0]
    : "";

  /* ── Check customer login state ─────────────────────── */
  useEffect(() => {
    setIsCustomerLoggedIn(!!localStorage.getItem("customerAccessToken"));
  }, []);

  /* ── Scroll detection ───────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close menu/search on route change ──────────────── */
  useEffect(() => {
    setActiveMenu(null);
    setSearchOpen(false);
    setSearchQuery("");
  }, [pathname]);

  /* ── Mega menu hover handlers ───────────────────────── */
  const openMenu = useCallback((slug: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(slug);
    setSearchOpen(false);
  }, []);

  const closeMenu = useCallback(() => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  }, []);

  const keepMenu = useCallback(() => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
  }, []);

  /* ── Get subcategories for active menu ──────────────── */
  const activeCat = categories.find((c) => c.slug === activeMenu);
  const subcategories = activeCat?.subcategories ?? [];

  /* ── Determine colors based on variant + scroll ─────── */
  const isTransparent = variant === "transparent" && !scrolled && !activeMenu && !searchOpen;
  const textColor = isTransparent ? "text-white" : "text-[#0a0a0a]";
  const textMuted = isTransparent ? "text-white/60" : "text-[#8a8a8a]";
  const bgClass = isTransparent
    ? "bg-transparent"
    : "bg-white border-b border-[#e0e0e0]";

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
      >
        {/* ── Top bar ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 h-14 max-w-[1200px] mx-auto">
          {/* Left: Search or Back */}
          <div className="flex items-center gap-3 w-48">
            {scrolled && !searchOpen ? (
              <button
                onClick={() => router.back()}
                className={`flex items-center gap-2 text-[10px] tracking-[0.2em] ${textColor} hover:opacity-50 transition-opacity`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                BACK
              </button>
            ) : searchOpen ? (
              <div className="flex items-center gap-2 border-b border-[#0a0a0a] pb-0.5 w-full">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={textColor}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH"
                  className="text-[10px] tracking-[0.2em] bg-transparent outline-none flex-1 placeholder:text-[#8a8a8a]"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setActiveMenu(null);
                }}
                className={`flex items-center gap-2 text-[10px] tracking-[0.2em] ${textColor} hover:opacity-50 transition-opacity`}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                SEARCH
              </button>
            )}
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            className={`text-[1.3rem] tracking-[0.08em] ${textColor} select-none`}
            style={{ fontFamily: "var(--font-serif)" }}
          >
            LaCraf
          </Link>

          {/* Right: Account + Bag */}
          <div className="flex items-center gap-5 w-48 justify-end">
            <Link
              href={isCustomerLoggedIn ? "/account" : "/account/login"}
              className={`flex items-center gap-1.5 text-[10px] tracking-[0.2em] ${textColor} hover:opacity-50 transition-opacity`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              ACCOUNT
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex items-center gap-1.5 text-[10px] tracking-[0.2em] ${textColor} hover:opacity-50 transition-opacity relative`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              BAG
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#0a0a0a] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Category nav (hidden when scrolled) ────────── */}
        <nav
          className={`border-t border-[#e0e0e0] overflow-hidden transition-all duration-300 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
          <ul className="flex items-center justify-center gap-8 max-w-[1200px] mx-auto h-10">
            {NAV_ITEMS.map((item) => {
              const isActive = currentSlug === item.slug;
              return (
                <li
                  key={item.slug}
                  onMouseEnter={() =>
                    !item.comingSoon && openMenu(item.slug)
                  }
                  onMouseLeave={closeMenu}
                >
                  {item.comingSoon ? (
                    <span
                      className={`text-[10px] tracking-[0.2em] ${
                        isTransparent ? "text-white/30" : "text-[#c0c0c0]"
                      } cursor-default select-none`}
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={`/shop/${item.slug}`}
                      className={`text-[10px] tracking-[0.2em] transition-all relative py-2.5 block ${
                        isActive
                          ? `${textColor} after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px ${
                              isTransparent
                                ? "after:bg-white"
                                : "after:bg-[#0a0a0a]"
                            }`
                          : `${textMuted} hover:${textColor}`
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Mega menu dropdown ─────────────────────────── */}
        {activeMenu && subcategories.length > 0 && !scrolled && (
          <div
            className="border-t border-[#e0e0e0] bg-white"
            onMouseEnter={keepMenu}
            onMouseLeave={closeMenu}
          >
            <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-8">
              {/* Left: subcategory list */}
              <div className="w-56 border-r border-[#e0e0e0] pr-8">
                <p className="text-[11px] tracking-[0.15em] font-semibold text-[#0a0a0a] mb-4 uppercase">
                  {activeCat?.name}
                </p>
                <ul className="space-y-2.5">
                  {subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/shop/${activeMenu}?sub=${sub.slug}`}
                        className="text-sm text-[#0a0a0a] hover:opacity-60 transition-opacity"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: subcategory image cards */}
              <div className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide">
                {subcategories.slice(0, 5).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/shop/${activeMenu}?sub=${sub.slug}`}
                    className="group flex-shrink-0 w-[170px]"
                  >
                    <div className="aspect-[3/4] bg-[#f5f5f3] rounded-sm overflow-hidden" />
                    <p className="mt-2 text-xs text-[#0a0a0a]">{sub.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Search panel dropdown ──────────────────────── */}
        {searchOpen && (
          <div className="border-t border-[#e0e0e0] bg-white">
            <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-8">
              {/* Left: suggested searches */}
              <div className="w-56 border-r border-[#e0e0e0] pr-8">
                <p className="text-[10px] tracking-[0.2em] font-medium text-[#8a8a8a] mb-4">
                  SUGGESTED SEARCHES
                </p>
                <ul className="space-y-2.5">
                  {SUGGESTED_SEARCHES.map((term) => (
                    <li key={term}>
                      <button
                        onClick={() => setSearchQuery(term)}
                        className="text-sm text-[#0a0a0a] hover:opacity-60 transition-opacity text-left"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: placeholder product cards */}
              <div className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide">
                {["Pashmina", "Cashmere", "Kalamkari"].map((name) => (
                  <div key={name} className="flex-shrink-0 w-[170px]">
                    <div className="aspect-[3/4] bg-[#f5f5f3] rounded-sm" />
                    <p className="mt-2 text-xs text-[#0a0a0a]">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going behind fixed header */}
      {variant !== "transparent" && (
        <div className={scrolled ? "h-14" : "h-[96px]"} />
      )}

      {/* Backdrop for mega menu / search */}
      {(activeMenu || searchOpen) && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setActiveMenu(null);
            setSearchOpen(false);
            setSearchQuery("");
          }}
        />
      )}

      {/* Cart drawer */}
      <CartDrawer />
    </>
  );
}
