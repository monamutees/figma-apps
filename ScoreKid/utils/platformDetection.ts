export type Platform = 'ios' | 'android' | 'web';
export type Theme = 'material' | 'cupertino' | 'web';

/**
 * Detects the current platform based on user agent and other indicators
 */
export const detectPlatform = (): Platform => {
  if (typeof window === 'undefined') {
    return 'web';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  
  // Check for PWA or app context
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  
  if (isIOS || (isStandalone && userAgent.includes('webkit'))) {
    return 'ios';
  }
  
  if (isAndroid || (isStandalone && userAgent.includes('chrome'))) {
    return 'android';
  }
  
  return 'web';
};

/**
 * Gets the appropriate theme based on platform
 */
export const getThemeForPlatform = (platform: Platform): Theme => {
  switch (platform) {
    case 'ios':
      return 'cupertino';
    case 'android':
      return 'material';
    default:
      return 'web';
  }
};

/**
 * Checks if the current device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check screen size first
  const screenWidth = window.screen.width;
  const viewportWidth = window.innerWidth;
  const isMobileSize = Math.min(screenWidth, viewportWidth) <= 768;
  
  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
  
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check CSS media query
  const isMobileMedia = window.matchMedia('(max-width: 768px)').matches;
  
  return isMobileSize || isMobileUA || (hasTouch && isMobileMedia);
};

/**
 * Checks if device supports touch
 */
export const isTouch = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
};

/**
 * Gets safe area insets for notched devices
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

/**
 * Gets the appropriate haptic feedback for the platform
 */
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
  if (typeof window === 'undefined') return;
  
  const platform = detectPlatform();
  
  // iOS Haptic Feedback
  if (platform === 'ios' && 'navigator' in window && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [20, 50, 20, 50, 20]
    };
    
    navigator.vibrate(patterns[type]);
  }
  
  // Android Haptic Feedback
  if (platform === 'android' && 'navigator' in window && 'vibrate' in navigator) {
    const patterns = {
      light: [5],
      medium: [15],
      heavy: [25],
      success: [5, 25, 5],
      error: [15, 25, 15, 25, 15]
    };
    
    navigator.vibrate(patterns[type]);
  }
};

/**
 * Sets up the viewport meta tag for mobile optimization
 */
export const setupMobileViewport = () => {
  if (typeof document === 'undefined') return;
  
  const platform = detectPlatform();
  const mobile = isMobile();
  
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  
  if (mobile) {
    if (platform === 'ios') {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no');
    } else if (platform === 'android') {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, shrink-to-fit=no');
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }
  } else {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
};

/**
 * Gets the device pixel ratio
 */
export const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

/**
 * Gets screen dimensions
 */
export const getScreenDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, availWidth: 0, availHeight: 0, innerWidth: 0, innerHeight: 0 };
  }
  
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  };
};