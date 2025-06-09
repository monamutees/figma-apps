import { User, ChildProfile, Match, VolleyballScore, TennisScore, GenericScore } from '../types';
import { getDefaultCategory } from './sportCategories';

export const migrateUserData = (userData: any): User => {
  // Ensure children array exists
  if (!userData.children) {
    userData.children = [];
  }

  // Migrate each child profile to add missing fields
  userData.children = userData.children.map((child: any): ChildProfile => {
    const migratedChild: ChildProfile = {
      id: child.id || Date.now().toString(),
      name: child.name || 'Sin nombre',
      sport: child.sport || 'Otro',
      category: child.category || getDefaultCategory(child.sport || 'Otro').id,
      teamSettings: child.teamSettings,
      photoUrl: child.photoUrl,
      createdAt: child.createdAt || new Date().toISOString()
    };

    return migratedChild;
  });

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    children: userData.children,
    createdAt: userData.createdAt
  };
};

/**
 * Checks if a match is in legacy format (missing required fields)
 */
export const isLegacyMatch = (match: any): boolean => {
  // Check if it's missing essential fields that newer matches should have
  return (
    !match.sport ||
    !match.teamSettings ||
    match.isFinished === undefined ||
    !match.result ||
    (match.score && typeof match.score !== 'object')
  );
};

/**
 * Migrates a legacy match to the new format
 */
export const migrateLegacyMatch = (legacyMatch: any, profileSport: string): Match => {
  // Create a proper score object based on sport
  let migratedScore: VolleyballScore | TennisScore | GenericScore;

  if (profileSport === 'Voleibol') {
    // Migrate volleyball score
    if (legacyMatch.score && typeof legacyMatch.score === 'object' && legacyMatch.score.sets) {
      migratedScore = {
        sets: legacyMatch.score.sets || [],
        currentSet: legacyMatch.score.currentSet || { myTeam: 0, rivalTeam: 0 }
      } as VolleyballScore;
    } else {
      // Create default volleyball score
      migratedScore = {
        sets: [],
        currentSet: { myTeam: 0, rivalTeam: 0 }
      } as VolleyballScore;
    }
  } else if (profileSport === 'Tenis') {
    // Migrate tennis score
    if (legacyMatch.score && typeof legacyMatch.score === 'object' && legacyMatch.score.sets) {
      migratedScore = {
        sets: legacyMatch.score.sets || [],
        currentSet: {
          games: legacyMatch.score.currentSet?.games || { myTeam: 0, rivalTeam: 0 },
          currentGame: legacyMatch.score.currentSet?.currentGame || { myTeam: 0, rivalTeam: 0 }
        }
      } as TennisScore;
    } else {
      // Create default tennis score
      migratedScore = {
        sets: [],
        currentSet: {
          games: { myTeam: 0, rivalTeam: 0 },
          currentGame: { myTeam: 0, rivalTeam: 0 }
        }
      } as TennisScore;
    }
  } else {
    // Generic score for other sports
    if (legacyMatch.score && typeof legacyMatch.score === 'object') {
      migratedScore = {
        myTeam: legacyMatch.score.myTeam || 0,
        rivalTeam: legacyMatch.score.rivalTeam || 0
      } as GenericScore;
    } else if (typeof legacyMatch.score === 'string') {
      // Try to parse string score like "2-1"
      const parts = legacyMatch.score.split('-');
      migratedScore = {
        myTeam: parseInt(parts[0]) || 0,
        rivalTeam: parseInt(parts[1]) || 0
      } as GenericScore;
    } else {
      migratedScore = {
        myTeam: 0,
        rivalTeam: 0
      } as GenericScore;
    }
  }

  // Determine result if not present
  let result: 'victory' | 'defeat' | 'tie' = 'tie';
  if (legacyMatch.result) {
    result = legacyMatch.result;
  } else {
    // Try to determine from score
    if (profileSport === 'Voleibol') {
      const vScore = migratedScore as VolleyballScore;
      const myWonSets = vScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
      const rivalWonSets = vScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
      if (myWonSets > rivalWonSets) result = 'victory';
      else if (rivalWonSets > myWonSets) result = 'defeat';
    } else if (profileSport === 'Tenis') {
      const tScore = migratedScore as TennisScore;
      const myWonSets = tScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
      const rivalWonSets = tScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
      if (myWonSets > rivalWonSets) result = 'victory';
      else if (rivalWonSets > myWonSets) result = 'defeat';
    } else {
      const gScore = migratedScore as GenericScore;
      if (gScore.myTeam > gScore.rivalTeam) result = 'victory';
      else if (gScore.rivalTeam > gScore.myTeam) result = 'defeat';
    }
  }

  // Create default team settings if missing
  const defaultTeamSettings = {
    myTeam: {
      name: legacyMatch.teamSettings?.myTeam?.name || 'Mi Equipo',
      color: legacyMatch.teamSettings?.myTeam?.color || '#3B82F6',
      avatar: legacyMatch.teamSettings?.myTeam?.avatar || '🏆'
    },
    rivalTeam: {
      name: legacyMatch.teamSettings?.rivalTeam?.name || 'Rival',
      color: legacyMatch.teamSettings?.rivalTeam?.color || '#EF4444',
      avatar: legacyMatch.teamSettings?.rivalTeam?.avatar || '⚡'
    }
  };

  return {
    id: legacyMatch.id || Date.now().toString(),
    childId: legacyMatch.childId,
    sport: profileSport,
    score: migratedScore,
    teamSettings: legacyMatch.teamSettings || defaultTeamSettings,
    date: legacyMatch.date || new Date().toISOString(),
    notes: legacyMatch.notes || undefined,
    result,
    isFinished: legacyMatch.isFinished !== undefined ? legacyMatch.isFinished : true,
    timer: legacyMatch.timer
  };
};

export const initDataMigration = () => {
  try {
    // Migrate current user data
    const currentUserData = localStorage.getItem('scorekid_user');
    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      const migratedUser = migrateUserData(user);
      localStorage.setItem('scorekid_user', JSON.stringify(migratedUser));
    }

    // Migrate users database
    const usersData = localStorage.getItem('scorekid_users');
    if (usersData) {
      const users = JSON.parse(usersData);
      const migratedUsers = users.map((user: any) => {
        // Don't migrate password field, just user data
        const { password, ...userDataOnly } = user;
        const migratedUserData = migrateUserData(userDataOnly);
        return {
          ...migratedUserData,
          password // Keep original password
        };
      });
      localStorage.setItem('scorekid_users', JSON.stringify(migratedUsers));
    }

    // Migrate matches data
    const matchesData = localStorage.getItem('scorekid_matches');
    if (matchesData) {
      try {
        const matches = JSON.parse(matchesData);
        const migratedMatches = matches.map((match: any) => {
          if (isLegacyMatch(match)) {
            // We need to determine the sport from the match or use a default
            const sport = match.sport || 'Otro';
            return migrateLegacyMatch(match, sport);
          }
          return match;
        });
        localStorage.setItem('scorekid_matches', JSON.stringify(migratedMatches));
      } catch (matchError) {
        console.warn('Error migrating matches, resetting matches data:', matchError);
        localStorage.setItem('scorekid_matches', '[]');
      }
    }

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during data migration:', error);
  }
};