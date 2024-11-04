import { useState, useEffect } from 'react';

export type BreakpointKeys = 'xs' | 'sm' | 'md' | 'lg';

export const breakpoints: Record<BreakpointKeys, number> = {
  xs: 360,
  sm: 768,
  md: 1200,
  lg: 1600,
};

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;

  const isMobile = width < breakpoints.sm;
  const isTablet = width < breakpoints.md;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
