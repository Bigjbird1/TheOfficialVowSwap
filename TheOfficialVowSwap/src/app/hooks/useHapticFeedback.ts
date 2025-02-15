'use client';

import { useEffect, useState } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const useHapticFeedback = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('vibrate' in navigator || 'webkitVibrate' in navigator);
  }, []);

  const triggerHaptic = (type: HapticType) => {
    if (!isSupported) return;

    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200],
      success: [100, 50, 100],
      warning: [200, 100, 200],
      error: [300, 100, 300]
    };

    const vibrationPattern = patterns[type] || patterns.light;
    navigator.vibrate(vibrationPattern);
  };

  return { triggerHaptic };
};
