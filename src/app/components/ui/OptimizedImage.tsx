"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  className?: string
  priority?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "",
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imageRef.current || priority) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )

    observer.observe(imageRef.current)
    return () => observer.disconnect()
  }, [priority])

  // Generate a tiny placeholder
  const blurUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg width='${width || 100}' height='${height || 100}' 
     xmlns='http://www.w3.org/2000/svg'>
     <rect width='100%' height='100%' fill='#f3f4f6'/>
     </svg>`
  )}`

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? { width: '100%', height: '100%' } : undefined}
    >
      {/* Blur placeholder */}
      <div
        className={`absolute inset-0 bg-gray-100 transition-opacity duration-500 ${
          isLoading ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${blurUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Main image */}
      {(isInView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          className={`transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoadingComplete={() => setIsLoading(false)}
          priority={priority}
        />
      )}
    </div>
  )
}
