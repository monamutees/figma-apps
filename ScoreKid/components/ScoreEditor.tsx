import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { 
  VolleyballScore, BasketballScore, BaseballScore, TennisScore, SoccerScore, GenericScore, TennisPoint 
} from '../types';
import { validateScore, recalculateScore } from '../utils/sportRules';

interface ScoreEditorProps {
  score: VolleyballScore | BasketballScore | BaseballScore | TennisScore | SoccerScore | GenericScore;
  sport: string;
  onScoreChange: (newScore: any) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
}

export const ScoreEditor: React.FC<ScoreEditorProps> = ({ 
  score, 
  sport, 
  onScoreChange, 
  onValidationChange 
}) => {
  const [editedScore, setEditedScore] = useState(score);
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: [] as string[] });

  useEffect(() => {
    setEditedScore(score);
  }, [score]);

  useEffect(() => {
    const result = validateScore(editedScore, sport);
    setValidationResult(result);
    onValidationChange(result.isValid, result.errors);
  }, [editedScore, sport, onValidationChange]);

  const handleScoreUpdate = (newScore: any) => {
    const correctedScore = recalculateScore(newScore, sport);
    setEditedScore(correctedScore);
    onScoreChange(correctedScore);
  };

  const resetToOriginal = () => {
    setEditedScore(score);
    onScoreChange(score);
  };

  const renderVolleyballEditor = () => {
    const vScore = editedScore as VolleyballScore;

    return (
      <div className="space-y-4">
        {/* Completed Sets */}
        {vScore.sets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sets Completados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vScore.sets.map((set, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">Set {index + 1}:</Label>
                  <Input
                    type="number"
                    value={set.myTeam}
                    onChange={(e) => {
                      const newSets = [...vScore.sets];
                      newSets[index] = { ...newSets[index], myTeam: parseInt(e.target.value) || 0 };
                      handleScoreUpdate({ ...vScore, sets: newSets });
                    }}
                    className="text-center"
                    min="0"
                  />
                  <Input
                    type="number"
                    value={set.rivalTeam}
                    onChange={(e) => {
                      const newSets = [...vScore.sets];
                      newSets[index] = { ...newSets[index], rivalTeam: parseInt(e.target.value) || 0 };
                      handleScoreUpdate({ ...vScore, sets: newSets });
                    }}
                    className="text-center"
                    min="0"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Set */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Set Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">Puntos:</Label>
              <Input
                type="number"
                value={vScore.currentSet.myTeam}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...vScore,
                    currentSet: { ...vScore.currentSet, myTeam: parseInt(e.target.value) || 0 }
                  });
                }}
                className="text-center"
                min="0"
              />
              <Input
                type="number"
                value={vScore.currentSet.rivalTeam}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...vScore,
                    currentSet: { ...vScore.currentSet, rivalTeam: parseInt(e.target.value) || 0 }
                  });
                }}
                className="text-center"
                min="0"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBasketballEditor = () => {
    const bScore = editedScore as BasketballScore;

    return (
      <Tabs defaultValue="quarters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quarters">Cuartos</TabsTrigger>
          <TabsTrigger value="totals">Totales</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="quarters" className="space-y-4">
          {/* Completed Quarters */}
          {bScore.quarters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cuartos Completados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bScore.quarters.map((quarter, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center">
                    <Label className="text-sm">Q{index + 1}:</Label>
                    <Input
                      type="number"
                      value={quarter.myTeam}
                      onChange={(e) => {
                        const newQuarters = [...bScore.quarters];
                        newQuarters[index] = { ...newQuarters[index], myTeam: parseInt(e.target.value) || 0 };
                        handleScoreUpdate({ ...bScore, quarters: newQuarters });
                      }}
                      className="text-center"
                      min="0"
                    />
                    <Input
                      type="number"
                      value={quarter.rivalTeam}
                      onChange={(e) => {
                        const newQuarters = [...bScore.quarters];
                        newQuarters[index] = { ...newQuarters[index], rivalTeam: parseInt(e.target.value) || 0 };
                        handleScoreUpdate({ ...bScore, quarters: newQuarters });
                      }}
                      className="text-center"
                      min="0"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Current Quarter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cuarto Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">Puntos:</Label>
                <Input
                  type="number"
                  value={bScore.currentQuarter.myTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...bScore,
                      currentQuarter: { ...bScore.currentQuarter, myTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                />
                <Input
                  type="number"
                  value={bScore.currentQuarter.rivalTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...bScore,
                      currentQuarter: { ...bScore.currentQuarter, rivalTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="totals">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Puntuación Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">Total:</Label>
                <div className="text-center font-semibold">{bScore.totalScore.myTeam}</div>
                <div className="text-center font-semibold">{bScore.totalScore.rivalTeam}</div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Los totales se calculan automáticamente sumando los cuartos
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Faltas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">Faltas:</Label>
                <Input
                  type="number"
                  value={bScore.fouls.myTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...bScore,
                      fouls: { ...bScore.fouls, myTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                />
                <Input
                  type="number"
                  value={bScore.fouls.rivalTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...bScore,
                      fouls: { ...bScore.fouls, rivalTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tiempos Muertos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">T.O. restantes:</Label>
                <Input
                  type="number"
                  value={bScore.timeouts.myTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...bScore,
                      timeouts: { ...bScore.timeouts, myTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                  max="3"
                />
                <Input
                  type="number"
                  value={bScore.timeouts.rivalTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...bScore,
                      timeouts: { ...bScore.timeouts, rivalTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                  max="3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  const renderTennisEditor = () => {
    const tScore = editedScore as TennisScore;

    return (
      <div className="space-y-4">
        {/* Completed Sets */}
        {tScore.sets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sets Completados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tScore.sets.map((set, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                  <Label className="text-sm">Set {index + 1}:</Label>
                  <Input
                    type="number"
                    value={set.myTeam}
                    onChange={(e) => {
                      const newSets = [...tScore.sets];
                      newSets[index] = { ...newSets[index], myTeam: parseInt(e.target.value) || 0 };
                      handleScoreUpdate({ ...tScore, sets: newSets });
                    }}
                    className="text-center"
                    min="0"
                    max="7"
                  />
                  <Input
                    type="number"
                    value={set.rivalTeam}
                    onChange={(e) => {
                      const newSets = [...tScore.sets];
                      newSets[index] = { ...newSets[index], rivalTeam: parseInt(e.target.value) || 0 };
                      handleScoreUpdate({ ...tScore, sets: newSets });
                    }}
                    className="text-center"
                    min="0"
                    max="7"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Set */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Set Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">Games:</Label>
              <Input
                type="number"
                value={tScore.currentSet.games.myTeam}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...tScore,
                    currentSet: {
                      ...tScore.currentSet,
                      games: { ...tScore.currentSet.games, myTeam: parseInt(e.target.value) || 0 }
                    }
                  });
                }}
                className="text-center"
                min="0"
              />
              <Input
                type="number"
                value={tScore.currentSet.games.rivalTeam}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...tScore,
                    currentSet: {
                      ...tScore.currentSet,
                      games: { ...tScore.currentSet.games, rivalTeam: parseInt(e.target.value) || 0 }
                    }
                  });
                }}
                className="text-center"
                min="0"
              />
            </div>

            {/* Current Game Points */}
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">Puntos actuales:</Label>
              <select
                value={tScore.currentSet.currentGame.myTeam}
                onChange={(e) => {
                  const value = e.target.value === 'ADV' ? 'ADV' : parseInt(e.target.value) as TennisPoint;
                  handleScoreUpdate({
                    ...tScore,
                    currentSet: {
                      ...tScore.currentSet,
                      currentGame: { ...tScore.currentSet.currentGame, myTeam: value }
                    }
                  });
                }}
                className="px-3 py-2 border rounded-md text-center"
              >
                <option value={0}>0</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value="ADV">ADV</option>
              </select>
              <select
                value={tScore.currentSet.currentGame.rivalTeam}
                onChange={(e) => {
                  const value = e.target.value === 'ADV' ? 'ADV' : parseInt(e.target.value) as TennisPoint;
                  handleScoreUpdate({
                    ...tScore,
                    currentSet: {
                      ...tScore.currentSet,
                      currentGame: { ...tScore.currentSet.currentGame, rivalTeam: value }
                    }
                  });
                }}
                className="px-3 py-2 border rounded-md text-center"
              >
                <option value={0}>0</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value="ADV">ADV</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSoccerEditor = () => {
    const sScore = editedScore as SoccerScore;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Goles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">Goles:</Label>
              <Input
                type="number"
                value={sScore.myTeam}
                onChange={(e) => {
                  handleScoreUpdate({ ...sScore, myTeam: parseInt(e.target.value) || 0 });
                }}
                className="text-center"
                min="0"
              />
              <Input
                type="number"
                value={sScore.rivalTeam}
                onChange={(e) => {
                  handleScoreUpdate({ ...sScore, rivalTeam: parseInt(e.target.value) || 0 });
                }}
                className="text-center"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tarjetas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">🟨 Amarillas:</Label>
              <Input
                type="number"
                value={sScore.cards.myTeam.yellow}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...sScore,
                    cards: {
                      ...sScore.cards,
                      myTeam: { ...sScore.cards.myTeam, yellow: parseInt(e.target.value) || 0 }
                    }
                  });
                }}
                className="text-center"
                min="0"
              />
              <Input
                type="number"
                value={sScore.cards.rivalTeam.yellow}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...sScore,
                    cards: {
                      ...sScore.cards,
                      rivalTeam: { ...sScore.cards.rivalTeam, yellow: parseInt(e.target.value) || 0 }
                    }
                  });
                }}
                className="text-center"
                min="0"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">🟥 Rojas:</Label>
              <Input
                type="number"
                value={sScore.cards.myTeam.red}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...sScore,
                    cards: {
                      ...sScore.cards,
                      myTeam: { ...sScore.cards.myTeam, red: parseInt(e.target.value) || 0 }
                    }
                  });
                }}
                className="text-center"
                min="0"
              />
              <Input
                type="number"
                value={sScore.cards.rivalTeam.red}
                onChange={(e) => {
                  handleScoreUpdate({
                    ...sScore,
                    cards: {
                      ...sScore.cards,
                      rivalTeam: { ...sScore.cards.rivalTeam, red: parseInt(e.target.value) || 0 }
                    }
                  });
                }}
                className="text-center"
                min="0"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBaseballEditor = () => {
    const baseScore = editedScore as BaseballScore;

    return (
      <Tabs defaultValue="innings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="innings">Innings</TabsTrigger>
          <TabsTrigger value="totals">Totales</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="innings" className="space-y-4">
          {/* Completed Innings */}
          {baseScore.innings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Innings Completados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {baseScore.innings.map((inning, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center">
                    <Label className="text-sm">Inning {index + 1}:</Label>
                    <Input
                      type="number"
                      value={inning.myTeam}
                      onChange={(e) => {
                        const newInnings = [...baseScore.innings];
                        newInnings[index] = { ...newInnings[index], myTeam: parseInt(e.target.value) || 0 };
                        handleScoreUpdate({ ...baseScore, innings: newInnings });
                      }}
                      className="text-center"
                      min="0"
                    />
                    <Input
                      type="number"
                      value={inning.rivalTeam}
                      onChange={(e) => {
                        const newInnings = [...baseScore.innings];
                        newInnings[index] = { ...newInnings[index], rivalTeam: parseInt(e.target.value) || 0 };
                        handleScoreUpdate({ ...baseScore, innings: newInnings });
                      }}
                      className="text-center"
                      min="0"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Current Inning */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Inning Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">Carreras:</Label>
                <Input
                  type="number"
                  value={baseScore.currentInning.myTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...baseScore,
                      currentInning: { ...baseScore.currentInning, myTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                />
                <Input
                  type="number"
                  value={baseScore.currentInning.rivalTeam}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...baseScore,
                      currentInning: { ...baseScore.currentInning, rivalTeam: parseInt(e.target.value) || 0 }
                    });
                  }}
                  className="text-center"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="totals">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Carreras Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label className="text-sm">Total:</Label>
                <div className="text-center font-semibold">{baseScore.totalScore.myTeam}</div>
                <div className="text-center font-semibold">{baseScore.totalScore.rivalTeam}</div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Los totales se calculan automáticamente sumando los innings
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Estado del Juego</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-sm">Outs:</Label>
                <Input
                  type="number"
                  value={baseScore.outs}
                  onChange={(e) => {
                    handleScoreUpdate({
                      ...baseScore,
                      outs: parseInt(e.target.value) || 0
                    });
                  }}
                  className="text-center"
                  min="0"
                  max="3"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Bases ocupadas:</Label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={baseScore.bases.first}
                      onChange={(e) => {
                        handleScoreUpdate({
                          ...baseScore,
                          bases: { ...baseScore.bases, first: e.target.checked }
                        });
                      }}
                    />
                    <span className="text-sm">1ª</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={baseScore.bases.second}
                      onChange={(e) => {
                        handleScoreUpdate({
                          ...baseScore,
                          bases: { ...baseScore.bases, second: e.target.checked }
                        });
                      }}
                    />
                    <span className="text-sm">2ª</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={baseScore.bases.third}
                      onChange={(e) => {
                        handleScoreUpdate({
                          ...baseScore,
                          bases: { ...baseScore.bases, third: e.target.checked }
                        });
                      }}
                    />
                    <span className="text-sm">3ª</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };

  const renderGenericEditor = () => {
    const gScore = editedScore as GenericScore;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Puntuación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label className="text-sm">Puntos:</Label>
            <Input
              type="number"
              value={gScore.myTeam}
              onChange={(e) => {
                handleScoreUpdate({ ...gScore, myTeam: parseInt(e.target.value) || 0 });
              }}
              className="text-center"
              min="0"
            />
            <Input
              type="number"
              value={gScore.rivalTeam}
              onChange={(e) => {
                handleScoreUpdate({ ...gScore, rivalTeam: parseInt(e.target.value) || 0 });
              }}
              className="text-center"
              min="0"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEditor = () => {
    switch (sport) {
      case 'Voleibol':
        return renderVolleyballEditor();
      case 'Baloncesto':
        return renderBasketballEditor();
      case 'Béisbol':
        return renderBaseballEditor();
      case 'Tenis':
        return renderTennisEditor();
      case 'Fútbol':
        return renderSoccerEditor();
      default:
        return renderGenericEditor();
    }
  };

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {validationResult.isValid ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Marcador válido</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Marcador inválido</span>
            </>
          )}
        </div>
        <Button onClick={resetToOriginal} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-1" />
          Resetear
        </Button>
      </div>

      {/* Validation Errors */}
      {!validationResult.isValid && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationResult.errors.map((error, index) => (
                <div key={index} className="text-sm">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Score Editor */}
      {renderEditor()}
    </div>
  );
};