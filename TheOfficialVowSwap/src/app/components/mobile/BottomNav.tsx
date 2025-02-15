'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBreakpoint } from '@/app/hooks/useBreakpoint';
import { useHapticFeedback } from '@/app/hooks/useHapticFeedback';
import { useSwipe } from '@/app/hooks/useSwipe';
import type { TouchEvent } from 'react';

interface SwipeHandlers {
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  ariaLabel?: string;
}

const BottomNav = () => {
  const pathname = usePathname();
  const { isMobile } = useBreakpoint();
  const { triggerHaptic } = useHapticFeedback();
  const router = useRouter();

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      triggerHaptic('light');
      router.back();
    },
    onSwipeRight: () => {
      triggerHaptic('light');
      router.forward();
    },
    threshold: 100
  });

  // Don't render on desktop
  if (!isMobile) return null;

  const navItems: NavItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      ariaLabel: 'Navigate to home page',
    },
    {
      label: 'Search',
      path: '/products',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      label: 'Registry',
      path: '/registry',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: 'Visualize',
      path: '/ar-vr',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      ariaLabel: 'Visualize wedding setups in AR/VR',
    },
    {
      label: 'Account',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      ariaLabel: 'Navigate to account dashboard',
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Main navigation"
    >
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                isActive ? 'text-primary-600 scale-110' : 'text-gray-600 hover:scale-105'
              }`}
              onClick={() => triggerHaptic('light')}
              aria-label={item.ariaLabel}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
