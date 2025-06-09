import { SportIcon } from '../types';

// Mapeo de deportes a iconos de Lucide React
export const SPORT_ICONS: Record<string, SportIcon> = {
  'Voleibol': {
    name: 'Voleibol',
    icon: 'Circle', // No hay icono específico, usamos círculo
    emoji: '🏐'
  },
  'Baloncesto': {
    name: 'Baloncesto',
    icon: 'Circle',
    emoji: '🏀'
  },
  'Fútbol': {
    name: 'Fútbol',
    icon: 'Circle',
    emoji: '⚽'
  },
  'Tenis': {
    name: 'Tenis',
    icon: 'Circle',
    emoji: '🎾'
  },
  'Béisbol': {
    name: 'Béisbol',
    icon: 'Circle',
    emoji: '⚾'
  },
  'Natación': {
    name: 'Natación',
    icon: 'Waves',
    emoji: '🏊'
  },
  'Atletismo': {
    name: 'Atletismo',
    icon: 'Zap',
    emoji: '🏃'
  },
  'Otro': {
    name: 'Otro',
    icon: 'Trophy',
    emoji: '🏆'
  }
};

/**
 * Obtiene el icono para un deporte específico
 */
export const getSportIcon = (sport: string): SportIcon => {
  return SPORT_ICONS[sport] || SPORT_ICONS['Otro'];
};

/**
 * Obtiene todos los deportes disponibles con sus iconos
 */
export const getAllSportIcons = (): SportIcon[] => {
  return Object.values(SPORT_ICONS);
};

/**
 * Verifica si un deporte tiene un icono personalizado
 */
export const hasSportIcon = (sport: string): boolean => {
  return sport in SPORT_ICONS;
};

/**
 * Obtiene el emoji para un deporte (fallback cuando no hay icono)
 */
export const getSportEmoji = (sport: string): string => {
  return getSportIcon(sport).emoji;
};

/**
 * Obtiene el nombre del icono de Lucide para un deporte
 */
export const getSportIconName = (sport: string): string => {
  return getSportIcon(sport).icon;
};