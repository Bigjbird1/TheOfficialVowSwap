import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint: Breakpoint = 'xs';

      // Determine current breakpoint
      Object.entries(breakpoints).forEach(([key, value]) => {
        if (width >= value) {
          newBreakpoint = key as Breakpoint;
        }
      });

      setBreakpoint(newBreakpoint);
      setIsMobile(width < breakpoints.md); // Consider mobile if less than 'md' breakpoint
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  };
};
