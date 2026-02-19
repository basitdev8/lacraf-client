import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import type { StoreCategory } from "@/app/shop/layout";
import SubcategoryTabs from "@/components/store/subcategory-tabs";
import ProductGrid from "@/components/store/product-grid";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// ── Valid top-level category slugs ─────────────────────────────────────────
const VALID_CATEGORY_SLUGS = ["handicraft", "handloom", "edibles", "gifts"];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  handicraft: "Hand-crafted by master artisans across India.",
  handloom: "Hand-woven by the masters of Srinagar.",
  edibles: "Rare flavours sourced directly from artisan farms.",
  gifts: "Curated gifts from the finest Indian craftspeople.",
};

async function fetchCategoryBySlug(
  slug: string
): Promise<StoreCategory | null> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const categories: StoreCategory[] = Array.isArray(json)
      ? json
      : json.data ?? [];
    return (
      categories.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase()
      ) ?? null
    );
  } catch {
    return null;
  }
}

// ── Gifts coming soon page ─────────────────────────────────────────────────
function GiftsComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
      <p
        className="text-4xl italic text-[#0a0a0a] mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Coming Soon
      </p>
      <p className="text-xs tracking-[0.18em] text-[#8a8a8a] max-w-xs leading-relaxed">
        We are carefully curating a collection of gifts from the finest artisans
        across India. Check back soon.
      </p>
      <Link
        href="/shop/handloom"
        className="mt-8 text-[10px] tracking-[0.2em] border border-[#e0e0e0] px-8 py-3 hover:border-[#0a0a0a] transition-colors"
      >
        EXPLORE HANDLOOMS
      </Link>
    </div>
  );
}

// ── Filter icon ────────────────────────────────────────────────────────────
function FilterIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { category } = await params;
  const { sub } = await searchParams;

  if (!VALID_CATEGORY_SLUGS.includes(category)) {
    notFound();
  }

  // Gifts is a special "coming soon" category
  if (category === "gifts") {
    return <GiftsComingSoon />;
  }

  const categoryData = await fetchCategoryBySlug(category);

  // Resolve display names
  const categoryDisplayName = categoryData?.name ?? category.toUpperCase();
  const activeSubcategory = categoryData?.subcategories.find(
    (s) => s.slug === sub
  ) ?? null;
  const pageTitle = activeSubcategory
    ? activeSubcategory.name.toUpperCase()
    : categoryDisplayName.toUpperCase();
  const description =
    CATEGORY_DESCRIPTIONS[category] ?? "Handmade with care.";

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 pt-5 pb-6">
        <Link
          href="/shop"
          className="text-[9px] tracking-[0.2em] text-[#8a8a8a] hover:text-[#0a0a0a] transition-colors"
        >
          HOME
        </Link>
        <span className="text-[9px] text-[#c0c0c0]">/</span>
        <Link
          href={`/shop/${category}`}
          className={`text-[9px] tracking-[0.2em] transition-colors ${
            !sub
              ? "text-[#0a0a0a]"
              : "text-[#8a8a8a] hover:text-[#0a0a0a]"
          }`}
        >
          {categoryDisplayName.toUpperCase()}
        </Link>
        {activeSubcategory && (
          <>
            <span className="text-[9px] text-[#c0c0c0]">/</span>
            <span className="text-[9px] tracking-[0.2em] text-[#0a0a0a]">
              {activeSubcategory.name.toUpperCase()}
            </span>
          </>
        )}
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl tracking-[0.04em] text-[#0a0a0a] font-light uppercase">
            {pageTitle}
          </h1>
          <p className="text-xs text-[#8a8a8a] mt-1.5 tracking-wide">
            {description}
          </p>
        </div>

        {/* Filter button (decorative — extend for attribute filters later) */}
        <button className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#0a0a0a] hover:opacity-60 transition-opacity mt-1">
          <FilterIcon />
          Filter
        </button>
      </div>

      {/* Subcategory tabs */}
      {categoryData && categoryData.subcategories.length > 0 && (
        <div className="mb-8">
          <Suspense fallback={null}>
            <SubcategoryTabs
              subcategories={categoryData.subcategories}
              activeSlug={sub ?? null}
            />
          </Suspense>
        </div>
      )}

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
          categorySlug={category}
          subcategorySlug={sub}
        />
      </Suspense>
    </div>
  );
}

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const name =
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return {
    title: `${name} — LaCraf`,
    description: CATEGORY_DESCRIPTIONS[category] ?? "Handmade Indian crafts.",
  };
}
