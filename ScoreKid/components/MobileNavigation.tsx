import React from 'react';
import { Button } from './ui/button';
import { usePlatform } from '../contexts/PlatformContext';
import { cn } from './ui/utils';
import { 
  Home, 
  User, 
  Trophy, 
  History, 
  Settings,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
  onClick: () => void;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export const MobileTabBar: React.FC<MobileNavigationProps> = ({ 
  items, 
  className 
}) => {
  const { platform, theme, safeAreaInsets } = usePlatform();

  const tabBarClasses = cn(
    "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border",
    "safe-area-bottom",
    // iOS styles
    "ios:bg-background/80 ios:backdrop-blur-xl ios:border-t-gray-200 dark:ios:border-t-gray-800",
    // Android styles  
    "android:bg-background android:shadow-lg android:border-t-gray-300 dark:android:border-t-gray-700",
    className
  );

  const tabButtonClasses = cn(
    "flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[49px]",
    "ios:min-h-[49px]",
    "android:min-h-[56px]"
  );

  return (
    <div 
      className={tabBarClasses}
      style={{
        paddingBottom: `max(${safeAreaInsets.bottom}px, env(safe-area-inset-bottom))`
      }}
    >
      <div className="flex w-full">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              tabButtonClasses,
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
              // iOS active state
              "ios:active:bg-gray-100 dark:ios:active:bg-gray-800",
              // Android active state
              "android:active:bg-gray-100 dark:android:active:bg-gray-800"
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <div className={cn(
                  "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center",
                  "ios:rounded-full ios:min-w-[16px] ios:h-4",
                  "android:rounded android:min-w-[18px] android:h-5"
                )}>
                  {item.badge}
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs",
              "ios:text-[10px] ios:font-medium",
              "android:text-[12px] android:font-normal android:uppercase android:tracking-wide"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon: React.ReactNode;
    onClick: () => void;
    label?: string;
  };
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  onBack, 
  rightAction,
  className 
}) => {
  const { platform, theme, safeAreaInsets } = usePlatform();

  const headerClasses = cn(
    "fixed top-0 left-0 right-0 z-50 bg-background border-b border-border",
    "flex items-center justify-between px-4",
    "safe-area-top",
    // iOS styles
    "ios:bg-background/80 ios:backdrop-blur-xl ios:border-b-gray-200 dark:ios:border-b-gray-800 ios:h-[44px]",
    // Android styles
    "android:bg-background android:shadow-sm android:border-b-gray-300 dark:android:border-b-gray-700 android:h-[56px]",
    className
  );

  return (
    <div 
      className={headerClasses}
      style={{
        paddingTop: `max(${safeAreaInsets.top}px, env(safe-area-inset-top))`
      }}
    >
      {/* Left side - Back button or spacer */}
      <div className="flex items-center">
        {onBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={cn(
              "p-2",
              "ios:hover:bg-gray-100 dark:ios:hover:bg-gray-800",
              "android:hover:bg-gray-100 dark:android:hover:bg-gray-800"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            {theme === 'cupertino' && (
              <span className="ml-1 text-sm">Atrás</span>
            )}
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Center - Title */}
      <div className="flex-1 text-center">
        <h1 className={cn(
          "font-medium truncate",
          "ios:text-lg ios:font-semibold",
          "android:text-xl android:font-medium"
        )}>
          {title}
        </h1>
      </div>

      {/* Right side - Action button or spacer */}
      <div className="flex items-center">
        {rightAction ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={rightAction.onClick}
            className={cn(
              "p-2",
              "ios:hover:bg-gray-100 dark:ios:hover:bg-gray-800",
              "android:hover:bg-gray-100 dark:android:hover:bg-gray-800"
            )}
          >
            {rightAction.icon}
            {rightAction.label && theme === 'cupertino' && (
              <span className="ml-1 text-sm">{rightAction.label}</span>
            )}
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
};

interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  header, 
  footer, 
  className 
}) => {
  const { safeAreaInsets } = usePlatform();

  return (
    <div className={cn("flex flex-col min-h-screen bg-background", className)}>
      {/* Header */}
      {header}
      
      {/* Main content area */}
      <main 
        className={cn(
          "flex-1 overflow-auto",
          header && "mt-[44px] ios:mt-[44px] android:mt-[56px]",
          footer && "mb-[49px] ios:mb-[49px] android:mb-[56px]"
        )}
        style={{
          marginTop: header ? `calc(var(--mobile-header-height) + ${safeAreaInsets.top}px)` : undefined,
          marginBottom: footer ? `calc(var(--mobile-tab-height) + ${safeAreaInsets.bottom}px)` : undefined,
        }}
      >
        {children}
      </main>
      
      {/* Footer/Tab bar */}
      {footer}
    </div>
  );
};

// Helper hook for common navigation items
export const useNavigationItems = (
  currentView: string,
  onNavigate: (view: string) => void
): NavigationItem[] => {
  return [
    {
      id: 'main',
      label: 'Inicio',
      icon: <Home className="w-5 h-5" />,
      active: currentView === 'main',
      onClick: () => onNavigate('main')
    },
    {
      id: 'profiles',
      label: 'Perfiles',
      icon: <User className="w-5 h-5" />,
      active: currentView === 'profiles',
      onClick: () => onNavigate('profiles')
    },
    {
      id: 'scoreboard',
      label: 'Marcador',
      icon: <Trophy className="w-5 h-5" />,
      active: currentView === 'scoreboard',
      onClick: () => onNavigate('scoreboard')
    },
    {
      id: 'history',
      label: 'Historial',
      icon: <History className="w-5 h-5" />,
      active: currentView === 'history',
      onClick: () => onNavigate('history')
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: <Settings className="w-5 h-5" />,
      active: currentView === 'settings',
      onClick: () => onNavigate('settings')
    }
  ];
};