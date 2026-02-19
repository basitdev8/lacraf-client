"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { StoreCategory } from "@/app/shop/layout";

const NAV_ITEMS = [
  { name: "HANDICRAFT", slug: "handicraft" },
  { name: "HANDLOOM", slug: "handloom" },
  { name: "EDIBLES", slug: "edibles" },
  { name: "GIFTS", slug: "gifts", comingSoon: true },
];

export default function StoreHeader({
  categories,
}: {
  categories: StoreCategory[];
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract current category slug from pathname e.g. /shop/handloom → handloom
  const currentSlug = pathname.startsWith("/shop/")
    ? pathname.split("/shop/")[1]?.split("?")[0]?.split("/")[0]
    : "";

  // Suppress unused variable warning — categories available for future use
  void categories;

  return (
    <header className="border-b border-[#e0e0e0] bg-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 max-w-[1200px] mx-auto">
        {/* Search */}
        <div className="flex items-center gap-3 w-40">
          {searchOpen ? (
            <div className="flex items-center gap-2 border-b border-[#0a0a0a] pb-0.5">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="text-[11px] tracking-wide bg-transparent outline-none w-32"
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
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#0a0a0a] hover:opacity-50 transition-opacity"
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

        {/* Logo — centered */}
        <Link
          href="/shop"
          className="text-[1.1rem] tracking-[0.08em] text-[#0a0a0a] select-none"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          LaCraf
        </Link>

        {/* Account + Bag */}
        <div className="flex items-center gap-5 w-40 justify-end">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#0a0a0a] hover:opacity-50 transition-opacity"
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
          <button className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#0a0a0a] hover:opacity-50 transition-opacity">
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
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-[#e0e0e0]">
        <ul className="flex items-center justify-center gap-8 max-w-[1200px] mx-auto h-10">
          {NAV_ITEMS.map((item) => {
            const isActive = currentSlug === item.slug;
            return (
              <li key={item.slug}>
                {item.comingSoon ? (
                  <span className="text-[10px] tracking-[0.2em] text-[#c0c0c0] cursor-default select-none">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={`/shop/${item.slug}`}
                    className={`text-[10px] tracking-[0.2em] transition-all relative py-2.5 block ${
                      isActive
                        ? "text-[#0a0a0a] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[#0a0a0a]"
                        : "text-[#8a8a8a] hover:text-[#0a0a0a]"
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
    </header>
  );
}
