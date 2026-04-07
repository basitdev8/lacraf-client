"use client";

// ── TrustBadge ─────────────────────────────────────────────────────────────
// Renders a tier pill (Bronze / Silver / Gold). Renders nothing for NONE/null.

const TIER_CONFIG = {
  BRONZE: {
    label: "Bronze",
    bg: "bg-[#cd7f3220]",
    border: "border-[#cd7f32]",
    text: "text-[#7a4a1e]",
    tooltip: "This artisan has a solid trust score backed by verified orders and customer reviews.",
  },
  SILVER: {
    label: "Silver",
    bg: "bg-[#c0c0c020]",
    border: "border-[#9a9a9a]",
    text: "text-[#505050]",
    tooltip: "This artisan has a high trust score with consistently positive reviews and reliable delivery.",
  },
  GOLD: {
    label: "Gold",
    bg: "bg-[#ffd70020]",
    border: "border-[#c9a400]",
    text: "text-[#7a6000]",
    tooltip: "This artisan is among our most trusted — excellent reviews, verified certifications, and a strong track record.",
  },
} as const;

type Tier = "NONE" | "BRONZE" | "SILVER" | "GOLD" | null | undefined;
type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-[7px] px-1.5 py-0.5",
  md: "text-[9px] px-2.5 py-1",
  lg: "text-[11px] px-3 py-1.5",
};

interface TrustBadgeProps {
  tier: Tier;
  size?: Size;
}

export function TrustBadge({ tier, size = "md" }: TrustBadgeProps) {
  if (!tier || tier === "NONE") return null;

  const config = TIER_CONFIG[tier];
  if (!config) return null;

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center gap-1 border rounded-full tracking-[0.12em] font-medium uppercase cursor-default select-none ${config.bg} ${config.border} ${config.text} ${SIZE_CLASSES[size]}`}
    >
      <span className="inline-block w-1 h-1 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}

// ── CertBadge ──────────────────────────────────────────────────────────────
// Renders a cert badge with distinct icon and specific tooltip copy.

type CertType = "business" | "gov";

const CERT_CONFIG: Record<CertType, { label: string; tooltip: string }> = {
  business: {
    label: "Business Certified",
    tooltip: "This artisan's business identity has been verified by LaCraf — registered entity, KYC-approved.",
  },
  gov: {
    label: "Gov Recognized",
    tooltip: "This artisan holds a GST registration recognized by the Government of India.",
  },
};

interface CertBadgeProps {
  type: CertType;
  size?: Size;
}

export function CertBadge({ type, size = "md" }: CertBadgeProps) {
  const config = CERT_CONFIG[type];

  const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;

  const Icon =
    type === "gov" ? (
      // Shield icon — Government Recognized
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ) : (
      // Checkmark-circle icon — Business Certified
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center gap-1.5 border border-[#0a0a0a20] bg-[#0a0a0a06] text-[#3a3a3a] rounded cursor-default select-none ${SIZE_CLASSES[size]} tracking-[0.1em]`}
    >
      {Icon}
      <span className="uppercase">{config.label}</span>
    </span>
  );
}
