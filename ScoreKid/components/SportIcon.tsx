import React from 'react';
import { 
  Circle, 
  Waves, 
  Zap, 
  Trophy,
  LucideIcon
} from 'lucide-react';
import { getSportIcon } from '../utils/sportIcons';

// Mapeo de nombres de iconos a componentes de Lucide
const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Circle,
  Waves,
  Zap,
  Trophy
};

interface SportIconProps {
  sport: string;
  size?: number;
  className?: string;
  showEmoji?: boolean; // Si mostrar emoji en lugar del icono
}

export const SportIcon: React.FC<SportIconProps> = ({ 
  sport, 
  size = 16, 
  className = '',
  showEmoji = false 
}) => {
  const sportInfo = getSportIcon(sport);

  if (showEmoji) {
    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ fontSize: size }}
      >
        {sportInfo.emoji}
      </span>
    );
  }

  const IconComponent = ICON_COMPONENTS[sportInfo.icon] || Trophy;

  return (
    <IconComponent 
      size={size} 
      className={className}
    />
  );
};

interface SportIconWithLabelProps {
  sport: string;
  showIcon?: boolean;
  showEmoji?: boolean;
  iconSize?: number;
  className?: string;
}

export const SportIconWithLabel: React.FC<SportIconWithLabelProps> = ({ 
  sport, 
  showIcon = true,
  showEmoji = false,
  iconSize = 16,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {(showIcon || showEmoji) && (
        <SportIcon 
          sport={sport} 
          size={iconSize} 
          showEmoji={showEmoji}
        />
      )}
      <span>{sport}</span>
    </div>
  );
};

// Componente para seleccionar deporte con iconos
interface SportSelectorProps {
  sports: string[];
  selectedSport: string;
  onSportChange: (sport: string) => void;
  showIcons?: boolean;
}

export const SportSelector: React.FC<SportSelectorProps> = ({
  sports,
  selectedSport,
  onSportChange,
  showIcons = true
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {sports.map((sport) => (
        <button
          key={sport}
          type="button"
          onClick={() => onSportChange(sport)}
          className={`
            relative p-3 rounded-lg border-2 text-left transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${selectedSport === sport
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500' 
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
            }
          `}
        >
          <SportIconWithLabel 
            sport={sport}
            showIcon={showIcons}
            showEmoji={!showIcons}
            iconSize={18}
            className="text-sm font-medium"
          />
          {selectedSport === sport && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
};

// Componente alternativo con diseño en lista vertical para espacios pequeños
interface SportListSelectorProps {
  sports: string[];
  selectedSport: string;
  onSportChange: (sport: string) => void;
  showIcons?: boolean;
}

export const SportListSelector: React.FC<SportListSelectorProps> = ({
  sports,
  selectedSport,
  onSportChange,
  showIcons = true
}) => {
  return (
    <div className="space-y-2">
      {sports.map((sport) => (
        <button
          key={sport}
          type="button"
          onClick={() => onSportChange(sport)}
          className={`
            w-full p-3 rounded-lg border-2 text-left transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${selectedSport === sport
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <SportIconWithLabel 
              sport={sport}
              showIcon={showIcons}
              showEmoji={!showIcons}
              iconSize={18}
              className="text-sm font-medium"
            />
            {selectedSport === sport && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};