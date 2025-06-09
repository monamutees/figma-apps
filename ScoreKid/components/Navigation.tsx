import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Users, Trophy, History, Settings, User, Play, ArrowLeft } from 'lucide-react';
import { NavigationSection } from '../types';

interface NavigationProps {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  profileName?: string;
  onBackToProfiles?: () => void;
  onStartGame?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  onSectionChange, 
  profileName,
  onBackToProfiles,
  onStartGame
}) => {
  const navigationItems = [
    {
      id: 'history' as NavigationSection,
      label: 'Historial',
      icon: History,
      description: 'Ver partidos guardados',
      requiresProfile: true
    },
    {
      id: 'teams' as NavigationSection,
      label: 'Equipos',
      icon: Users,
      description: 'Configurar nombres y avatares',
      requiresProfile: true
    },
    {
      id: 'profiles' as NavigationSection,
      label: 'Perfiles',
      icon: User,
      description: 'Gestionar jugadores',
      requiresProfile: false
    }
  ];

  const handleStartGame = () => {
    if (onStartGame) {
      onStartGame();
    }
  };

  // Si no hay perfil seleccionado, mostrar mensaje
  if (!profileName) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium mb-2">Sin perfil seleccionado</h2>
              <p className="text-gray-600 mb-4">
                Necesitas seleccionar un perfil de jugador para continuar
              </p>
              <Button 
                onClick={() => onSectionChange('profiles')}
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Ir a perfiles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header con información del perfil */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <h1 className="text-xl mb-1">ScoreKid</h1>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Jugando como: <strong>{profileName}</strong></span>
              </div>
            </div>
            
            {onBackToProfiles && (
              <Button 
                onClick={onBackToProfiles}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cambiar jugador
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Botón principal - Iniciar Partido */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-medium mb-2">Iniciar Partido</h2>
            <p className="text-blue-100 mb-4">Comenzar un nuevo marcador</p>
            <Button 
              onClick={handleStartGame}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Jugar Ahora
            </Button>
          </CardContent>
        </Card>

        {/* Opciones de navegación */}
        <div className="grid grid-cols-1 gap-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">
              ScoreKid - Tu marcador digital personalizado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};