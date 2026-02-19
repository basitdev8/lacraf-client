"use client";

import { useState } from "react";
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

  if (images.length === 0) {
    return (
      <div className="w-full bg-[#c8c4bd] aspect-[3/4] md:aspect-auto md:h-full" />
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full bg-[#c8c4bd] aspect-[3/4] overflow-hidden">
        <Image
          src={activeImage.secureUrl}
          alt={`Product image ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-14 h-14 bg-[#c8c4bd] overflow-hidden transition-all ${
                i === activeIndex
                  ? "ring-1 ring-[#0a0a0a]"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={img.secureUrl}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
