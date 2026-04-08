"use client";

import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import ProductGrid from "@/components/store/product-grid";

type StageFilter = {
  label: string;
  value: string;
  description: string;
};

const STAGE_FILTERS: StageFilter[] = [
  { label: "All Materials", value: "", description: "Every raw and semi-finished material" },
  { label: "Raw Wool", value: "WOOL_COLLECTION", description: "Unprocessed fibre from the source" },
  { label: "Cleaned Fibre", value: "CLEANING", description: "Washed and prepared wool" },
  { label: "Hand-Spun Thread", value: "SPINNING", description: "Spun on the traditional charkha" },
  { label: "Natural Dyes", value: "DYEING", description: "Plant and mineral colour baths" },
  { label: "Woven Base", value: "WEAVING", description: "Half-finished woven fabrics" },
  { label: "Embroidery Bases", value: "EMBROIDERY", description: "Pre-embroidery foundations" },
  { label: "Other", value: "OTHER", description: "Other craft inputs" },
];

const PRODUCT_TYPE_TABS = [
  { label: "All", value: "" },
  { label: "Raw", value: "RAW" },
  { label: "Semi-Finished", value: "SEMI_FINISHED" },
];

export default function RawMaterialsPage() {
  const [activeStage, setActiveStage] = useState("");
  const [activeType, setActiveType] = useState("");

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 pt-5 pb-6">
        <Link href="/shop" className="text-[9px] tracking-[0.2em] text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors">
          HOME
        </Link>
        <span className="text-[9px] text-[#c0c0c0]">/</span>
        <span className="text-[9px] tracking-[0.2em] text-[#0a0a0a]">RAW MATERIALS</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl tracking-[0.04em] text-[#0a0a0a] font-light uppercase mb-2">
          Raw Materials Marketplace
        </h1>
        <p className="text-xs text-[#8a8a8a] tracking-wide max-w-lg">
          Source authentic Kashmiri raw materials and semi-finished goods directly from artisan suppliers.
          Every fibre, thread and dye batch is traceable to its origin.
        </p>
      </div>

      {/* B2B notice strip */}
      <div className="border border-[#e0deda] bg-[#faf9f7] px-6 py-4 mb-8 flex items-start gap-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="1.2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
        <div>
          <p className="text-[10px] tracking-[0.12em] text-[#3a3a3a] font-medium mb-0.5">
            ARTISAN-TO-ARTISAN MARKETPLACE
          </p>
          <p className="text-[11px] leading-[1.7] text-[#6a6a6a]">
            This marketplace is designed for artisans sourcing inputs for their craft.
            Raw and semi-finished materials listed here can be incorporated into finished products sold on LaCraf.
          </p>
        </div>
      </div>

      {/* Product type tabs */}
      <div className="flex gap-1 mb-6">
        {PRODUCT_TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveType(tab.value)}
            className={`text-[9px] tracking-[0.18em] px-4 py-2 border transition-colors ${
              activeType === tab.value
                ? "border-[#0a0a0a] text-[#0a0a0a] bg-[#0a0a0a] text-white"
                : "border-[#e0e0e0] text-[#6a6a6a] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
            }`}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STAGE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveStage(f.value)}
            title={f.description}
            className={`text-[9px] tracking-[0.15em] px-3 py-1.5 border transition-colors ${
              activeStage === f.value
                ? "border-[#0a0a0a] text-[#0a0a0a] bg-[#f5f4f0]"
                : "border-[#e8e6e3] text-[#8a8a8a] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
            }`}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full bg-[#e8e5e0] aspect-[3/4]" />
                <div className="mt-2.5 space-y-1.5">
                  <div className="h-2 bg-[#e8e5e0] w-3/4" />
                  <div className="h-2 bg-[#e8e5e0] w-1/3" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ProductGrid
          productType={activeType || undefined}
          productionStage={activeStage || undefined}
        />
      </Suspense>
    </div>
  );
}
