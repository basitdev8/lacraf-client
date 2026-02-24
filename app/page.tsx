import Link from "next/link";
import Image from "next/image";
import StoreHeader from "@/components/store/store-header";
import HeroCarousel from "@/components/store/hero-carousel";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/* ── types ─────────────────────────────────────────────── */
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
  _count: { products: number };
}

/* ── data helpers ──────────────────────────────────────── */
async function fetchTrending(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE}/storefront/products?page=1&limit=8`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const list = json.data?.products ?? json.data ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<StoreCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/storefront/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : json.data ?? [];
  } catch {
    return [];
  }
}

/* ── category cards (static) ──────────────────────────── */
const CATEGORIES = [
  {
    label: "SHAWLS",
    href: "/shop/handloom?sub=shawls",
    image: "/images/category-shawls.png",
  },
  {
    label: "HANDICRAFTS",
    href: "/shop/handicraft",
    image: "/images/category-handicrafts.png",
  },
  {
    label: "SPICES",
    href: "/shop/edibles",
    image: "/images/category-spices.png",
  },
];

/* ================================================================ */
export default async function HomePage() {
  const [trending, categories] = await Promise.all([
    fetchTrending(),
    fetchCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <StoreHeader categories={categories} />

      {/* ── 1. Hero Carousel ────────────────────────────── */}
      <HeroCarousel />

      {/* ── 2. Philosophy Quote ──────────────────────────── */}
      <section className="px-6 py-20 md:py-28 max-w-[900px] mx-auto text-center">
        <h2
          className="text-2xl md:text-4xl leading-snug tracking-wide text-[#0a0a0a]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          &ldquo;In an era of the instant, we
          <br className="hidden md:block" /> return to the infinite.&rdquo;
        </h2>
        <p className="mt-6 text-sm text-[#666] leading-relaxed max-w-xl mx-auto">
          A 500-year-old dialogue between the high Himalayas and the human hand.
          We do not just curate objects; we preserve the silence, the patience,
          and the souls of Kashmir&rsquo;s master artisans.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-[#8a8a8a]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-[9px] tracking-[0.25em] uppercase">
            GI Verified Authenticity
          </span>
        </div>
      </section>

      {/* ── 3. Category Cards ────────────────────────────── */}
      <section className="px-6 pb-20 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <Link key={cat.label} href={cat.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-[11px] tracking-[0.2em] text-[#0a0a0a] font-medium">
                {cat.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Masterpiece of the Month ──────────────────── */}
      <section className="bg-[#faf9f7]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto">
            <Image
              src="/images/masterpiece-kani-shawl.png"
              alt="The Royal Kani — Masterpiece of the Month"
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-16">
            <p className="text-[9px] tracking-[0.3em] text-[#8a8a8a] uppercase">
              Masterpiece of the Month
            </p>
            <h3
              className="text-3xl md:text-4xl mt-3 text-[#0a0a0a]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              The Royal Kani
            </h3>

            <div className="mt-8 space-y-5">
              {[
                { label: "ARTISAN", value: "Hasan Raheem" },
                { label: "DURATION", value: "18 Months on the Loom" },
                { label: "QUALITY", value: "Single-Needle Precision" },
              ].map((attr) => (
                <div
                  key={attr.label}
                  className="border-l-2 border-[#d4c9a8] pl-4"
                >
                  <p className="text-[9px] tracking-[0.2em] text-[#8a8a8a] uppercase">
                    {attr.label}
                  </p>
                  <p className="text-base mt-0.5 text-[#0a0a0a] font-medium">
                    {attr.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-[#666] leading-relaxed max-w-md">
              Woven using the &lsquo;Tujis&rsquo; technique, where distinct
              colored wefts are inserted for every change in pattern. A technique
              so complex, it rivals the fineness of painting.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-[0.15em] text-[#0a0a0a] font-medium border-b border-[#0a0a0a] pb-0.5 self-start hover:opacity-60 transition-opacity"
            >
              VIEW THE MASTERPIECE
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Trending Now ──────────────────────────────── */}
      <section className="px-6 py-20 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl md:text-3xl text-[#0a0a0a] italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Trending Now
          </h2>
          <Link
            href="/shop"
            className="text-[10px] tracking-[0.2em] text-[#0a0a0a] border-b border-[#0a0a0a] pb-0.5 hover:opacity-60 transition-opacity"
          >
            VIEW ALL
          </Link>
        </div>

        {trending.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {trending.map((product) => (
              <Link
                key={product.id}
                href={`/shop/product/${product.id}`}
                className="group flex-shrink-0 w-[280px] md:w-[320px]"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
                  {product.images?.[0] && product.images[0].length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#eee]" />
                  )}
                </div>
                <p className="mt-3 text-[11px] tracking-[0.15em] text-[#0a0a0a] uppercase truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-[#666] mt-0.5">
                  &#x20B9;{product.price?.toLocaleString("en-IN")}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          /* Static fallback when no products from API */
          <div className="flex gap-5 overflow-x-auto pb-4">
            {[
              { name: "KASHMIRI PASHMINA", price: "20,000" },
              { name: "VINTAGE COLLECTABLE", price: "20,000" },
              { name: "VINTAGE COLLECTABLE", price: "20,000" },
              { name: "VINTAGE COLLECTABLE", price: "20,000" },
            ].map((item, i) => (
              <Link
                key={i}
                href="/shop"
                className="group flex-shrink-0 w-[280px] md:w-[320px]"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f0ece6]" />
                <p className="mt-3 text-[11px] tracking-[0.15em] text-[#0a0a0a]">
                  {item.name}
                </p>
                <p className="text-[11px] text-[#666] mt-0.5">
                  &#x20B9;{item.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 6. Story / About ─────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 md:px-16 py-16">
          <h2
            className="text-3xl md:text-4xl leading-tight text-[#0a0a0a] italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            LaCraf changes
            <br />
            everything.
          </h2>
          <p className="mt-6 text-sm text-[#666] leading-relaxed max-w-sm">
            We seek out these masters of craft and build a bridge directly from
            their workbench to your doorstep.
          </p>
          <p className="mt-4 text-sm text-[#666] leading-relaxed max-w-sm">
            When you choose an item on our platform, you&rsquo;re not just
            buying an object of beauty; you are becoming part of that
            creator&rsquo;s story.
          </p>
          <Link
            href="/shop"
            className="mt-8 btn-primary text-[11px] tracking-[0.15em] self-start"
          >
            Read Our Story
          </Link>
        </div>

        {/* Image */}
        <div className="relative aspect-[4/5] md:aspect-auto min-h-[400px]">
          <Image
            src="/images/story-artisan-portrait.png"
            alt="Kashmiri artisan in traditional attire"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="border-t border-[#e0e0e0] px-6 py-14 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p
              className="text-2xl text-[#0a0a0a] italic"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Join the Patron&rsquo;s Circle
            </p>
            <p className="text-xs text-[#8a8a8a] mt-1 tracking-wide">
              Receive early access to commissioned pieces and stories from the
              valley.
            </p>
          </div>
          <form className="flex items-center gap-0 border-b border-[#0a0a0a] pb-1">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="text-[10px] tracking-[0.18em] bg-transparent outline-none w-56 placeholder:text-[#8a8a8a]"
            />
            <button
              type="submit"
              className="text-[10px] tracking-[0.18em] font-medium text-[#0a0a0a] hover:opacity-60 transition-opacity ml-4"
            >
              JOIN
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[#e0e0e0] px-6 py-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <p
            className="text-lg tracking-[0.06em]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            LaCraf
          </p>
          <div className="flex gap-16">
            <div>
              <p className="text-[9px] tracking-[0.22em] text-[#8a8a8a] mb-3 font-medium">
                EXPLORE
              </p>
              <ul className="space-y-2">
                {[
                  { label: "SHAWLS", href: "/shop/handloom?sub=shawls" },
                  { label: "HANDLOOMS", href: "/shop/handloom" },
                  { label: "HANDICRAFTS", href: "/shop/handicraft" },
                  { label: "GIFTS", href: "/shop/edibles" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[10px] tracking-[0.15em] text-[#0a0a0a] hover:opacity-60 transition-opacity"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.22em] text-[#8a8a8a] mb-3 font-medium">
                SERVICE
              </p>
              <ul className="space-y-2">
                {[
                  { label: "CLIENT SERVICES", href: "#" },
                  { label: "ARTISAN PORTAL", href: "/login" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[10px] tracking-[0.15em] text-[#0a0a0a] hover:opacity-60 transition-opacity"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="text-[9px] tracking-[0.15em] text-[#8a8a8a] mt-10">
          &copy; {new Date().getFullYear()} LACRAF HERITAGE. BUILT FOR THE
          INFINITE.
        </p>
      </footer>
    </div>
  );
}
