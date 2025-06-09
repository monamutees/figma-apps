import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Save, RotateCcw, Trophy, AlertCircle, ArrowLeft, Clock, Plus, Minus, Timer, Zap } from 'lucide-react';
import { GameTimerComponent } from './GameTimer';
import { ScoreEditor } from './ScoreEditor';
import { 
  Match, ChildProfile, VolleyballScore, BasketballScore, BaseballScore, TennisScore, SoccerScore, 
  GenericScore, GameStatus, TeamSettings, GameTimer 
} from '../types';
import { 
  SPORT_RULES, 
  initializeScore, 
  initializeTimer,
  updateVolleyballScore, 
  updateBasketballScore,
  updateBasketballFouls,
  updateBasketballTimeouts,
  nextBasketballQuarter,
  updateBaseballScore,
  updateBaseballOuts,
  updateTennisScore, 
  updateSoccerScore,
  updateSoccerCards,
  updateGenericScore,
  getScoreDisplay,
  getMatchResult,
  getVolleyballSetInfo
} from '../utils/sportRules';
import { toast } from 'sonner@2.0.3';

interface ScoreboardProps {
  profile: ChildProfile;
  onBackToMenu?: () => void;
}

const DEFAULT_TEAM_SETTINGS: TeamSettings = {
  myTeam: {
    name: 'Mi Equipo',
    color: '#3B82F6'
  },
  rivalTeam: {
    name: 'Equipo Rival',
    color: '#EF4444'
  }
};

export const Scoreboard: React.FC<ScoreboardProps> = ({ profile, onBackToMenu }) => {
  const [score, setScore] = useState<VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore>(
    () => initializeScore(profile.sport)
  );
  const [timer, setTimer] = useState<GameTimer | null>(() => initializeTimer(profile.sport));
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [matchNotes, setMatchNotes] = useState('');
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    isSetFinished: false,
    isMatchFinished: false
  });
  const [editedScore, setEditedScore] = useState(score);
  const [isScoreValid, setIsScoreValid] = useState(true);
  const [scoreErrors, setScoreErrors] = useState<string[]>([]);
  const [showScoreEditor, setShowScoreEditor] = useState(false);

  const sportRules = SPORT_RULES[profile.sport];
  const scoreDisplay = getScoreDisplay(score, profile.sport);
  const teamSettings = profile.teamSettings || DEFAULT_TEAM_SETTINGS;

  useEffect(() => {
    // Reset score when profile changes
    setScore(initializeScore(profile.sport));
    setTimer(initializeTimer(profile.sport));
    setIsMatchFinished(false);
    setGameStatus({ isSetFinished: false, isMatchFinished: false });
  }, [profile.sport]);

  useEffect(() => {
    setEditedScore(score);
  }, [score]);

  const updateScore = (team: 'myTeam' | 'rivalTeam', operation: 'add' | 'subtract', points: number = 1) => {
    if (isMatchFinished) return;

    let newScore: VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore;
    let status: GameStatus;

    if (profile.sport === 'Voleibol') {
      const result = updateVolleyballScore(score as VolleyballScore, team, operation);
      newScore = result.score;
      status = result.status;
    } else if (profile.sport === 'Baloncesto') {
      const result = updateBasketballScore(score as BasketballScore, team, operation, points);
      newScore = result.score;
      status = result.status;
    } else if (profile.sport === 'Béisbol') {
      const result = updateBaseballScore(score as BaseballScore, team, operation);
      newScore = result.score;
      status = result.status;
    } else if (profile.sport === 'Tenis') {
      const result = updateTennisScore(score as TennisScore, team, operation);
      newScore = result.score;
      status = result.status;
    } else if (profile.sport === 'Fútbol') {
      const result = updateSoccerScore(score as SoccerScore, team, operation);
      newScore = result.score;
      status = result.status;
    } else {
      const result = updateGenericScore(score as GenericScore, team, operation, points);
      newScore = result.score;
      status = result.status;
    }

    setScore(newScore);
    setGameStatus(status);

    if (status.isMatchFinished) {
      setIsMatchFinished(true);
      toast.success(status.message || '¡Partido terminado!');
    } else if (status.isSetFinished || status.isQuarterFinished || status.isInningFinished) {
      toast.success(status.message || 'Período terminado');
    } else if (status.message) {
      toast.info(status.message);
    }
  };

  const handleSpecialAction = (action: string, team?: 'myTeam' | 'rivalTeam', value?: any) => {
    if (isMatchFinished) return;

    let newScore = score;
    let status: GameStatus = { isSetFinished: false, isMatchFinished: false };

    switch (action) {
      case 'foul':
        if (profile.sport === 'Baloncesto' && team) {
          const result = updateBasketballFouls(score as BasketballScore, team, 'add');
          newScore = result.score;
          status = result.status;
        }
        break;
      case 'timeout':
        if (profile.sport === 'Baloncesto' && team) {
          const result = updateBasketballTimeouts(score as BasketballScore, team);
          newScore = result.score;
          status = result.status;
        }
        break;
      case 'nextQuarter':
        if (profile.sport === 'Baloncesto') {
          const result = nextBasketballQuarter(score as BasketballScore);
          newScore = result.score;
          status = result.status;
        }
        break;
      case 'out':
        if (profile.sport === 'Béisbol') {
          const result = updateBaseballOuts(score as BaseballScore, 'add');
          newScore = result.score;
          status = result.status;
        }
        break;
      case 'card':
        if (profile.sport === 'Fútbol' && team && value) {
          const result = updateSoccerCards(score as SoccerScore, team, value, 'add');
          newScore = result.score;
          status = result.status;
        }
        break;
    }

    setScore(newScore);
    setGameStatus(status);

    if (status.message) {
      toast.info(status.message);
    }
  };

  const resetGame = () => {
    setScore(initializeScore(profile.sport));
    setTimer(initializeTimer(profile.sport));
    setMatchNotes('');
    setIsMatchFinished(false);
    setGameStatus({ isSetFinished: false, isMatchFinished: false });
    toast.success('Marcador reiniciado');
  };

  const backToMenu = () => {
    if (onBackToMenu) {
      onBackToMenu();
    } else {
      // Fallback method if onBackToMenu is not provided
      window.history.replaceState(null, '', window.location.pathname);
      window.location.reload();
    }
  };

  const saveMatch = () => {
    if (!isScoreValid) {
      toast.error('Por favor corrige los errores del marcador antes de guardar');
      return;
    }

    const finalScore = showScoreEditor ? editedScore : score;
    const result = getMatchResult(finalScore, profile.sport);

    const match: Match = {
      id: Date.now().toString(),
      childId: profile.id,
      sport: profile.sport,
      score: finalScore,
      teamSettings: teamSettings,
      date: new Date().toISOString(),
      notes: matchNotes,
      result,
      isFinished: isMatchFinished,
      timer: timer || undefined
    };

    const allMatches = JSON.parse(localStorage.getItem('scorekid_matches') || '[]');
    allMatches.push(match);
    localStorage.setItem('scorekid_matches', JSON.stringify(allMatches));

    toast.success('Partido guardado correctamente');
    setShowSaveDialog(false);
    setShowScoreEditor(false);
    resetGame();
  };

  const handleScoreChange = (newScore: any) => {
    setEditedScore(newScore);
  };

  const handleValidationChange = (isValid: boolean, errors: string[]) => {
    setIsScoreValid(isValid);
    setScoreErrors(errors);
  };

  const renderScoreControls = (team: 'myTeam' | 'rivalTeam') => {
    if (isMatchFinished) return null;

    return (
      <div className="space-y-2">
        {sportRules.pointIncrements.length === 1 ? (
          <div className="flex gap-1">
            <Button 
              onClick={() => updateScore(team, 'add')} 
              className="flex-1"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => updateScore(team, 'subtract')} 
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-1">
              {sportRules.pointIncrements.map((increment) => (
                <Button 
                  key={increment}
                  onClick={() => updateScore(team, 'add', increment)} 
                  className="flex-1"
                  size="sm"
                >
                  +{increment}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => updateScore(team, 'subtract', 1)} 
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Minus className="w-4 h-4 mr-1" />
              -1
            </Button>
          </>
        )}
      </div>
    );
  };

  const renderSpecialControls = (team: 'myTeam' | 'rivalTeam') => {
    if (isMatchFinished) return null;

    const controls = [];

    if (profile.sport === 'Baloncesto') {
      const bScore = score as BasketballScore;
      controls.push(
        <div key="basketball-controls" className="mt-2 space-y-1">
          <Button
            onClick={() => handleSpecialAction('foul', team)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Falta ({bScore.fouls[team]})
          </Button>
          <Button
            onClick={() => handleSpecialAction('timeout', team)}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={bScore.timeouts[team] === 0}
          >
            <Timer className="w-4 h-4 mr-1" />
            T.O ({bScore.timeouts[team]})
          </Button>
        </div>
      );
    }

    if (profile.sport === 'Fútbol') {
      controls.push(
        <div key="soccer-controls" className="mt-2 space-y-1">
          <div className="flex gap-1">
            <Button
              onClick={() => handleSpecialAction('card', team, 'yellow')}
              variant="outline"
              size="sm"
              className="flex-1 bg-yellow-100 border-yellow-300 text-yellow-800"
            >
              🟨
            </Button>
            <Button
              onClick={() => handleSpecialAction('card', team, 'red')}
              variant="outline"
              size="sm"
              className="flex-1 bg-red-100 border-red-300 text-red-800"
            >
              🟥
            </Button>
          </div>
        </div>
      );
    }

    return controls;
  };

  const renderTeamCard = (team: 'myTeam' | 'rivalTeam') => {
    const teamData = teamSettings[team];
    const teamScore = team === 'myTeam' ? scoreDisplay.myTeam : scoreDisplay.rivalTeam;

    return (
      <Card>
        <CardContent className="p-4 text-center">
          {/* Team Avatar and Name */}
          <div className="flex flex-col items-center mb-4">
            <Avatar 
              className="w-12 h-12 mb-2 border-2"
              style={{ borderColor: teamData.color }}
            >
              {teamData.avatar ? (
                <AvatarFallback className="text-xl">{teamData.avatar}</AvatarFallback>
              ) : (
                <AvatarFallback 
                  className="text-white"
                  style={{ backgroundColor: teamData.color }}
                >
                  {teamData.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <h2 
              className="text-lg font-medium"
              style={{ color: teamData.color }}
            >
              {teamData.name}
            </h2>
          </div>

          {/* Score */}
          <div 
            className="text-4xl font-bold mb-4"
            style={{ color: teamData.color }}
          >
            {teamScore}
          </div>

          {/* Sport-specific indicators */}
          {profile.sport === 'Fútbol' && 'cards' in scoreDisplay && (
            <div className="flex justify-center gap-2 mb-2">
              {scoreDisplay.cards[team].yellow > 0 && (
                <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
                  🟨 {scoreDisplay.cards[team].yellow}
                </Badge>
              )}
              {scoreDisplay.cards[team].red > 0 && (
                <Badge variant="outline" className="bg-red-100 border-red-300 text-red-800">
                  🟥 {scoreDisplay.cards[team].red}
                </Badge>
              )}
            </div>
          )}

          {/* Controls */}
          {renderScoreControls(team)}
          {renderSpecialControls(team)}
        </CardContent>
      </Card>
    );
  };

  const renderGameInfo = () => {
    if (profile.sport === 'Voleibol' && 'sets' in scoreDisplay) {
      const vScore = score as VolleyballScore;
      const setInfo = getVolleyballSetInfo(vScore);
      
      return (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm">Sets ganados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-lg font-semibold">
                {setInfo.myWonSets} - {setInfo.rivalWonSets}
              </span>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">{scoreDisplay.currentSetInfo}</p>
              
              {setInfo.isFifthSet && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Set decisivo</span>
                </div>
              )}
            </div>
            
            {vScore.sets.length > 0 && (
              <div className="mt-2 space-y-1">
                {vScore.sets.map((set, index) => (
                  <div key={index} className="text-xs text-gray-600 text-center">
                    Set {index + 1}: {set.myTeam}-{set.rivalTeam}
                    {set.myTeam > set.rivalTeam ? ' ✓' : ' ✗'}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (profile.sport === 'Tenis' && 'games' in scoreDisplay) {
      const tScore = score as TennisScore;
      const isTieBreak = 'isTieBreak' in scoreDisplay && scoreDisplay.isTieBreak;
      
      return (
        <Card className="mb-4">
          <CardContent className="p-4">
            {/* Current Game Score */}
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-2">
                {isTieBreak ? 'Tie-break' : scoreDisplay.currentGameInfo}
              </div>
              <div className="text-lg font-semibold">
                Juegos: {scoreDisplay.games.myTeam} - {scoreDisplay.games.rivalTeam}
              </div>
            </div>

            {/* Sets Table - Always show, including current set */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 text-center mb-2">
                {tScore.sets.length > 0 ? 'Resumen de sets' : 'Set actual'}
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">Equipo</th>
                      {tScore.sets.map((_, index) => (
                        <th key={index} className="px-3 py-2 text-center">
                          Set {index + 1}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center bg-blue-50">
                        Set {tScore.sets.length + 1}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-medium" style={{ color: teamSettings.myTeam.color }}>
                        <div className="flex items-center gap-2">
                          {teamSettings.myTeam.avatar && (
                            <span className="text-xs">{teamSettings.myTeam.avatar}</span>
                          )}
                          <span className="truncate">{teamSettings.myTeam.name}</span>
                        </div>
                      </td>
                      {tScore.sets.map((set, index) => (
                        <td 
                          key={index} 
                          className={`px-3 py-2 text-center font-semibold ${
                            set.myTeam > set.rivalTeam ? 'bg-green-50 text-green-800' : 'text-gray-600'
                          }`}
                        >
                          {set.myTeam}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-semibold bg-blue-50 text-blue-800">
                        {scoreDisplay.games.myTeam}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-medium" style={{ color: teamSettings.rivalTeam.color }}>
                        <div className="flex items-center gap-2">
                          {teamSettings.rivalTeam.avatar && (
                            <span className="text-xs">{teamSettings.rivalTeam.avatar}</span>
                          )}
                          <span className="truncate">{teamSettings.rivalTeam.name}</span>
                        </div>
                      </td>
                      {tScore.sets.map((set, index) => (
                        <td 
                          key={index} 
                          className={`px-3 py-2 text-center font-semibold ${
                            set.rivalTeam > set.myTeam ? 'bg-green-50 text-green-800' : 'text-gray-600'
                          }`}
                        >
                          {set.rivalTeam}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-semibold bg-blue-50 text-blue-800">
                        {scoreDisplay.games.rivalTeam}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Sets summary - only show if there are completed sets */}
              {tScore.sets.length > 0 && (
                <div className="text-center mt-2">
                  <div className="text-xs text-gray-600">
                    Sets ganados: {tScore.sets.filter(set => set.myTeam > set.rivalTeam).length} - {tScore.sets.filter(set => set.rivalTeam > set.myTeam).length}
                  </div>
                </div>
              )}
            </div>

            {/* Special conditions indicators */}
            <div className="space-y-2">
              {isTieBreak && (
                <div className="flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Tie-break en curso</span>
                </div>
              )}
              
              {scoreDisplay.games.myTeam === 6 && scoreDisplay.games.rivalTeam === 6 && !isTieBreak && (
                <div className="flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Próximo punto inicia tie-break</span>
                </div>
              )}
              
              {tScore.sets.length === 2 && (
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">Set decisivo</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (profile.sport === 'Baloncesto' && 'quarters' in scoreDisplay) {
      return (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm">{scoreDisplay.currentQuarterInfo}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {scoreDisplay.quarters.length > 0 && (
              <div className="space-y-1">
                {scoreDisplay.quarters.map((quarter, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Q{index + 1}:</span>
                    <span>{quarter.myTeam} - {quarter.rivalTeam}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center">
              <Button
                onClick={() => handleSpecialAction('nextQuarter')}
                variant="outline"
                size="sm"
              >
                Terminar cuarto
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (profile.sport === 'Béisbol' && 'innings' in scoreDisplay) {
      const baseScore = score as BaseballScore;
      return (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm">{scoreDisplay.currentInningInfo}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="text-center">
              <Badge variant="outline">Outs: {baseScore.outs}/3</Badge>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => handleSpecialAction('out')}
                variant="outline"
                size="sm"
              >
                Out
              </Button>
            </div>
            {baseScore.bases && (
              <div className="text-center">
                <div className="text-xs text-gray-600">Bases:</div>
                <div className="flex justify-center gap-1 mt-1">
                  <Badge variant={baseScore.bases.first ? "default" : "outline"} className="text-xs">1ª</Badge>
                  <Badge variant={baseScore.bases.second ? "default" : "outline"} className="text-xs">2ª</Badge>
                  <Badge variant={baseScore.bases.third ? "default" : "outline"} className="text-xs">3ª</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Button 
                onClick={backToMenu} 
                variant="ghost" 
                size="sm"
                className="p-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Menú
              </Button>
              {isMatchFinished && (
                <div className="flex items-center gap-2 text-green-600">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">Terminado</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-xl">{profile.name}</h1>
              <p className="text-gray-600">{profile.sport}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        {timer && (
          <GameTimerComponent
            timer={timer}
            onUpdate={setTimer}
            sport={profile.sport}
          />
        )}

        {/* Game Info */}
        {renderGameInfo()}

        {/* Scoreboard */}
        <div className="grid grid-cols-2 gap-4">
          {renderTeamCard('myTeam')}
          {renderTeamCard('rivalTeam')}
        </div>

        {/* Game Status Messages */}
        {gameStatus.message && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-green-800 font-medium">{gameStatus.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button onClick={() => setShowSaveDialog(true)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Guardar partido
            </Button>
            
            <Button onClick={resetGame} variant="destructive" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar partido
            </Button>
          </CardContent>
        </Card>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={(open) => {
          setShowSaveDialog(open);
          if (!open) {
            setShowScoreEditor(false);
            setEditedScore(score);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Guardar partido</DialogTitle>
              <DialogDescription>
                {showScoreEditor 
                  ? 'Corrige el marcador si es necesario antes de guardar'
                  : 'Revisa el resultado y guarda el partido con notas opcionales'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!showScoreEditor ? (
                <>
                  {/* Current Score Display */}
                  <div className="text-center space-y-2">
                    <p><strong>Resultado:</strong></p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          {teamSettings.myTeam.avatar && (
                            <span>{teamSettings.myTeam.avatar}</span>
                          )}
                          <span className="text-sm">{teamSettings.myTeam.name}</span>
                        </div>
                        <span className="text-2xl font-bold">{scoreDisplay.myTeam}</span>
                      </div>
                      <span className="text-lg">-</span>
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          {teamSettings.rivalTeam.avatar && (
                            <span>{teamSettings.rivalTeam.avatar}</span>
                          )}
                          <span className="text-sm">{teamSettings.rivalTeam.name}</span>
                        </div>
                        <span className="text-2xl font-bold">{scoreDisplay.rivalTeam}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notas del partido (opcional)</Label>
                    <Textarea
                      value={matchNotes}
                      onChange={(e) => setMatchNotes(e.target.value)}
                      placeholder="Agrega notas sobre el partido..."
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={saveMatch} className="flex-1">
                      Guardar
                    </Button>
                    <Button 
                      onClick={() => setShowScoreEditor(true)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Corregir marcador
                    </Button>
                    <Button 
                      onClick={() => setShowSaveDialog(false)} 
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Score Editor */}
                  <ScoreEditor
                    score={score}
                    sport={profile.sport}
                    onScoreChange={handleScoreChange}
                    onValidationChange={handleValidationChange}
                  />

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notas del partido (opcional)</Label>
                    <Textarea
                      value={matchNotes}
                      onChange={(e) => setMatchNotes(e.target.value)}
                      placeholder="Agrega notas sobre el partido..."
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={saveMatch} 
                      className="flex-1"
                      disabled={!isScoreValid}
                    >
                      Guardar con correcciones
                    </Button>
                    <Button 
                      onClick={() => setShowScoreEditor(false)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button 
                      onClick={() => setShowSaveDialog(false)} 
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};