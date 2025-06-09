import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext';
import { Auth } from './components/Auth';
import { MainApp } from './components/MainApp';
import { Toaster } from './components/ui/sonner';
import { initDataMigration } from './utils/migrateLegacyData';
import { setupMobileViewport } from './utils/platformDetection';
import { MobileLayout } from './components/MobileNavigation';

// PWA Installation utility
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Create manifest as data URL to avoid 404 errors
const createManifestDataUrl = () => {
  const manifest = {
    name: "ScoreKid - Marcador Deportivo",
    short_name: "ScoreKid",
    description: "Aplicación de marcador deportivo para seguir los partidos de tus hijos",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#007AFF",
    orientation: "portrait-primary",
    scope: "/",
    lang: "es-ES",
    categories: ["sports", "lifestyle", "productivity"],
    icons: [
      {
        src: "data:image/svg+xml;base64," + btoa(`
          <svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
            <rect width="192" height="192" rx="24" fill="#007AFF"/>
            <circle cx="96" cy="96" r="60" fill="white"/>
            <text x="96" y="110" text-anchor="middle" fill="#007AFF" font-size="48" font-weight="bold" font-family="system-ui">⚽</text>
          </svg>
        `),
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "data:image/svg+xml;base64," + btoa(`
          <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" rx="64" fill="#007AFF"/>
            <circle cx="256" cy="256" r="160" fill="white"/>
            <text x="256" y="290" text-anchor="middle" fill="#007AFF" font-size="128" font-weight="bold" font-family="system-ui">⚽</text>
          </svg>
        `),
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      }
    ],
    shortcuts: [
      {
        name: "Nuevo Partido",
        short_name: "Nuevo",
        description: "Iniciar un nuevo partido",
        url: "/?action=new-match",
        icons: [
          {
            src: "data:image/svg+xml;base64," + btoa(`
              <svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
                <rect width="192" height="192" rx="24" fill="#34C759"/>
                <text x="96" y="110" text-anchor="middle" fill="white" font-size="48" font-weight="bold" font-family="system-ui">+</text>
              </svg>
            `),
            sizes: "192x192",
            type: "image/svg+xml"
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  };
  
  return "data:application/json;base64," + btoa(JSON.stringify(manifest));
};

// Set up viewport and PWA meta tags immediately when the module loads
if (typeof document !== 'undefined') {
  // Create or update viewport meta tag immediately
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  
  // Set a mobile-optimized viewport by default
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no');
  
  // Add mobile-specific meta tags
  const metaTags = [
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'ScoreKid' },
    { name: 'application-name', content: 'ScoreKid' },
    { name: 'msapplication-TileColor', content: '#007AFF' },
    { name: 'theme-color', content: '#007AFF' },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-status-bar-style', content: 'black-translucent' }
  ];
  
  metaTags.forEach(({ name, content }) => {
    try {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    } catch (error) {
      console.warn(`Failed to set meta tag ${name}:`, error);
    }
  });

  // Add manifest link with data URL to avoid 404
  try {
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.setAttribute('rel', 'manifest');
      manifest.setAttribute('href', createManifestDataUrl());
      document.head.appendChild(manifest);
    }
  } catch (error) {
    console.warn('Failed to add manifest link:', error);
  }

  // Add Apple touch icon as data URL
  try {
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      appleIcon.setAttribute('href', "data:image/svg+xml;base64," + btoa(`
        <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          <rect width="180" height="180" rx="20" fill="#007AFF"/>
          <circle cx="90" cy="90" r="56" fill="white"/>
          <text x="90" y="105" text-anchor="middle" fill="#007AFF" font-size="45" font-weight="bold" font-family="system-ui">⚽</text>
        </svg>
      `));
      document.head.appendChild(appleIcon);
    }
  } catch (error) {
    console.warn('Failed to add apple touch icon:', error);
  }
  
  // Add CSS to prevent zoom while loading
  const style = document.createElement('style');
  style.textContent = `
    @viewport {
      width: device-width;
      initial-scale: 1.0;
      maximum-scale: 1.0;
      user-scalable: no;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    
    body {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
    }
    
    /* Loading state styles */
    .app-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-size: 16px;
      background: #ffffff;
    }
    
    @media (prefers-color-scheme: dark) {
      .app-loading {
        background: #000000;
        color: #ffffff;
      }
    }
    
    /* Error boundary styles */
    .app-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      text-align: center;
      background: #ffffff;
    }
    
    @media (prefers-color-scheme: dark) {
      .app-error {
        background: #000000;
        color: #ffffff;
      }
    }

    /* PWA Install banner */
    .pwa-install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #007AFF;
      color: white;
      padding: 16px;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .pwa-install-banner.show {
      transform: translateY(0);
    }
    
    .pwa-install-banner button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s ease;
    }
    
    .pwa-install-banner button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .pwa-install-banner button:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(style);
}

// PWA Installation Hook
const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any)?.standalone ||
                           document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: appinstalled event fired');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // For development/testing, also show install option if not installed
    const timer = setTimeout(() => {
      if (!isInstalled && 'serviceWorker' in navigator) {
        setIsInstallable(true);
      }
    }, 2000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      // Fallback: show instructions for manual installation
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    installApp
  };
};

// PWA Install Banner Component
const PWAInstallBanner: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      // Show banner after a delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000); // Increased delay to 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowBanner(false);
    } else {
      // Show manual installation instructions
      setShowInstructions(true);
      setTimeout(() => {
        setShowInstructions(false);
      }, 8000);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
      
      if (hoursSinceDismissed < 24) {
        setShowBanner(false);
        return;
      }
    }
  }, []);

  if (showInstructions) {
    return (
      <div className={`pwa-install-banner show`} style={{ background: '#34C759' }}>
        <div style={{ fontSize: '14px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Para instalar:</div>
          <div>
            📱 iOS: Toca el botón Compartir → "Añadir a pantalla de inicio"<br/>
            🤖 Android: Menú (⋮) → "Instalar app" o "Añadir a pantalla de inicio"
          </div>
        </div>
        <button onClick={() => setShowInstructions(false)}>✕</button>
      </div>
    );
  }

  if (!isInstallable || !showBanner) return null;

  return (
    <div className={`pwa-install-banner ${showBanner ? 'show' : ''}`}>
      <div>
        <div style={{ fontWeight: 'bold' }}>🏆 Instalar ScoreKid</div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Añade la app a tu pantalla de inicio para acceso rápido
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleInstall}>Instalar</button>
        <button onClick={handleDismiss}>✕</button>
      </div>
    </div>
  );
};

// Basic offline functionality without service worker
const setupBasicOffline = () => {
  // Cache management using localStorage
  const cacheKey = 'scorekid-cache';
  
  // Save app state to localStorage
  const saveToCache = (key: string, data: any) => {
    try {
      const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      cache[key] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  };

  // Load app state from localStorage
  const loadFromCache = (key: string) => {
    try {
      const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      const item = cache[key];
      if (item && Date.now() - item.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        return item.data;
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error);
    }
    return null;
  };

  // Offline detection
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    document.body.classList.toggle('offline', !navigator.onLine);
    
    if (!navigator.onLine) {
      console.log('App is offline - using cached data');
    } else {
      console.log('App is online - syncing data');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  return { saveToCache, loadFromCache };
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error">
          <h1>¡Ups! Algo salió mal</h1>
          <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Detalles del error (desarrollo)</summary>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <MainApp />;
};

const AppWrapper: React.FC = () => {
  const { isMobile, platform } = usePlatform();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set up basic offline functionality
        setupBasicOffline();
        
        // Run data migration on app start
        await initDataMigration();
        setIsInitialized(true);
        
        console.log('ScoreKid: App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    try {
      // Set up mobile viewport with platform detection
      setupMobileViewport();
      
      // Add platform-specific optimizations
      if (platform === 'ios') {
        // iOS-specific optimizations
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitUserSelect = 'none';
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        const preventZoom = (e: TouchEvent) => {
          const now = (new Date()).getTime();
          if (now - lastTouchEnd <= 300) {
            e.preventDefault();
          }
          lastTouchEnd = now;
        };
        document.addEventListener('touchend', preventZoom, false);
        
        return () => {
          document.removeEventListener('touchend', preventZoom, false);
        };
      }
      
      if (platform === 'android') {
        // Android-specific optimizations
        document.body.style.overscrollBehavior = 'none';
        
        // Add material design ripple effect to touches
        const addRipple = (e: TouchEvent) => {
          try {
            const touch = e.touches[0];
            if (touch) {
              const ripple = document.createElement('div');
              ripple.style.position = 'absolute';
              ripple.style.borderRadius = '50%';
              ripple.style.background = 'rgba(255, 255, 255, 0.3)';
              ripple.style.transform = 'scale(0)';
              ripple.style.animation = 'ripple 0.6s linear';
              ripple.style.left = (touch.clientX - 10) + 'px';
              ripple.style.top = (touch.clientY - 10) + 'px';
              ripple.style.width = '20px';
              ripple.style.height = '20px';
              ripple.style.pointerEvents = 'none';
              ripple.style.zIndex = '9999';
              
              document.body.appendChild(ripple);
              
              setTimeout(() => {
                try {
                  if (document.body.contains(ripple)) {
                    document.body.removeChild(ripple);
                  }
                } catch (error) {
                  console.warn('Failed to remove ripple:', error);
                }
              }, 600);
            }
          } catch (error) {
            console.warn('Ripple effect error:', error);
          }
        };
        
        document.addEventListener('touchstart', addRipple, { passive: true });
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
        
        return () => {
          document.removeEventListener('touchstart', addRipple);
          try {
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }
          } catch (error) {
            console.warn('Failed to remove ripple style:', error);
          }
        };
      }
    } catch (error) {
      console.warn('Platform optimization error:', error);
    }
  }, [platform]);

  useEffect(() => {
    try {
      // Handle orientation changes
      const handleOrientationChange = () => {
        // Delay to allow for orientation change to complete
        setTimeout(() => {
          try {
            setupMobileViewport();
            
            // Force a reflow to fix any viewport issues
            document.body.style.height = '100vh';
            setTimeout(() => {
              document.body.style.height = '';
            }, 100);
          } catch (error) {
            console.warn('Orientation change error:', error);
          }
        }, 100);
      };

      // Handle resize for dynamic viewport units
      const handleResize = () => {
        try {
          // Update CSS custom properties for dynamic viewport
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
          document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
        } catch (error) {
          console.warn('Resize handler error:', error);
        }
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleResize);
      
      // Initial setup
      handleResize();

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.warn('Event listener setup error:', error);
    }
  }, []);

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div>🏆 Cargando ScoreKid...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileLayout>
        <AppContent />
        <PWAInstallBanner />
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              fontSize: '14px',
              maxWidth: '90vw'
            }
          }}
        />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen">
      <AppContent />
      <PWAInstallBanner />
      <Toaster position="top-center" />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <PlatformProvider>
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </PlatformProvider>
    </ErrorBoundary>
  );
}