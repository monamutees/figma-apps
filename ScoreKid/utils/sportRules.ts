import { 
  SportRules, VolleyballScore, BasketballScore, BaseballScore, TennisScore, SoccerScore, GenericScore, 
  TennisPoint, GameStatus, GameTimer 
} from '../types';

export const SPORT_RULES: Record<string, SportRules> = {
  'Voleibol': {
    name: 'Voleibol',
    scoringSystem: 'sets',
    pointIncrements: [1],
    winCondition: {
      pointsToWin: 25, // Para sets 1-4
      setsToWin: 3,    // Ganar 3 sets para ganar el partido
      mustWinByTwo: true
    }
  },
  'Tenis': {
    name: 'Tenis',
    scoringSystem: 'tennis',
    pointIncrements: [1],
    winCondition: {
      setsToWin: 2,
      mustWinByTwo: true
    },
    specialRules: {
      hasTieBreak: true
    }
  },
  'Fútbol': {
    name: 'Fútbol',
    scoringSystem: 'halves',
    pointIncrements: [1],
    winCondition: {
      halvesToPlay: 2,
      allowTies: true
    },
    timeLimit: {
      enabled: true,
      duration: 90,
      periods: 2,
      hasStoppage: true
    },
    specialRules: {
      hasCards: true
    }
  },
  'Baloncesto': {
    name: 'Baloncesto',
    scoringSystem: 'quarters',
    pointIncrements: [1, 2, 3],
    winCondition: {
      quartersToPlay: 4,
      allowTies: false
    },
    timeLimit: {
      enabled: true,
      duration: 48,
      periods: 4
    },
    specialRules: {
      hasTimeouts: true,
      hasFouls: true
    }
  },
  'Béisbol': {
    name: 'Béisbol',
    scoringSystem: 'innings',
    pointIncrements: [1],
    winCondition: {
      inningsToPlay: 9,
      allowTies: false
    },
    specialRules: {
      hasOuts: true,
      hasBases: true
    }
  },
  'Natación': {
    name: 'Natación',
    scoringSystem: 'points',
    pointIncrements: [1],
    winCondition: {
      allowTies: false
    }
  },
  'Atletismo': {
    name: 'Atletismo',
    scoringSystem: 'points',
    pointIncrements: [1],
    winCondition: {
      allowTies: true
    }
  },
  'Otro': {
    name: 'Otro',
    scoringSystem: 'points',
    pointIncrements: [1, 2, 3],
    winCondition: {
      allowTies: true
    }
  }
};

export const initializeScore = (sport: string): VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore => {
  const rules = SPORT_RULES[sport];
  
  if (rules.scoringSystem === 'sets' && sport === 'Voleibol') {
    return {
      sets: [],
      currentSet: {
        myTeam: 0,
        rivalTeam: 0
      }
    } as VolleyballScore;
  }
  
  if (rules.scoringSystem === 'quarters' && sport === 'Baloncesto') {
    return {
      quarters: [],
      currentQuarter: {
        myTeam: 0,
        rivalTeam: 0
      },
      totalScore: {
        myTeam: 0,
        rivalTeam: 0
      },
      fouls: {
        myTeam: 0,
        rivalTeam: 0
      },
      timeouts: {
        myTeam: 3,
        rivalTeam: 3
      }
    } as BasketballScore;
  }
  
  if (rules.scoringSystem === 'innings' && sport === 'Béisbol') {
    return {
      innings: [],
      currentInning: {
        myTeam: 0,
        rivalTeam: 0,
        isBottomHalf: false
      },
      totalScore: {
        myTeam: 0,
        rivalTeam: 0
      },
      outs: 0,
      bases: {
        first: false,
        second: false,
        third: false
      }
    } as BaseballScore;
  }
  
  if (rules.scoringSystem === 'tennis' && sport === 'Tenis') {
    return {
      sets: [],
      currentSet: {
        games: {
          myTeam: 0,
          rivalTeam: 0
        },
        currentGame: {
          myTeam: 0,
          rivalTeam: 0
        }
      }
    } as TennisScore;
  }
  
  if (rules.scoringSystem === 'halves' && sport === 'Fútbol') {
    return {
      myTeam: 0,
      rivalTeam: 0,
      halfTime: {
        myTeam: 0,
        rivalTeam: 0
      },
      cards: {
        myTeam: {
          yellow: 0,
          red: 0
        },
        rivalTeam: {
          yellow: 0,
          red: 0
        }
      }
    } as SoccerScore;
  }
  
  return {
    myTeam: 0,
    rivalTeam: 0
  } as GenericScore;
};

export const initializeTimer = (sport: string): GameTimer | null => {
  const rules = SPORT_RULES[sport];
  
  if (!rules.timeLimit?.enabled) return null;
  
  const periodDuration = (rules.timeLimit.duration! / rules.timeLimit.periods!) * 60; // convert to seconds
  
  return {
    isRunning: false,
    currentTime: 0,
    totalTime: periodDuration,
    period: 1,
    totalPeriods: rules.timeLimit.periods!,
    stoppage: 0
  };
};

export const updateVolleyballScore = (
  score: VolleyballScore, 
  team: 'myTeam' | 'rivalTeam', 
  operation: 'add' | 'subtract'
): { score: VolleyballScore; status: GameStatus } => {
  const newScore = { ...score };
  const rules = SPORT_RULES['Voleibol'];
  
  if (operation === 'add') {
    newScore.currentSet[team]++;
  } else {
    newScore.currentSet[team] = Math.max(0, newScore.currentSet[team] - 1);
  }
  
  // Determinar si estamos en el 5to set (tie-break)
  const currentSetNumber = newScore.sets.length + 1;
  const isFifthSet = currentSetNumber === 5;
  
  // Puntos necesarios para ganar: 25 para sets 1-4, 15 para el 5to set
  const pointsToWin = isFifthSet ? 15 : rules.winCondition.pointsToWin!;
  
  // Verificar si el set ha terminado
  const myPoints = newScore.currentSet.myTeam;
  const rivalPoints = newScore.currentSet.rivalTeam;
  
  let isSetFinished = false;
  let winner: 'myTeam' | 'rivalTeam' | undefined;
  
  if (myPoints >= pointsToWin && myPoints - rivalPoints >= 2) {
    isSetFinished = true;
    winner = 'myTeam';
  } else if (rivalPoints >= pointsToWin && rivalPoints - myPoints >= 2) {
    isSetFinished = true;
    winner = 'rivalTeam';
  }
  
  if (isSetFinished && winner) {
    newScore.sets.push({
      myTeam: myPoints,
      rivalTeam: rivalPoints
    });
    
    newScore.currentSet = { myTeam: 0, rivalTeam: 0 };
    
    const myWonSets = newScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
    const rivalWonSets = newScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
    
    const setsToWin = rules.winCondition.setsToWin!;
    const isMatchFinished = myWonSets >= setsToWin || rivalWonSets >= setsToWin;
    
    let message = '';
    if (isMatchFinished) {
      message = `¡Partido terminado! Ganó ${winner === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'} ${myWonSets > rivalWonSets ? myWonSets : rivalWonSets}-${myWonSets > rivalWonSets ? rivalWonSets : myWonSets}`;
    } else {
      const setType = isFifthSet ? 'Set decisivo' : `Set ${currentSetNumber}`;
      message = `${setType} terminado: ${myPoints}-${rivalPoints}. Ganó ${winner === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'}`;
    }
    
    return {
      score: newScore,
      status: {
        isSetFinished: true,
        isMatchFinished,
        winner,
        message
      }
    };
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false
    }
  };
};

export const updateBasketballScore = (
  score: BasketballScore,
  team: 'myTeam' | 'rivalTeam',
  operation: 'add' | 'subtract',
  points: number = 1
): { score: BasketballScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore.currentQuarter[team] += points;
    newScore.totalScore[team] += points;
  } else {
    const reduction = Math.min(points, newScore.currentQuarter[team]);
    newScore.currentQuarter[team] -= reduction;
    newScore.totalScore[team] -= reduction;
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false
    }
  };
};

export const updateBasketballFouls = (
  score: BasketballScore,
  team: 'myTeam' | 'rivalTeam',
  operation: 'add' | 'subtract'
): { score: BasketballScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore.fouls[team]++;
  } else {
    newScore.fouls[team] = Math.max(0, newScore.fouls[team] - 1);
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false,
      message: newScore.fouls[team] >= 5 ? `${team === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'} en bonus` : undefined
    }
  };
};

export const updateBasketballTimeouts = (
  score: BasketballScore,
  team: 'myTeam' | 'rivalTeam'
): { score: BasketballScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (newScore.timeouts[team] > 0) {
    newScore.timeouts[team]--;
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false,
      message: `Tiempo muerto - ${team === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'}`
    }
  };
};

export const nextBasketballQuarter = (
  score: BasketballScore
): { score: BasketballScore; status: GameStatus } => {
  const newScore = { ...score };
  
  newScore.quarters.push({
    myTeam: newScore.currentQuarter.myTeam,
    rivalTeam: newScore.currentQuarter.rivalTeam
  });
  
  newScore.currentQuarter = { myTeam: 0, rivalTeam: 0 };
  
  const currentQuarter = newScore.quarters.length + 1;
  const isMatchFinished = currentQuarter > 4 && newScore.totalScore.myTeam !== newScore.totalScore.rivalTeam;
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isQuarterFinished: true,
      isMatchFinished,
      message: isMatchFinished ? 
        `¡Partido terminado! ${newScore.totalScore.myTeam > newScore.totalScore.rivalTeam ? 'Mi Equipo' : 'Equipo Rival'} ganó ${Math.max(newScore.totalScore.myTeam, newScore.totalScore.rivalTeam)}-${Math.min(newScore.totalScore.myTeam, newScore.totalScore.rivalTeam)}` :
        `Final del cuarto ${newScore.quarters.length}`
    }
  };
};

export const updateBaseballScore = (
  score: BaseballScore,
  team: 'myTeam' | 'rivalTeam',
  operation: 'add' | 'subtract'
): { score: BaseballScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore.currentInning[team]++;
    newScore.totalScore[team]++;
  } else {
    if (newScore.currentInning[team] > 0) {
      newScore.currentInning[team]--;
      newScore.totalScore[team]--;
    }
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false
    }
  };
};

export const updateBaseballOuts = (
  score: BaseballScore,
  operation: 'add' | 'subtract'
): { score: BaseballScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore.outs++;
    if (newScore.outs >= 3) {
      // Cambiar de mitad de inning
      if (newScore.currentInning.isBottomHalf) {
        // Terminar inning
        newScore.innings.push({
          myTeam: newScore.currentInning.myTeam,
          rivalTeam: newScore.currentInning.rivalTeam
        });
        newScore.currentInning = { myTeam: 0, rivalTeam: 0, isBottomHalf: false };
      } else {
        newScore.currentInning.isBottomHalf = true;
      }
      newScore.outs = 0;
      newScore.bases = { first: false, second: false, third: false };
    }
  } else {
    newScore.outs = Math.max(0, newScore.outs - 1);
  }
  
  const currentInning = newScore.innings.length + 1;
  const isMatchFinished = currentInning > 9 && 
                         newScore.currentInning.isBottomHalf && 
                         newScore.totalScore.myTeam !== newScore.totalScore.rivalTeam;
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isInningFinished: newScore.outs === 0 && !newScore.currentInning.isBottomHalf,
      isMatchFinished,
      message: newScore.outs === 0 ? 
        (newScore.currentInning.isBottomHalf ? 
          `Final inning ${newScore.innings.length}` : 
          `Cambio de turno`) : 
        undefined
    }
  };
};

export const updateTennisScore = (
  score: TennisScore,
  team: 'myTeam' | 'rivalTeam',
  operation: 'add' | 'subtract'
): { score: TennisScore; status: GameStatus } => {
  const newScore = { ...score };
  const currentGame = { ...newScore.currentSet.currentGame };
  
  // Handle tie-break scoring
  if (newScore.currentSet.tieBreak) {
    if (operation === 'add') {
      newScore.currentSet.tieBreak[team]++;
    } else {
      newScore.currentSet.tieBreak[team] = Math.max(0, newScore.currentSet.tieBreak[team] - 1);
    }
    
    const myTiePoints = newScore.currentSet.tieBreak.myTeam;
    const rivalTiePoints = newScore.currentSet.tieBreak.rivalTeam;
    
    if ((myTiePoints >= 7 && myTiePoints - rivalTiePoints >= 2) || 
        (rivalTiePoints >= 7 && rivalTiePoints - myTiePoints >= 2)) {
      const winner = myTiePoints > rivalTiePoints ? 'myTeam' : 'rivalTeam';
      
      newScore.sets.push({
        myTeam: newScore.currentSet.games.myTeam,
        rivalTeam: newScore.currentSet.games.rivalTeam
      });
      
      newScore.currentSet = {
        games: { myTeam: 0, rivalTeam: 0 },
        currentGame: { myTeam: 0, rivalTeam: 0 }
      };
      
      const myWonSets = newScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
      const rivalWonSets = newScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
      const isMatchFinished = myWonSets >= 2 || rivalWonSets >= 2;
      
      return {
        score: newScore,
        status: {
          isSetFinished: true,
          isMatchFinished,
          winner,
          message: isMatchFinished ? 
            `¡Partido terminado! Ganó ${winner === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'}` :
            `Set terminado en tie-break: ${myTiePoints}-${rivalTiePoints}`
        }
      };
    }
    
    newScore.currentSet.currentGame = currentGame;
    return {
      score: newScore,
      status: { isSetFinished: false, isMatchFinished: false }
    };
  }
  
  // Regular game scoring
  if (operation === 'subtract') {
    if (currentGame[team] === 'ADV') {
      currentGame[team] = 40;
    } else if (currentGame[team] === 40) {
      currentGame[team] = 30;
    } else if (currentGame[team] === 30) {
      currentGame[team] = 15;
    } else if (currentGame[team] === 15) {
      currentGame[team] = 0;
    }
  } else {
    const otherTeam = team === 'myTeam' ? 'rivalTeam' : 'myTeam';
    
    if (currentGame[team] === 0) {
      currentGame[team] = 15;
    } else if (currentGame[team] === 15) {
      currentGame[team] = 30;
    } else if (currentGame[team] === 30) {
      currentGame[team] = 40;
    } else if (currentGame[team] === 40) {
      if (currentGame[otherTeam] === 40) {
        currentGame[team] = 'ADV';
      } else if (currentGame[otherTeam] === 'ADV') {
        currentGame[otherTeam] = 40;
      } else {
        // Win game
        newScore.currentSet.games[team]++;
        currentGame.myTeam = 0;
        currentGame.rivalTeam = 0;
        
        const myGames = newScore.currentSet.games.myTeam;
        const rivalGames = newScore.currentSet.games.rivalTeam;
        
        // Check for tie-break (6-6)
        if (myGames === 6 && rivalGames === 6) {
          newScore.currentSet.tieBreak = { myTeam: 0, rivalTeam: 0 };
          newScore.currentSet.currentGame = currentGame;
          
          return {
            score: newScore,
            status: {
              isSetFinished: false,
              isMatchFinished: false,
              message: 'Tie-break'
            }
          };
        }
        
        // Check for set win
        let isSetFinished = false;
        let winner: 'myTeam' | 'rivalTeam' | undefined;
        
        if (myGames >= 6 && myGames - rivalGames >= 2) {
          isSetFinished = true;
          winner = 'myTeam';
        } else if (rivalGames >= 6 && rivalGames - myGames >= 2) {
          isSetFinished = true;
          winner = 'rivalTeam';
        }
        
        if (isSetFinished && winner) {
          newScore.sets.push({
            myTeam: myGames,
            rivalTeam: rivalGames
          });
          
          newScore.currentSet.games = { myTeam: 0, rivalTeam: 0 };
          
          const myWonSets = newScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
          const rivalWonSets = newScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
          
          const isMatchFinished = myWonSets >= 2 || rivalWonSets >= 2;
          
          newScore.currentSet.currentGame = currentGame;
          
          return {
            score: newScore,
            status: {
              isSetFinished: true,
              isMatchFinished,
              winner,
              message: isMatchFinished ? 
                `¡Partido terminado! Ganó ${winner === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'}` :
                `Set terminado: ${myGames}-${rivalGames}. Ganó ${winner === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'}`
            }
          };
        }
      }
    } else if (currentGame[team] === 'ADV') {
      // Win game from advantage
      newScore.currentSet.games[team]++;
      currentGame.myTeam = 0;
      currentGame.rivalTeam = 0;
    }
  }
  
  newScore.currentSet.currentGame = currentGame;
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false
    }
  };
};

export const updateSoccerScore = (
  score: SoccerScore,
  team: 'myTeam' | 'rivalTeam',
  operation: 'add' | 'subtract'
): { score: SoccerScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore[team]++;
  } else {
    newScore[team] = Math.max(0, newScore[team] - 1);
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false
    }
  };
};

export const updateSoccerCards = (
  score: SoccerScore,
  team: 'myTeam' | 'rivalTeam',
  cardType: 'yellow' | 'red',
  operation: 'add' | 'subtract'
): { score: SoccerScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore.cards[team][cardType]++;
  } else {
    newScore.cards[team][cardType] = Math.max(0, newScore.cards[team][cardType] - 1);
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false,
      message: `Tarjeta ${cardType === 'yellow' ? 'amarilla' : 'roja'} - ${team === 'myTeam' ? 'Mi Equipo' : 'Equipo Rival'}`
    }
  };
};

export const updateGenericScore = (
  score: GenericScore,
  team: 'myTeam' | 'rivalTeam',
  operation: 'add' | 'subtract',
  points: number = 1
): { score: GenericScore; status: GameStatus } => {
  const newScore = { ...score };
  
  if (operation === 'add') {
    newScore[team] += points;
  } else {
    newScore[team] = Math.max(0, newScore[team] - points);
  }
  
  return {
    score: newScore,
    status: {
      isSetFinished: false,
      isMatchFinished: false
    }
  };
};

export const getScoreDisplay = (score: VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore, sport: string) => {
  if (sport === 'Voleibol') {
    const vScore = score as VolleyballScore;
    const currentSetNumber = vScore.sets.length + 1;
    const isFifthSet = currentSetNumber === 5;
    
    return {
      myTeam: vScore.currentSet.myTeam.toString(),
      rivalTeam: vScore.currentSet.rivalTeam.toString(),
      sets: vScore.sets,
      currentSetInfo: isFifthSet ? `Set 5 (Decisivo - a 15 pts)` : `Set ${currentSetNumber} (a 25 pts)`,
      isFifthSet
    };
  }
  
  if (sport === 'Baloncesto') {
    const bScore = score as BasketballScore;
    return {
      myTeam: bScore.totalScore.myTeam.toString(),
      rivalTeam: bScore.totalScore.rivalTeam.toString(),
      quarters: bScore.quarters,
      currentQuarter: bScore.currentQuarter,
      currentQuarterInfo: `Cuarto ${bScore.quarters.length + 1}`,
      fouls: bScore.fouls,
      timeouts: bScore.timeouts
    };
  }
  
  if (sport === 'Béisbol') {
    const baseScore = score as BaseballScore;
    return {
      myTeam: baseScore.totalScore.myTeam.toString(),
      rivalTeam: baseScore.totalScore.rivalTeam.toString(),
      innings: baseScore.innings,
      currentInning: baseScore.currentInning,
      currentInningInfo: `Inning ${baseScore.innings.length + 1}${baseScore.currentInning.isBottomHalf ? ' (Abajo)' : ' (Arriba)'}`,
      outs: baseScore.outs,
      bases: baseScore.bases
    };
  }
  
  if (sport === 'Tenis') {
    const tScore = score as TennisScore;
    
    if (tScore.currentSet.tieBreak) {
      return {
        myTeam: tScore.currentSet.tieBreak.myTeam.toString(),
        rivalTeam: tScore.currentSet.tieBreak.rivalTeam.toString(),
        sets: tScore.sets,
        games: tScore.currentSet.games,
        currentGameInfo: 'Tie-break',
        isTieBreak: true
      };
    }
    
    return {
      myTeam: tScore.currentSet.currentGame.myTeam.toString(),
      rivalTeam: tScore.currentSet.currentGame.rivalTeam.toString(),
      sets: tScore.sets,
      games: tScore.currentSet.games,
      currentGameInfo: `Juego ${tScore.currentSet.games.myTeam + tScore.currentSet.games.rivalTeam + 1}`,
      isTieBreak: false
    };
  }
  
  if (sport === 'Fútbol') {
    const sScore = score as SoccerScore;
    return {
      myTeam: sScore.myTeam.toString(),
      rivalTeam: sScore.rivalTeam.toString(),
      halfTime: sScore.halfTime,
      cards: sScore.cards
    };
  }
  
  const gScore = score as GenericScore;
  return {
    myTeam: gScore.myTeam.toString(),
    rivalTeam: gScore.rivalTeam.toString()
  };
};

export const getMatchResult = (score: VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore, sport: string): 'victory' | 'defeat' | 'tie' => {
  if (sport === 'Voleibol') {
    const vScore = score as VolleyballScore;
    const myWonSets = vScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
    const rivalWonSets = vScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
    
    if (myWonSets > rivalWonSets) return 'victory';
    if (rivalWonSets > myWonSets) return 'defeat';
    return 'tie';
  }
  
  if (sport === 'Baloncesto') {
    const bScore = score as BasketballScore;
    if (bScore.totalScore.myTeam > bScore.totalScore.rivalTeam) return 'victory';
    if (bScore.totalScore.rivalTeam > bScore.totalScore.myTeam) return 'defeat';
    return 'tie';
  }
  
  if (sport === 'Béisbol') {
    const baseScore = score as BaseballScore;
    if (baseScore.totalScore.myTeam > baseScore.totalScore.rivalTeam) return 'victory';
    if (baseScore.totalScore.rivalTeam > baseScore.totalScore.myTeam) return 'defeat';
    return 'tie';
  }
  
  if (sport === 'Tenis') {
    const tScore = score as TennisScore;
    const myWonSets = tScore.sets.filter(set => set.myTeam > set.rivalTeam).length;
    const rivalWonSets = tScore.sets.filter(set => set.rivalTeam > set.myTeam).length;
    
    if (myWonSets > rivalWonSets) return 'victory';
    if (rivalWonSets > myWonSets) return 'defeat';
    return 'tie';
  }
  
  if (sport === 'Fútbol') {
    const sScore = score as SoccerScore;
    if (sScore.myTeam > sScore.rivalTeam) return 'victory';
    if (sScore.rivalTeam > sScore.myTeam) return 'defeat';
    return 'tie';
  }
  
  const gScore = score as GenericScore;
  if (gScore.myTeam > gScore.rivalTeam) return 'victory';
  if (gScore.rivalTeam > gScore.myTeam) return 'defeat';
  return 'tie';
};

export const getVolleyballSetInfo = (score: VolleyballScore) => {
  const currentSetNumber = score.sets.length + 1;
  const isFifthSet = currentSetNumber === 5;
  const pointsToWin = isFifthSet ? 15 : 25;
  const myWonSets = score.sets.filter(set => set.myTeam > set.rivalTeam).length;
  const rivalWonSets = score.sets.filter(set => set.rivalTeam > set.myTeam).length;
  
  return {
    currentSetNumber,
    isFifthSet,
    pointsToWin,
    myWonSets,
    rivalWonSets,
    isMatchPoint: (score.currentSet.myTeam >= pointsToWin - 1 || score.currentSet.rivalTeam >= pointsToWin - 1),
    canFinishMatch: (myWonSets === 2 || rivalWonSets === 2)
  };
};

// Función helper para obtener el nombre de la unidad de puntuación según el deporte
export const getScoringUnit = (sport: string): string => {
  switch (sport) {
    case 'Voleibol':
    case 'Tenis':
      return 'puntos';
    case 'Fútbol':
      return 'goles';
    case 'Baloncesto':
      return 'puntos';
    case 'Béisbol':
      return 'carreras';
    case 'Natación':
    case 'Atletismo':
      return 'puntos';
    default:
      return 'puntos';
  }
};

// Timer utilities
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const updateTimer = (timer: GameTimer): GameTimer => {
  if (!timer.isRunning) return timer;
  
  const newTimer = { ...timer };
  newTimer.currentTime++;
  
  return newTimer;
};

export const toggleTimer = (timer: GameTimer): GameTimer => {
  return { ...timer, isRunning: !timer.isRunning };
};

export const resetTimer = (timer: GameTimer): GameTimer => {
  return { ...timer, currentTime: 0, isRunning: false };
};

export const nextPeriod = (timer: GameTimer): GameTimer => {
  const newTimer = { ...timer };
  newTimer.period = Math.min(timer.period + 1, timer.totalPeriods);
  newTimer.currentTime = 0;
  newTimer.isRunning = false;
  
  return newTimer;
};

// Score validation and correction functions
export const validateVolleyballScore = (score: VolleyballScore): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate completed sets
  score.sets.forEach((set, index) => {
    const isLastSet = index === 4; // 5th set (0-indexed)
    const maxPoints = isLastSet ? 15 : 25;
    
    if (set.myTeam < 0 || set.rivalTeam < 0) {
      errors.push(`Set ${index + 1}: Los puntos no pueden ser negativos`);
    }
    
    const winner = set.myTeam > set.rivalTeam ? 'myTeam' : 'rivalTeam';
    const winnerPoints = Math.max(set.myTeam, set.rivalTeam);
    const loserPoints = Math.min(set.myTeam, set.rivalTeam);
    
    if (winnerPoints < maxPoints && winnerPoints - loserPoints < 2) {
      errors.push(`Set ${index + 1}: Debe ganar por al menos ${maxPoints} puntos o con 2 puntos de diferencia`);
    }
    
    if (winnerPoints >= maxPoints && winnerPoints - loserPoints < 2) {
      errors.push(`Set ${index + 1}: Debe ganar con al menos 2 puntos de diferencia`);
    }
  });
  
  // Validate current set
  if (score.currentSet.myTeam < 0 || score.currentSet.rivalTeam < 0) {
    errors.push('Set actual: Los puntos no pueden ser negativos');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateBasketballScore = (score: BasketballScore): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate quarters sum to total
  const quartersTotal = {
    myTeam: score.quarters.reduce((sum, q) => sum + q.myTeam, 0) + score.currentQuarter.myTeam,
    rivalTeam: score.quarters.reduce((sum, q) => sum + q.rivalTeam, 0) + score.currentQuarter.rivalTeam
  };
  
  if (quartersTotal.myTeam !== score.totalScore.myTeam) {
    errors.push(`Mi Equipo: La suma de cuartos (${quartersTotal.myTeam}) no coincide con el total (${score.totalScore.myTeam})`);
  }
  
  if (quartersTotal.rivalTeam !== score.totalScore.rivalTeam) {
    errors.push(`Equipo Rival: La suma de cuartos (${quartersTotal.rivalTeam}) no coincide con el total (${score.totalScore.rivalTeam})`);
  }
  
  // Validate non-negative values
  if (score.fouls.myTeam < 0 || score.fouls.rivalTeam < 0) {
    errors.push('Las faltas no pueden ser negativas');
  }
  
  if (score.timeouts.myTeam < 0 || score.timeouts.rivalTeam < 0 || 
      score.timeouts.myTeam > 3 || score.timeouts.rivalTeam > 3) {
    errors.push('Los tiempos muertos deben estar entre 0 y 3');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateBaseballScore = (score: BaseballScore): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate innings sum to total
  const inningsTotal = {
    myTeam: score.innings.reduce((sum, i) => sum + i.myTeam, 0) + score.currentInning.myTeam,
    rivalTeam: score.innings.reduce((sum, i) => sum + i.rivalTeam, 0) + score.currentInning.rivalTeam
  };
  
  if (inningsTotal.myTeam !== score.totalScore.myTeam) {
    errors.push(`Mi Equipo: La suma de innings (${inningsTotal.myTeam}) no coincide con el total (${score.totalScore.myTeam})`);
  }
  
  if (inningsTotal.rivalTeam !== score.totalScore.rivalTeam) {
    errors.push(`Equipo Rival: La suma de innings (${inningsTotal.rivalTeam}) no coincide con el total (${score.totalScore.rivalTeam})`);
  }
  
  // Validate outs
  if (score.outs < 0 || score.outs > 3) {
    errors.push('Los outs deben estar entre 0 y 3');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateTennisScore = (score: TennisScore): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate sets
  score.sets.forEach((set, index) => {
    if (set.myTeam < 0 || set.rivalTeam < 0) {
      errors.push(`Set ${index + 1}: Los games no pueden ser negativos`);
    }
    
    const winner = set.myTeam > set.rivalTeam ? 'myTeam' : 'rivalTeam';
    const winnerGames = Math.max(set.myTeam, set.rivalTeam);
    const loserGames = Math.min(set.myTeam, set.rivalTeam);
    
    // Standard set win (6-0 to 6-4) or tie-break (7-6)
    if (winnerGames < 6) {
      errors.push(`Set ${index + 1}: Se necesitan al menos 6 games para ganar un set`);
    } else if (winnerGames === 6 && loserGames >= 5) {
      errors.push(`Set ${index + 1}: Con 6-5 o más se debe ir a 7 games o tie-break`);
    } else if (winnerGames === 7 && loserGames !== 6) {
      errors.push(`Set ${index + 1}: Un 7-X solo es válido si X=6 (tie-break)`);
    } else if (winnerGames > 7) {
      errors.push(`Set ${index + 1}: No se pueden ganar más de 7 games en un set`);
    }
  });
  
  // Validate current games
  if (score.currentSet.games.myTeam < 0 || score.currentSet.games.rivalTeam < 0) {
    errors.push('Los games actuales no pueden ser negativos');
  }
  
  // Validate current game points
  const validPoints: TennisPoint[] = [0, 15, 30, 40, 'ADV'];
  if (!validPoints.includes(score.currentSet.currentGame.myTeam) || 
      !validPoints.includes(score.currentSet.currentGame.rivalTeam)) {
    errors.push('Los puntos del game actual deben ser 0, 15, 30, 40 o ADV');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateSoccerScore = (score: SoccerScore): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (score.myTeam < 0 || score.rivalTeam < 0) {
    errors.push('Los goles no pueden ser negativos');
  }
  
  if (score.cards.myTeam.yellow < 0 || score.cards.rivalTeam.yellow < 0 ||
      score.cards.myTeam.red < 0 || score.cards.rivalTeam.red < 0) {
    errors.push('Las tarjetas no pueden ser negativas');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateGenericScore = (score: GenericScore): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (score.myTeam < 0 || score.rivalTeam < 0) {
    errors.push('Los puntos no pueden ser negativos');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateScore = (score: any, sport: string): { isValid: boolean; errors: string[] } => {
  switch (sport) {
    case 'Voleibol':
      return validateVolleyballScore(score as VolleyballScore);
    case 'Baloncesto':
      return validateBasketballScore(score as BasketballScore);
    case 'Béisbol':
      return validateBaseballScore(score as BaseballScore);
    case 'Tenis':
      return validateTennisScore(score as TennisScore);
    case 'Fútbol':
      return validateSoccerScore(score as SoccerScore);
    default:
      return validateGenericScore(score as GenericScore);
  }
};

// Score correction functions
export const recalculateBasketballScore = (score: BasketballScore): BasketballScore => {
  const corrected = { ...score };
  
  // Recalculate totals from quarters
  corrected.totalScore = {
    myTeam: corrected.quarters.reduce((sum, q) => sum + q.myTeam, 0) + corrected.currentQuarter.myTeam,
    rivalTeam: corrected.quarters.reduce((sum, q) => sum + q.rivalTeam, 0) + corrected.currentQuarter.rivalTeam
  };
  
  return corrected;
};

export const recalculateBaseballScore = (score: BaseballScore): BaseballScore => {
  const corrected = { ...score };
  
  // Recalculate totals from innings
  corrected.totalScore = {
    myTeam: corrected.innings.reduce((sum, i) => sum + i.myTeam, 0) + corrected.currentInning.myTeam,
    rivalTeam: corrected.innings.reduce((sum, i) => sum + i.rivalTeam, 0) + corrected.currentInning.rivalTeam
  };
  
  return corrected;
};

export const recalculateScore = (score: any, sport: string): any => {
  switch (sport) {
    case 'Baloncesto':
      return recalculateBasketballScore(score as BasketballScore);
    case 'Béisbol':
      return recalculateBaseballScore(score as BaseballScore);
    default:
      return score; // No recalculation needed for other sports
  }
};