import Link from "next/link";
import { CraftJourneyStage } from "@/lib/types";

// Human-readable labels for production stages
const STAGE_LABELS: Record<string, string> = {
  WOOL_COLLECTION: "Wool Collection",
  CLEANING: "Cleaning & Refining",
  SPINNING: "Hand Spinning",
  WEAVING: "Weaving",
  DYEING: "Natural Dyeing",
  EMBROIDERY: "Embroidery",
  FINISHING: "Finishing",
  OTHER: "Craft Stage",
};

// Minimal SVG icons per stage
function StageIcon({ stage }: { stage: string }) {
  switch (stage) {
    case "WOOL_COLLECTION":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="9" /><path d="M8 12c0-4 8-4 8 0s-8 4-8 0" />
        </svg>
      );
    case "SPINNING":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
        </svg>
      );
    case "WEAVING":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18" />
        </svg>
      );
    case "EMBROIDERY":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" />
        </svg>
      );
  }
}

interface CraftJourneyTimelineProps {
  stages: CraftJourneyStage[];
}

export function CraftJourneyTimeline({ stages }: CraftJourneyTimelineProps) {
  if (!stages.length) return null;

  return (
    <section className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[9px] tracking-[0.4em] text-[#9a9a9a] uppercase mb-3">
          The Craft Journey
        </p>
        <div className="w-8 h-px bg-[#d8d6d3] mx-auto mb-6" />
        <p className="text-[12px] leading-[1.9] text-[#6a6a6a] tracking-[0.02em] max-w-[520px] mx-auto">
          Every piece passes through the hands of multiple master artisans.
          Each stage represents generations of inherited skill.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[27px] top-8 bottom-8 w-px bg-[#e0deda] hidden md:block" />

        <div className="space-y-0">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative flex gap-6 md:gap-10 pb-10 last:pb-0">
              {/* Stage number + icon */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 border border-[#e0deda] bg-white flex flex-col items-center justify-center gap-1 relative z-10">
                  <span className="text-[8px] tracking-[0.2em] text-[#b0b0b0] uppercase">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="text-[#6a6a6a]">
                    <StageIcon stage={stage.productionStage} />
                  </div>
                </div>
              </div>

              {/* Stage content */}
              <div className="flex-1 pt-2 pb-2">
                {/* Stage name + production stage label */}
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <h4 className="text-[13px] tracking-[0.06em] text-[#0a0a0a] font-medium">
                    {stage.stageName}
                  </h4>
                  <span className="text-[8px] tracking-[0.18em] text-[#9a9a9a] uppercase border border-[#e8e6e3] px-2 py-0.5">
                    {STAGE_LABELS[stage.productionStage] ?? stage.productionStage}
                  </span>
                </div>

                {/* Contribution note */}
                {stage.contributionNote && (
                  <p className="text-[11px] leading-[1.8] text-[#6a6a6a] tracking-[0.02em] mb-3 max-w-md">
                    {stage.contributionNote}
                  </p>
                )}

                {/* Artisan attribution */}
                {stage.artisan && (
                  <Link
                    href={`/shop/artisan/${stage.artisan.id}`}
                    className="inline-flex items-center gap-2 group"
                  >
                    <div className="w-5 h-5 bg-[#eae8e4] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[7px] text-[#6a6a6a] font-medium">
                        {stage.artisan.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] tracking-[0.08em] text-[#3a3a3a] group-hover:opacity-60 transition-opacity">
                        {stage.artisan.fullName}
                      </span>
                      {(stage.artisan.artisanRole || stage.artisan.shop?.shopName) && (
                        <span className="text-[9px] text-[#9a9a9a] ml-1.5">
                          · {stage.artisan.artisanRole ?? stage.artisan.shop?.shopName}
                        </span>
                      )}
                    </div>
                  </Link>
                )}

                {/* Input material used */}
                {stage.inputProduct && (
                  <div className="mt-2 flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-[9px] tracking-[0.1em] text-[#9a9a9a] uppercase">
                      Input:&nbsp;
                    </span>
                    <Link
                      href={`/shop/product/${stage.inputProduct.id}`}
                      className="text-[9px] tracking-[0.08em] text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors border-b border-[#e0deda]"
                    >
                      {stage.inputProduct.title}
                    </Link>
                  </div>
                )}
              </div>

              {/* Connector dot between stages */}
              {index < stages.length - 1 && (
                <div className="absolute left-[27px] bottom-0 w-px h-10 bg-[#e0deda] hidden md:block translate-x-[-0.5px]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
