import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, X, Minus, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { Match, ChildProfile, VolleyballScore, TennisScore, GenericScore } from '../types';
import { isLegacyMatch, migrateLegacyMatch } from '../utils/migrateLegacyData';

interface MatchHistoryProps {
  profile: ChildProfile;
  onBackToMenu: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ profile, onBackToMenu }) => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadMatches();
  }, [profile]);

  const loadMatches = () => {
    try {
      const allMatches = JSON.parse(localStorage.getItem('scorekid_matches') || '[]');
      const profileMatches = allMatches
        .filter((match: any) => match.childId === profile.id)
        .map((match: any) => {
          // Migrate legacy matches to new format
          if (isLegacyMatch(match)) {
            return migrateLegacyMatch(match, profile.sport);
          }
          // Ensure new matches have all required properties
          return {
            ...match,
            sport: match.sport || profile.sport || 'Otro',
            isFinished: match.isFinished !== undefined ? match.isFinished : true
          } as Match;
        })
        .sort((a: Match, b: Match) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setMatches(profileMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      setMatches([]);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'victory':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Victoria</Badge>;
      case 'defeat':
        return <Badge variant="destructive">Derrota</Badge>;
      case 'tie':
        return <Badge variant="secondary">Empate</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'victory':
        return <Trophy className="w-4 h-4 text-green-600" />;
      case 'defeat':
        return <X className="w-4 h-4 text-red-600" />;
      case 'tie':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getScoreDisplay = (match: Match): string => {
    try {
      if (!match.score) {
        return 'Score no disponible';
      }

      if (match.sport === 'Voleibol') {
        const score = match.score as VolleyballScore;
        if (!score.sets || !score.currentSet) {
          // Fallback for malformed volleyball scores
          const genericScore = match.score as GenericScore;
          return `${genericScore.myTeam || 0}-${genericScore.rivalTeam || 0}`;
        }
        
        const myWonSets = score.sets.filter(set => set.myTeam > set.rivalTeam).length;
        const rivalWonSets = score.sets.filter(set => set.rivalTeam > set.myTeam).length;
        
        if (match.isFinished && score.sets.length > 0) {
          return `Sets: ${myWonSets}-${rivalWonSets}`;
        } else {
          return `${score.currentSet.myTeam}-${score.currentSet.rivalTeam} (Set ${score.sets.length + 1})`;
        }
      }
      
      if (match.sport === 'Tenis') {
        const score = match.score as TennisScore;
        if (!score.sets || !score.currentSet) {
          // Fallback for malformed tennis scores
          const genericScore = match.score as GenericScore;
          return `${genericScore.myTeam || 0}-${genericScore.rivalTeam || 0}`;
        }
        
        const myWonSets = score.sets.filter(set => set && set.myTeam > set.rivalTeam).length;
        const rivalWonSets = score.sets.filter(set => set && set.rivalTeam > set.myTeam).length;
        
        if (match.isFinished && score.sets.length > 0) {
          return `Sets: ${myWonSets}-${rivalWonSets}`;
        } else {
          const games = score.currentSet.games || { myTeam: 0, rivalTeam: 0 };
          return `Sets: ${myWonSets}-${rivalWonSets}, Juegos: ${games.myTeam}-${games.rivalTeam}`;
        }
      }
      
      // Generic score or fallback
      const score = match.score as GenericScore;
      return `${score.myTeam || 0}-${score.rivalTeam || 0}`;
    } catch (error) {
      console.error('Error displaying score:', error);
      return 'Error en puntuación';
    }
  };

  const getDetailedScore = (match: Match): string[] => {
    const details: string[] = [];
    
    try {
      if (!match.score) {
        return ['Score no disponible'];
      }

      if (match.sport === 'Voleibol') {
        const score = match.score as VolleyballScore;
        if (score.sets && Array.isArray(score.sets)) {
          score.sets.forEach((set, index) => {
            details.push(`Set ${index + 1}: ${set.myTeam}-${set.rivalTeam}`);
          });
          if (!match.isFinished && score.currentSet) {
            details.push(`Set actual: ${score.currentSet.myTeam}-${score.currentSet.rivalTeam}`);
          }
        }
      } else if (match.sport === 'Tenis') {
        const score = match.score as TennisScore;
        if (score.sets && Array.isArray(score.sets)) {
          score.sets.forEach((set, index) => {
            if (set) {
              details.push(`Set ${index + 1}: ${set.myTeam}-${set.rivalTeam}`);
            }
          });
          if (!match.isFinished && score.currentSet) {
            if (score.currentSet.games) {
              details.push(`Juegos actuales: ${score.currentSet.games.myTeam}-${score.currentSet.games.rivalTeam}`);
            }
            if (score.currentSet.currentGame) {
              details.push(`Puntos: ${score.currentSet.currentGame.myTeam}-${score.currentSet.currentGame.rivalTeam}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting detailed score:', error);
      details.push('Error obteniendo detalles');
    }
    
    return details;
  };

  const getStats = () => {
    const victories = matches.filter(m => m.result === 'victory').length;
    const defeats = matches.filter(m => m.result === 'defeat').length;
    const ties = matches.filter(m => m.result === 'tie').length;
    
    return { victories, defeats, ties, total: matches.length };
  };

  const stats = getStats();

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button 
                  onClick={onBackToMenu} 
                  variant="ghost" 
                  size="sm"
                  className="p-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Menú
                </Button>
                <h1 className="text-xl font-medium">Historial</h1>
                <div className="w-16" /> {/* Spacer */}
              </div>
              <div className="text-center mt-2">
                <p className="text-gray-600">{profile.name} - {profile.sport}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Trophy className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-2">No hay partidos guardados</p>
              <p className="text-sm text-gray-500">
                Los partidos que guardes aparecerán aquí
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                onClick={onBackToMenu} 
                variant="ghost" 
                size="sm"
                className="p-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Menú
              </Button>
              <h1 className="text-xl font-medium">Historial</h1>
              <div className="w-16" /> {/* Spacer */}
            </div>
            <div className="text-center mt-2">
              <p className="text-gray-600">{profile.name} - {profile.sport}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.victories}</div>
                <div className="text-xs text-gray-600">Victorias</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.defeats}</div>
                <div className="text-xs text-gray-600">Derrotas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.ties}</div>
                <div className="text-xs text-gray-600">Empates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches list */}
        <div className="space-y-3">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getResultIcon(match.result)}
                    <div>
                      <div className="font-bold">{getScoreDisplay(match)}</div>
                      <div className="text-xs text-gray-500">{match.sport}</div>
                      {match.isFinished && (
                        <div className="text-xs text-green-600">Partido terminado</div>
                      )}
                    </div>
                  </div>
                  {getResultBadge(match.result)}
                </div>

                {/* Detailed score for sports with sets */}
                {(match.sport === 'Voleibol' || match.sport === 'Tenis') && (
                  <div className="mb-3">
                    {getDetailedScore(match).map((detail, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {detail}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(match.date)}</span>
                  </div>

                  {match.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5" />
                      <span className="flex-1">{match.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};