'use client';

import { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "",
  priority = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Build SVG string for the blur placeholder using plain string concatenation
  const svgString = "<svg width=\"" + (width || 100) + "\" height=\"" + (height || 100) +
    "\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100%\" height=\"100%\" fill=\"#f3f4f6\"/></svg>";
  const blurDataURL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={fill ? { width: "100%", height: "100%" } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes || "100vw"}
        className={`transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
      />
    </div>
  );
}
