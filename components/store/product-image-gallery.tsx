"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  secureUrl: string;
  sortOrder: number;
}

export default function ProductImageGallery({
  images,
}: {
  images: GalleryImage[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [isZoomed]
  );

  if (images.length === 0) {
    return (
      <div className="w-full bg-[#f5f4f0] aspect-[3/4] md:aspect-auto md:h-full" />
    );
  }

  const activeImage = images[activeIndex];

  return (
    <>
      {/* ── Desktop: Vertical thumbnails + Main image ──────────────── */}
      <div className="hidden md:flex gap-4 h-full">
        {/* Vertical thumbnail strip */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2.5 w-[72px] flex-shrink-0 overflow-y-auto max-h-[85vh] scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-[72px] h-[96px] overflow-hidden transition-all duration-300 ${
                  i === activeIndex
                    ? "ring-1 ring-[#0a0a0a] ring-offset-1"
                    : "opacity-40 hover:opacity-75"
                }`}
              >
                <Image
                  src={img.secureUrl}
                  alt={`View ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image with zoom */}
        <div
          className="relative flex-1 bg-[#f5f4f0] aspect-[3/4] overflow-hidden cursor-crosshair"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Crossfade: render all images, only active is visible */}
          {images.map((img, i) => (
            <div
              key={img.id}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            >
              <Image
                src={img.secureUrl}
                alt={`Product image ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 ease-out"
                style={{
                  transform:
                    isZoomed && i === activeIndex ? "scale(1.8)" : "scale(1)",
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: Swipeable gallery with dots ────────────────────── */}
      <div className="md:hidden">
        {/* Main image */}
        <div className="relative w-full bg-[#f5f4f0] aspect-[3/4] overflow-hidden">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            >
              <Image
                src={img.secureUrl}
                alt={`Product image ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? "w-6 h-1 bg-[#0a0a0a]"
                    : "w-1 h-1 bg-[#c8c4bd] hover:bg-[#8a8a8a]"
                }`}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
