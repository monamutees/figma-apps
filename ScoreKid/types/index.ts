export interface User {
  id: string;
  email: string;
  name?: string;
  children: ChildProfile[];
  createdAt?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  sport: string;
  category?: string; // Nueva: categoría según el deporte
  teamSettings?: TeamSettings;
  photoUrl?: string; // Nueva: URL de la foto del perfil del niño
  createdAt?: string;
}

export interface TeamSettings {
  myTeam: {
    name: string;
    color: string;
    avatar?: string; // Emoji/letra predefinida
    imageUrl?: string; // Nueva: URL de imagen personalizada
  };
  rivalTeam: {
    name: string;
    color: string;
    avatar?: string; // Emoji/letra predefinida
    imageUrl?: string; // Nueva: URL de imagen personalizada
  };
}

export interface Match {
  id: string;
  childId: string;
  sport: string;
  score: VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore;
  teamSettings: TeamSettings;
  date: string;
  notes?: string;
  result: 'victory' | 'defeat' | 'tie';
  isFinished: boolean;
  timer?: GameTimer;
}

// Sport-specific score types
export interface VolleyballScore {
  sets: Array<{
    myTeam: number;
    rivalTeam: number;
  }>;
  currentSet: {
    myTeam: number;
    rivalTeam: number;
  };
}

export interface BasketballScore {
  quarters: Array<{
    myTeam: number;
    rivalTeam: number;
  }>;
  currentQuarter: {
    myTeam: number;
    rivalTeam: number;
  };
  totalScore: {
    myTeam: number;
    rivalTeam: number;
  };
  fouls: {
    myTeam: number;
    rivalTeam: number;
  };
  timeouts: {
    myTeam: number;
    rivalTeam: number;
  };
}

export interface BaseballScore {
  innings: Array<{
    myTeam: number;
    rivalTeam: number;
  }>;
  currentInning: {
    myTeam: number;
    rivalTeam: number;
    isBottomHalf: boolean;
  };
  totalScore: {
    myTeam: number;
    rivalTeam: number;
  };
  outs: number;
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
}

export type TennisPoint = 0 | 15 | 30 | 40 | 'ADV';

export interface TennisScore {
  sets: Array<{
    myTeam: number;
    rivalTeam: number;
  }>;
  currentSet: {
    games: {
      myTeam: number;
      rivalTeam: number;
    };
    currentGame: {
      myTeam: TennisPoint;
      rivalTeam: TennisPoint;
    };
    tieBreak?: {
      myTeam: number;
      rivalTeam: number;
    };
  };
}

export interface SoccerScore {
  myTeam: number;
  rivalTeam: number;
  halfTime: {
    myTeam: number;
    rivalTeam: number;
  };
  cards: {
    myTeam: {
      yellow: number;
      red: number;
    };
    rivalTeam: {
      yellow: number;
      red: number;
    };
  };
}

export interface GenericScore {
  myTeam: number;
  rivalTeam: number;
}

export interface GameTimer {
  isRunning: boolean;
  currentTime: number; // in seconds
  totalTime: number; // in seconds
  period: number;
  totalPeriods: number;
  stoppage?: number; // for soccer
}

export interface GameStatus {
  isSetFinished: boolean;
  isMatchFinished: boolean;
  isQuarterFinished?: boolean;
  isInningFinished?: boolean;
  winner?: 'myTeam' | 'rivalTeam';
  message?: string;
}

export interface SportRules {
  name: string;
  scoringSystem: 'sets' | 'quarters' | 'innings' | 'tennis' | 'halves' | 'points';
  pointIncrements: number[];
  winCondition: {
    pointsToWin?: number;
    setsToWin?: number;
    quartersToPlay?: number;
    inningsToPlay?: number;
    halvesToPlay?: number;
    mustWinByTwo?: boolean;
    allowTies?: boolean;
  };
  timeLimit?: {
    enabled: boolean;
    duration?: number; // in minutes
    periods?: number;
    hasStoppage?: boolean;
  };
  specialRules?: {
    hasTieBreak?: boolean;
    hasTimeouts?: boolean;
    hasFouls?: boolean;
    hasOuts?: boolean;
    hasBases?: boolean;
    hasCards?: boolean;
  };
}

// Updated interface for image upload handling
export interface ImageUploadResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

export interface ImageProcessingResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface BrowserSupport {
  supported: boolean;
  missing: string[];
}

export interface SportIcon {
  name: string;
  icon: string; // Lucide icon name
  emoji: string; // Fallback emoji
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateUser: (updatedUser: User) => void;
}