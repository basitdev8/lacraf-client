"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { StoreSubcategory } from "@/app/shop/layout";

interface SubcategoryTabsProps {
  subcategories: StoreSubcategory[];
  activeSlug: string | null;
}

export default function SubcategoryTabs({
  subcategories,
  activeSlug,
}: SubcategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set("sub", slug);
      } else {
        params.delete("sub");
      }
      // Reset page on filter change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  if (subcategories.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        onClick={() => navigate(null)}
        className={`text-[9px] tracking-[0.2em] px-3 py-1.5 border transition-all ${
          !activeSlug
            ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
            : "border-[#e0e0e0] text-[#8a8a8a] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
        }`}
      >
        ALL
      </button>
      {subcategories.map((sub) => {
        const isActive = activeSlug === sub.slug;
        return (
          <button
            key={sub.id}
            onClick={() => navigate(sub.slug)}
            className={`text-[9px] tracking-[0.2em] px-3 py-1.5 border transition-all ${
              isActive
                ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                : "border-[#e0e0e0] text-[#8a8a8a] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
            }`}
          >
            {sub.name.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
