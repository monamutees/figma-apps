import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { GameTimer } from '../types';
import { formatTime, updateTimer, toggleTimer, resetTimer, nextPeriod } from '../utils/sportRules';

interface GameTimerProps {
  timer: GameTimer;
  onUpdate: (timer: GameTimer) => void;
  sport: string;
}

export const GameTimerComponent: React.FC<GameTimerProps> = ({ timer, onUpdate, sport }) => {
  const [currentTimer, setCurrentTimer] = useState<GameTimer>(timer);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTimer.isRunning) {
        const newTimer = updateTimer(currentTimer);
        setCurrentTimer(newTimer);
        onUpdate(newTimer);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTimer, onUpdate]);

  useEffect(() => {
    setCurrentTimer(timer);
  }, [timer]);

  const handleToggle = () => {
    const newTimer = toggleTimer(currentTimer);
    setCurrentTimer(newTimer);
    onUpdate(newTimer);
  };

  const handleReset = () => {
    const newTimer = resetTimer(currentTimer);
    setCurrentTimer(newTimer);
    onUpdate(newTimer);
  };

  const handleNextPeriod = () => {
    const newTimer = nextPeriod(currentTimer);
    setCurrentTimer(newTimer);
    onUpdate(newTimer);
  };

  const getPeriodName = () => {
    switch (sport) {
      case 'Baloncesto':
        return `Cuarto ${currentTimer.period}`;
      case 'Fútbol':
        return currentTimer.period === 1 ? 'Primer Tiempo' : 'Segundo Tiempo';
      default:
        return `Período ${currentTimer.period}`;
    }
  };

  const getTimeDisplay = () => {
    if (sport === 'Fútbol') {
      // Para fútbol, mostrar tiempo transcurrido
      return formatTime(currentTimer.currentTime);
    } else {
      // Para otros deportes, mostrar tiempo restante
      const remaining = Math.max(0, currentTimer.totalTime - currentTimer.currentTime);
      return formatTime(remaining);
    }
  };

  const isTimeUp = sport !== 'Fútbol' && currentTimer.currentTime >= currentTimer.totalTime;
  const canAdvancePeriod = currentTimer.period < currentTimer.totalPeriods;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-1">{getPeriodName()}</div>
          <div 
            className={`text-3xl font-mono font-bold ${
              isTimeUp ? 'text-red-600' : currentTimer.isRunning ? 'text-green-600' : 'text-gray-900'
            }`}
          >
            {getTimeDisplay()}
          </div>
          {sport === 'Fútbol' && currentTimer.stoppage && currentTimer.stoppage > 0 && (
            <div className="text-sm text-orange-600">
              +{formatTime(currentTimer.stoppage)} tiempo añadido
            </div>
          )}
          {isTimeUp && (
            <div className="text-sm text-red-600 font-medium">¡Tiempo terminado!</div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleToggle}
            variant={currentTimer.isRunning ? "destructive" : "default"}
            size="sm"
          >
            {currentTimer.isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </>
            )}
          </Button>

          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>

          {canAdvancePeriod && (
            <Button onClick={handleNextPeriod} variant="outline" size="sm">
              <SkipForward className="w-4 h-4 mr-1" />
              Siguiente
            </Button>
          )}
        </div>

        {sport === 'Fútbol' && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  const newTimer = { ...currentTimer, stoppage: (currentTimer.stoppage || 0) + 60 };
                  setCurrentTimer(newTimer);
                  onUpdate(newTimer);
                }}
                variant="outline"
                size="sm"
              >
                +1 min
              </Button>
              <Button
                onClick={() => {
                  const newTimer = { ...currentTimer, stoppage: (currentTimer.stoppage || 0) + 180 };
                  setCurrentTimer(newTimer);
                  onUpdate(newTimer);
                }}
                variant="outline"
                size="sm"
              >
                +3 min
              </Button>
              <Button
                onClick={() => {
                  const newTimer = { ...currentTimer, stoppage: (currentTimer.stoppage || 0) + 300 };
                  setCurrentTimer(newTimer);
                  onUpdate(newTimer);
                }}
                variant="outline"
                size="sm"
              >
                +5 min
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};