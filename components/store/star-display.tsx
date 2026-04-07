"use client";

// ── StarDisplay ────────────────────────────────────────────────────────────
// ~30 lines: renders 5 stars (filled/partial/empty) + optional count.
// No external library.

interface StarDisplayProps {
  rating: number;    // 0–5, supports decimals
  count?: number;
  showCount?: boolean;
  size?: "sm" | "md";
}

export function StarDisplay({ rating, count, showCount = true, size = "sm" }: StarDisplayProps) {
  const starSize = size === "md" ? 14 : 11;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.min(1, Math.max(0, rating - (i - 1)));
          const pct = Math.round(fill * 100);
          const id = `star-grad-${rating}-${i}`;

          return (
            <svg
              key={i}
              width={starSize}
              height={starSize}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${pct}%`} stopColor="#c9a400" />
                  <stop offset={`${pct}%`} stopColor="#e8e6e3" />
                </linearGradient>
              </defs>
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={`url(#${id})`}
                stroke="#c9a400"
                strokeWidth="1"
              />
            </svg>
          );
        })}
      </span>
      {showCount && count !== undefined && (
        <span className="text-[9px] tracking-[0.08em] text-[#8a8a8a]">
          ({count})
        </span>
      )}
    </span>
  );
}
