import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useStore } from '../store/useStore';
import { Play, Pause, Square } from 'lucide-react';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  type: 'task' | 'learning';
  title: string;
}

export function FocusTimer({ isOpen, onClose, referenceId, type, title }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const { addFocusSession } = useStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    addFocusSession({
      type,
      referenceId,
      duration: 25 * 60,
      startTime: Date.now() - (25 * 60 * 1000),
      endTime: Date.now(),
      completed: true
    });
    alert("Focus session completed!");
    onClose();
  };

  const handleStop = () => {
    setIsActive(false);
    const timeSpent = (25 * 60) - timeLeft;
    if (timeSpent > 0) {
      addFocusSession({
        type,
        referenceId,
        duration: timeSpent,
        startTime: Date.now() - (timeSpent * 1000),
        endTime: Date.now(),
        completed: false
      });
    }
    setTimeLeft(25 * 60);
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleStop()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Focus Mode: {title}</DialogTitle>
        </DialogHeader>
        <div className="py-12 flex flex-col items-center">
          <div className="text-7xl font-bold text-slate-900 font-mono tracking-tighter mb-8">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsActive(!isActive)}
              className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button
              onClick={handleStop}
              className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
