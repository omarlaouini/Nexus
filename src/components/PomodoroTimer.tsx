import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PomodoroTimerProps {
  onComplete?: (duration: number) => void;
  className?: string;
}

export function PomodoroTimer({ onComplete, className }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (onComplete) onComplete(mode === 'work' ? 25 * 60 : 5 * 60);
      // Simple toggle for demo
      setMode(mode === 'work' ? 'break' : 'work');
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onComplete]);

  useEffect(() => {
    resetTimer();
  }, [mode, resetTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`overflow-hidden border-slate-200 ${className}`}>
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-600">
          <Timer className="w-4 h-4" />
          Focus Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <div className="text-4xl font-mono font-bold text-slate-900 mb-6 tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex justify-center gap-2">
          <Button 
            variant={isActive ? "outline" : "default"}
            size="sm"
            onClick={() => setIsActive(!isActive)}
            className="w-24"
          >
            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetTimer}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-6 flex justify-center gap-1">
          <Button 
            variant={mode === 'work' ? 'secondary' : 'ghost'} 
            size="xs" 
            className="text-[10px] uppercase tracking-wider h-7"
            onClick={() => setMode('work')}
          >
            Work
          </Button>
          <Button 
            variant={mode === 'break' ? 'secondary' : 'ghost'} 
            size="xs" 
            className="text-[10px] uppercase tracking-wider h-7"
            onClick={() => setMode('break')}
          >
            Break
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
