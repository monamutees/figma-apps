import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Settings, History, User, Trophy, MoreVertical, Edit2, Play } from 'lucide-react';
import { ChildProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePlatform } from '../contexts/PlatformContext';
import { ProfileManager } from './ProfileManager';
import { Scoreboard } from './Scoreboard';
import { TeamSettings } from './TeamSettings';
import { MatchHistory } from './MatchHistory';
import { SportIconWithLabel } from './SportIcon';
import { getCategoryById } from '../utils/sportCategories';
import { MobileHeader, MobileTabBar, MobileLayout, useNavigationItems } from './MobileNavigation';
import { cn } from './ui/utils';

type View = 'main' | 'profiles' | 'scoreboard' | 'settings' | 'history';

export const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { isMobile, platform, theme } = usePlatform();
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);

  const profiles = user?.children || [];
  const recentProfiles = profiles.slice(-3);

  const handleSelectProfile = (profile: ChildProfile) => {
    setSelectedProfile(profile);
    setCurrentView('scoreboard');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedProfile(null);
    setEditingProfile(null);
  };

  const handleGoToSettings = (profile: ChildProfile) => {
    setSelectedProfile(profile);
    setCurrentView('settings');
  };

  const handleGoToHistory = (profile: ChildProfile) => {
    setSelectedProfile(profile);
    setCurrentView('history');
  };

  const handleEditProfile = (profile: ChildProfile) => {
    setEditingProfile(profile);
    setCurrentView('profiles');
  };

  const handleGoToProfiles = () => {
    setEditingProfile(null);
    setCurrentView('profiles');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    setSelectedProfile(null);
    setEditingProfile(null);
  };

  // Mobile navigation items
  const navigationItems = useNavigationItems(currentView, handleNavigate);

  // Get appropriate header for current view
  const getHeader = () => {
    if (!isMobile) return null;

    switch (currentView) {
      case 'main':
        return (
          <MobileHeader
            title="ScoreKid"
            rightAction={{
              icon: <Plus className="w-5 h-5" />,
              onClick: handleGoToProfiles,
              label: platform === 'ios' ? 'Nuevo' : undefined
            }}
          />
        );
      case 'profiles':
        return (
          <MobileHeader
            title="Perfiles"
            onBack={currentView !== 'main' ? handleBackToMain : undefined}
            rightAction={{
              icon: <Plus className="w-5 h-5" />,
              onClick: () => setEditingProfile(null),
              label: platform === 'ios' ? 'Añadir' : undefined
            }}
          />
        );
      case 'scoreboard':
        return (
          <MobileHeader
            title={selectedProfile?.name || 'Marcador'}
            onBack={handleBackToMain}
          />
        );
      case 'settings':
        return (
          <MobileHeader
            title="Configuración"
            onBack={handleBackToMain}
          />
        );
      case 'history':
        return (
          <MobileHeader
            title="Historial"
            onBack={handleBackToMain}
          />
        );
      default:
        return null;
    }
  };

  // Mobile tab bar (only show on main views)
  const getTabBar = () => {
    if (!isMobile || currentView === 'scoreboard') return null;
    return <MobileTabBar items={navigationItems} />;
  };

  // Renderizar vistas específicas
  if (currentView === 'profiles') {
    if (isMobile) {
      return (
        <MobileLayout
          header={getHeader()}
          footer={getTabBar()}
        >
          <ProfileManager 
            onBackToMain={handleBackToMain}
            onSelectProfile={handleSelectProfile}
            editingProfile={editingProfile}
          />
        </MobileLayout>
      );
    }
    return (
      <ProfileManager 
        onBackToMain={handleBackToMain}
        onSelectProfile={handleSelectProfile}
        editingProfile={editingProfile}
      />
    );
  }

  if (currentView === 'scoreboard' && selectedProfile) {
    if (isMobile) {
      return (
        <MobileLayout header={getHeader()}>
          <Scoreboard 
            profile={selectedProfile}
            onBackToMenu={handleBackToMain}
          />
        </MobileLayout>
      );
    }
    return (
      <Scoreboard 
        profile={selectedProfile}
        onBackToMenu={handleBackToMain}
      />
    );
  }

  if (currentView === 'settings' && selectedProfile) {
    if (isMobile) {
      return (
        <MobileLayout
          header={getHeader()}
          footer={getTabBar()}
        >
          <TeamSettings 
            profile={selectedProfile}
            onBackToMenu={handleBackToMain}
          />
        </MobileLayout>
      );
    }
    return (
      <TeamSettings 
        profile={selectedProfile}
        onBackToMenu={handleBackToMain}
      />
    );
  }

  if (currentView === 'history' && selectedProfile) {
    if (isMobile) {
      return (
        <MobileLayout
          header={getHeader()}
          footer={getTabBar()}
        >
          <MatchHistory 
            profile={selectedProfile}
            onBackToMenu={handleBackToMain}
          />
        </MobileLayout>
      );
    }
    return (
      <MatchHistory 
        profile={selectedProfile}
        onBackToMenu={handleBackToMain}
      />
    );
  }

  // Vista principal
  const MainContent = () => (
    <div className={cn(
      "min-h-screen bg-gray-50 p-4",
      "mobile:p-3 mobile:bg-background"
    )}>
      <div className={cn(
        "max-w-2xl mx-auto space-y-6",
        "mobile:max-w-none mobile:space-y-4"
      )}>
        {/* Header - Only show on desktop */}
        {!isMobile && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-medium">ScoreKid</h1>
              </div>
              <p className="text-gray-600">
                ¡Hola! Selecciona un perfil para empezar a llevar el marcador
              </p>
            </CardContent>
          </Card>
        )}

        {/* Welcome card for mobile */}
        {isMobile && profiles.length === 0 && (
          <Card className="mx-3 mt-4">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h2 className="text-lg font-medium mb-2">¡Bienvenido a ScoreKid!</h2>
              <p className="text-muted-foreground mb-4">
                Crea tu primer perfil para empezar a llevar el marcador de tus partidos
              </p>
              <Button onClick={handleGoToProfiles} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer perfil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick actions - Desktop only */}
        {!isMobile && (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleGoToProfiles}
              className="h-16 flex flex-col gap-1"
              variant="outline"
            >
              <User className="w-6 h-6" />
              <span className="text-sm">Gestionar Perfiles</span>
            </Button>
            <Button 
              onClick={handleGoToProfiles}
              className="h-16 flex flex-col gap-1"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Nuevo Perfil</span>
            </Button>
          </div>
        )}

        {/* Perfiles recientes */}
        {profiles.length > 0 && (
          <Card className={cn("mobile:mx-3 mobile:mt-4")}>
            <CardHeader className={cn("mobile:pb-3")}>
              <CardTitle className="flex items-center justify-between">
                <span className={cn("mobile:text-lg")}>
                  {isMobile ? 'Tus Perfiles' : 'Perfiles'}
                </span>
                {profiles.length > 3 && !isMobile && (
                  <Button 
                    onClick={handleGoToProfiles}
                    variant="ghost" 
                    size="sm"
                  >
                    Ver todos
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn("space-y-3 mobile:space-y-2 mobile:px-4")}>
              {(isMobile ? profiles : recentProfiles).map(profile => {
                const category = profile.category ? getCategoryById(profile.sport, profile.category) : null;
                
                return (
                  <Card key={profile.id} className={cn(
                    "hover:shadow-sm transition-shadow",
                    "mobile:hover:shadow-none mobile:active:bg-accent/50"
                  )}>
                    <CardContent className={cn("p-4 mobile:p-3")}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className={cn("w-12 h-12 mobile:w-10 mobile:h-10")}>
                            {profile.photoUrl ? (
                              <AvatarImage src={profile.photoUrl} className="object-cover" />
                            ) : (
                              <AvatarFallback>
                                <User className={cn("w-6 h-6 mobile:w-5 mobile:h-5")} />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className={cn("font-medium mobile:text-sm")}>{profile.name}</h3>
                            <div className="flex items-center gap-2">
                              <SportIconWithLabel 
                                sport={profile.sport}
                                showEmoji={true}
                                showIcon={false}
                                className={cn("text-sm text-gray-600 mobile:text-xs")}
                              />
                              {category && (
                                <Badge variant="secondary" className={cn("text-xs mobile:text-[10px]")}>
                                  {category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Mobile: Show only play button */}
                          {isMobile ? (
                            <div className="flex items-center gap-1">
                              <Button 
                                onClick={() => handleSelectProfile(profile)}
                                size="sm"
                                className="px-3"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Jugar
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Editar perfil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGoToSettings(profile)}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurar equipos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGoToHistory(profile)}>
                                    <History className="w-4 h-4 mr-2" />
                                    Ver historial
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : (
                            /* Desktop: Show play button and dropdown */
                            <>
                              <Button 
                                onClick={() => handleSelectProfile(profile)}
                                size="sm"
                                className="px-3"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Jugar
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Editar perfil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGoToSettings(profile)}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurar equipos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGoToHistory(profile)}>
                                    <History className="w-4 h-4 mr-2" />
                                    Ver historial
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Desktop empty state */}
        {profiles.length === 0 && !isMobile && (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">¡Comienza aquí!</h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer perfil para empezar a llevar el marcador de tus partidos.
              </p>
              <Button onClick={handleGoToProfiles}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primer perfil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Desktop info card */}
        {!isMobile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{profiles.length} perfil{profiles.length !== 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <History className="w-4 h-4" />
                  <span>Historial disponible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout
        header={getHeader()}
        footer={getTabBar()}
      >
        <MainContent />
      </MobileLayout>
    );
  }

  return <MainContent />;
};