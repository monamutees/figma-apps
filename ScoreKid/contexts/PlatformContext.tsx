import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Theme, detectPlatform, getThemeForPlatform, isMobile, isTouch, setupMobileViewport } from '../utils/platformDetection';

interface PlatformContextType {
  platform: Platform;
  theme: Theme;
  isMobile: boolean;
  isTouch: boolean;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  screenDimensions: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    innerWidth: number;
    innerHeight: number;
  };
  isLandscape: boolean;
  devicePixelRatio: number;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

interface PlatformProviderProps {
  children: ReactNode;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  const [platform, setPlatform] = useState<Platform>('web');
  const [theme, setTheme] = useState<Theme>('web');
  const [mobile, setMobile] = useState(false);
  const [touch, setTouch] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });
  const [screenDimensions, setScreenDimensions] = useState({
    width: 0,
    height: 0,
    availWidth: 0,
    availHeight: 0,
    innerWidth: 0,
    innerHeight: 0
  });

  const updateDimensions = () => {
    if (typeof window === 'undefined') return;
    
    setScreenDimensions({
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    });
    
    setIsLandscape(window.innerWidth > window.innerHeight);
    setDevicePixelRatio(window.devicePixelRatio || 1);
  };

  const updateSafeArea = () => {
    if (typeof window === 'undefined') return;
    
    const style = getComputedStyle(document.documentElement);
    setSafeAreaInsets({
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    });
  };

  useEffect(() => {
    const detectedPlatform = detectPlatform();
    const detectedTheme = getThemeForPlatform(detectedPlatform);
    const detectedMobile = isMobile();
    const detectedTouch = isTouch();

    setPlatform(detectedPlatform);
    setTheme(detectedTheme);
    setMobile(detectedMobile);
    setTouch(detectedTouch);

    // Apply platform class to document
    const classes = [`platform-${detectedPlatform}`, `theme-${detectedTheme}`];
    
    if (detectedMobile) {
      classes.push('mobile');
    }
    
    if (detectedTouch) {
      classes.push('touch');
    }
    
    document.documentElement.className = classes.join(' ');

    // Initial measurements
    updateDimensions();
    updateSafeArea();

    // Set up mobile viewport if needed
    if (detectedMobile) {
      setupMobileViewport();
    }

    // Monitor dimension changes
    const handleResize = () => {
      updateDimensions();
      updateSafeArea();
      
      // Re-check mobile status on resize (for desktop browser resize)
      const currentlyMobile = isMobile();
      if (currentlyMobile !== mobile) {
        setMobile(currentlyMobile);
        
        if (currentlyMobile) {
          document.documentElement.classList.add('mobile');
          setupMobileViewport();
        } else {
          document.documentElement.classList.remove('mobile');
        }
      }
    };

    const handleOrientationChange = () => {
      // Delay to allow orientation change to complete
      setTimeout(() => {
        updateDimensions();
        updateSafeArea();
        setupMobileViewport();
      }, 100);
    };

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Listen for safe area changes (iOS dynamic island, etc.)
    const resizeObserver = new ResizeObserver(() => {
      updateSafeArea();
    });
    resizeObserver.observe(document.documentElement);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      resizeObserver.disconnect();
    };
  }, [mobile]);

  // Debug info in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Platform Debug Info:', {
        platform,
        theme,
        isMobile: mobile,
        isTouch: touch,
        isLandscape,
        devicePixelRatio,
        screenDimensions,
        safeAreaInsets,
        userAgent: navigator.userAgent,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        screenSize: `${window.screen.width}x${window.screen.height}`
      });
    }
  }, [platform, theme, mobile, touch, isLandscape, devicePixelRatio, screenDimensions, safeAreaInsets]);

  const value: PlatformContextType = {
    platform,
    theme,
    isMobile: mobile,
    isTouch: touch,
    safeAreaInsets,
    screenDimensions,
    isLandscape,
    devicePixelRatio
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};