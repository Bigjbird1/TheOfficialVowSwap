"use client"

import { useEffect, useRef, useState } from 'react'

interface VirtualGridProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  className?: string
  columnCount?: number
  rowHeight?: number
  overscanCount?: number
}

export default function VirtualGrid<T>({
  items,
  renderItem,
  className = "",
  columnCount = 4,
  rowHeight = 400,
  overscanCount = 3
}: VirtualGridProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastScrollTop = useRef(0)

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${overscanCount * rowHeight}px 0px`,
      threshold: 0
    }

    const updateVisibleRange = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight
      const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up'
      
      // Calculate visible range based on scroll position
      const rowCount = Math.ceil(items.length / columnCount)
      const visibleRowStart = Math.floor(scrollTop / rowHeight)
      const visibleRowCount = Math.ceil(viewportHeight / rowHeight)
      
      // Add overscan rows
      const start = Math.max(0, visibleRowStart - overscanCount)
      const end = Math.min(
        rowCount,
        visibleRowStart + visibleRowCount + overscanCount
      )
      
      setVisibleRange({
        start: start * columnCount,
        end: Math.min(end * columnCount, items.length)
      })

      lastScrollTop.current = scrollTop
    }

    // Setup intersection observer for triggering updates
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        updateVisibleRange()
      }
    }, options)

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current)
    }

    // Add scroll listener for continuous updates
    window.addEventListener('scroll', updateVisibleRange, { passive: true })
    window.addEventListener('resize', updateVisibleRange, { passive: true })

    // Initial update
    updateVisibleRange()

    return () => {
      window.removeEventListener('scroll', updateVisibleRange)
      window.removeEventListener('resize', updateVisibleRange)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [items.length, columnCount, rowHeight, overscanCount])

  // Calculate total height to maintain scroll position
  const totalHeight = Math.ceil(items.length / columnCount) * rowHeight

  return (
    <div ref={containerRef} className={className}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: Math.floor(visibleRange.start / columnCount) * rowHeight,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            gap: '1rem',
            transform: 'translateZ(0)',
            willChange: 'transform',
            contain: 'content'
          }}
        >
          {items
            .slice(visibleRange.start, visibleRange.end)
            .map((item, index) => (
              <div
                key={visibleRange.start + index}
                style={{
                  height: rowHeight,
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  contain: 'layout style paint'
                }}
              >
                {renderItem(item)}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
