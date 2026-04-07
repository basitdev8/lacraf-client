"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TIERS = [
  { label: "All", value: "" },
  { label: "Bronze+", value: "BRONZE" },
  { label: "Silver+", value: "SILVER" },
  { label: "Gold", value: "GOLD" },
] as const;

interface TrustFilterPillsProps {
  activeTier?: string;
}

export default function TrustFilterPills({ activeTier = "" }: TrustFilterPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setTier = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("trustTier", value);
      } else {
        params.delete("trustTier");
      }
      // Reset to page 1 on filter change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[8px] tracking-[0.2em] text-[#9a9a9a] uppercase mr-1">
        Trust
      </span>
      {TIERS.map((tier) => {
        const isActive = activeTier === tier.value;
        return (
          <button
            key={tier.value}
            onClick={() => setTier(tier.value)}
            className={`text-[8px] tracking-[0.15em] px-3 py-1 border transition-colors uppercase ${
              isActive
                ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                : "border-[#e0e0e0] text-[#5a5a5a] hover:border-[#0a0a0a]"
            }`}
          >
            {tier.label}
          </button>
        );
      })}
    </div>
  );
}
