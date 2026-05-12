"use client";

import { useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export default function ProductDetailGallery({ images, title }: Props) {
  const gallery = images?.length
    ? images
    : ["/images/categories/produce/potato.jpg"];
  const [activeImage, setActiveImage] = useState(gallery[0]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        <img
          src={activeImage}
          alt={title}
          className="h-90 w-full object-cover md:h-115"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {gallery.map((image, index) => {
          const isActive = activeImage === image;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`overflow-hidden rounded-2xl border transition ${
                isActive
                  ? "border-emerald-400/50 ring-2 ring-emerald-400/30"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="h-24 w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
