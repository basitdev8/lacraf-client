"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface HeroSlide {
  image: string;
  alt: string;
  title: string;
  subtitle?: string;
}

const SLIDES: HeroSlide[] = [
  {
    image: "/images/hero-carousel-1.png",
    alt: "Artisan weaving on a traditional loom",
    title: "Volume I: The Heritage Edit",
  },
  {
    image: "/images/hero-carousel-2.png",
    alt: "Kashmiri pashmina shawl craftsmanship",
    title: "The Art of Pashmina",
  },
  {
    image: "/images/hero-carousel-3.png",
    alt: "Handcrafted copper work from Kashmir",
    title: "Crafted by Hand, Kept by Heart",
  },
];

const INTERVAL = 5000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [current, isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  /* Auto-advance */
  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[calc(100vh-96px)] w-full overflow-hidden">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Slide indicator */}
      <span className="absolute top-6 left-6 text-[11px] text-white/70 tracking-wide z-20">
        [{String(current + 1).padStart(2, "0")}]
      </span>

      {/* Hero text */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 text-center text-white z-20">
        <h1
          className="text-3xl md:text-4xl italic tracking-wide transition-opacity duration-500"
          style={{ fontFamily: "var(--font-serif)" }}
          key={current}
        >
          {SLIDES[current].title}
        </h1>
        <div className="mt-5 flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-[0.25em] uppercase">
            Discover
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="animate-bounce"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-[2px] transition-all duration-300 ${i === current
                ? "w-6 bg-white"
                : "w-3 bg-white/40 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
