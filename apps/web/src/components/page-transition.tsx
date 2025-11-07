/**
 * Page Transition Wrapper
 *
 * Provides smooth fade-in animations for page transitions
 * Uses CSS animations for better performance
 */

import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'visible'>('fade-in');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fade-in');
      setDisplayLocation(location);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'fade-in') {
      const timer = setTimeout(() => {
        setTransitionStage('visible');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [transitionStage]);

  return (
    <div className={`transition-opacity duration-150 ${transitionStage === 'fade-in' ? 'opacity-0' : 'opacity-100'}`}>
      {children}
    </div>
  );
}
