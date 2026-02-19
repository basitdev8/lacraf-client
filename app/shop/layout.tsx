import type { ReactNode } from "react";
import StoreHeader from "@/components/store/store-header";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface StoreSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: StoreSubcategory[];
  _count: { products: number };
}

async function fetchCategories(): Promise<StoreCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // API wraps response in { data: [...] }
    return Array.isArray(json) ? json : json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  const categories = await fetchCategories();

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader categories={categories} />
      <main>{children}</main>

      {/* Newsletter */}
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

      {/* Footer */}
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
                  { label: "EDIBLES", href: "/shop/edibles" },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[10px] tracking-[0.15em] text-[#0a0a0a] hover:opacity-60 transition-opacity"
                    >
                      {l.label}
                    </a>
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
                    <a
                      href={l.href}
                      className="text-[10px] tracking-[0.15em] text-[#0a0a0a] hover:opacity-60 transition-opacity"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="text-[9px] tracking-[0.15em] text-[#8a8a8a] mt-10">
          © {new Date().getFullYear()} LACRAF HERITAGE. BUILT FOR THE INFINITE.
        </p>
      </footer>
    </div>
  );
}
