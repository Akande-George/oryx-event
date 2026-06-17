"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// TripAdvisor-style collage: one large image on the left, a stacked grid of
// the next images on the right, with a "+N" overlay on the last tile when there
// are more. Clicking any tile opens a lightbox.
export default function GalleryCollage({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const pics = images.filter(Boolean);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (pics.length === 0) return null;

  // Single image — just show it.
  if (pics.length === 1) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="relative w-full h-[280px] sm:h-[420px] rounded-2xl overflow-hidden block"
        >
          <Image
            src={pics[0]}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </button>
        {lightbox !== null && (
          <Lightbox
            images={pics}
            index={lightbox}
            setIndex={setLightbox}
            alt={alt}
          />
        )}
      </>
    );
  }

  const side = pics.slice(1, 5); // up to 4 tiles on the right
  const extra = pics.length - 5; // remaining beyond the 5 shown

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-[420px]">
        {/* Main image */}
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="relative rounded-2xl sm:rounded-l-2xl sm:rounded-r-none overflow-hidden h-full"
        >
          <Image
            src={pics[0]}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover hover:scale-[1.02] transition-transform duration-300"
            priority
          />
        </button>

        {/* Right grid */}
        <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-2">
          {side.map((img, i) => {
            const realIndex = i + 1;
            const isLastVisible = i === side.length - 1 && extra > 0;
            return (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setLightbox(realIndex)}
                className="relative overflow-hidden group first:rounded-tr-2xl last:rounded-br-2xl"
              >
                <Image
                  src={img}
                  alt={`${alt} ${realIndex + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
                />
                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-heading font-semibold text-lg">
                    +{extra} more
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox
          images={pics}
          index={lightbox}
          setIndex={setLightbox}
          alt={alt}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  setIndex,
  alt,
}: {
  images: string[];
  index: number;
  setIndex: (i: number | null) => void;
  alt: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight")
        setIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, setIndex]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={() => setIndex(null)}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        onClick={() => setIndex(null)}
        aria-label="Close"
      >
        <X className="w-7 h-7" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 text-white/80 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index - 1 + images.length) % images.length);
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            className="absolute right-4 text-white/80 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index + 1) % images.length);
            }}
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="relative w-full max-w-4xl h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${alt} ${index + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
        />
        <div className="absolute -bottom-8 left-0 right-0 text-center text-white/70 text-sm">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
