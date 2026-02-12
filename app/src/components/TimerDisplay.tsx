import { useEffect, useState } from 'react';
import {
  Play, Pause, Square, SkipForward, SkipBack,
  RotateCcw, Volume2, VolumeX, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTimer } from '@/hooks/useTimer';
import type { WOD, TimingMode } from '@/types/wod';
import { audioEngine } from '@/lib/audio';

interface TimerDisplayProps {
  wod: WOD;
  onComplete: () => void;
  onExit: () => void;
}

const timingModeLabels: Record<TimingMode, string> = {
  FOR_TIME: 'FOR TIME',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  INTERVAL: 'INTERVAL',
  FIXED_SETS: 'FIXED SETS',
};

export function TimerDisplay({ wod, onComplete, onExit }: TimerDisplayProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const {
    state,
    start,
    pause,
    resume,
    stop,
    nextMovement,
    previousMovement,
    skipRound,
    formatTime,
    getCurrentMovement,
    getCurrentBlock,
    getProgress,
    isCountdownPhase,
    countdownValue,
  } = useTimer({ wod, onComplete });

  const currentMovement = getCurrentMovement();
  const currentBlock = getCurrentBlock();
  const progress = getProgress();

  useEffect(() => {
    audioEngine.setEnabled(audioEnabled);
  }, [audioEnabled]);

  // Auto-hide controls after 5 seconds of inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 5000);
    };

    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  // Prevent screen lock during workout
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (e) {
        console.log('Wake lock not supported');
      }
    };

    if (state.isRunning) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [state.isRunning]);

  const handleStart = () => {
    start();
  };

  const handlePauseResume = () => {
    if (state.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
    onExit();
  };

  // Get display time based on mode
  const getDisplayTime = () => {
    if (currentBlock?.timingMode === 'AMRAP') {
      return state.remainingTime;
    }
    return state.elapsedTime;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (currentBlock?.timingMode === 'AMRAP') {
      if (state.remainingTime <= 10) return 'text-red-500';
      if (state.remainingTime <= 30) return 'text-orange-500';
    }
    return 'text-foreground';
  };

  // Countdown overlay
  if (isCountdownPhase) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="text-6xl font-bold text-muted-foreground mb-8">GET READY</div>
        <div className={`text-[200px] font-black leading-none ${countdownValue === 3 ? 'text-yellow-500' :
          countdownValue === 2 ? 'text-orange-500' :
            countdownValue === 1 ? 'text-red-500' : 'text-primary'
          }`}>
          {countdownValue > 0 ? countdownValue : 'GO!'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-1">
            {currentBlock ? timingModeLabels[currentBlock.timingMode] : 'WOD'}
          </Badge>
          <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-md">
            {wod.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleStop}>
            <Square className="w-4 h-4 mr-2" />
            End
          </Button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Time */}
        <div className={`text-[80px] md:text-[150px] font-black tabular-nums leading-none ${getTimeColor()}`}>
          {formatTime(getDisplayTime())}
        </div>

        {/* Mode-specific info */}
        {currentBlock?.timingMode === 'AMRAP' && currentBlock.timeCap && (
          <div className="text-xl text-muted-foreground mt-2">
            of {formatTime(currentBlock.timeCap)}
          </div>
        )}
        {(currentBlock?.timingMode === 'EMOM' || currentBlock?.timingMode === 'INTERVAL') && (
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={state.isWorkPhase ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {state.isWorkPhase ? 'WORK' : 'REST'}
            </Badge>
            <span className="text-xl text-muted-foreground">
              Interval {state.currentInterval} {currentBlock.totalIntervals && `/ ${currentBlock.totalIntervals}`}
            </span>
          </div>
        )}

        {/* Progress Bars */}
        <div className="w-full max-w-2xl mt-8 space-y-3">
          {/* Overall Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(progress.overallProgress)}%</span>
            </div>
            <Progress value={progress.overallProgress} className="h-3" />
          </div>

          {/* Block Progress */}
          {wod.blocks.length > 1 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Block {state.currentBlockIndex + 1} of {wod.blocks.length}</span>
                <span>{Math.round(progress.blockProgress)}%</span>
              </div>
              <Progress value={progress.blockProgress} className="h-2" />
            </div>
          )}

          {/* Round Progress */}
          {currentBlock && currentBlock.rounds > 1 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Round {state.currentRound} of {currentBlock.rounds}</span>
                <span>{Math.round(progress.roundProgress)}%</span>
              </div>
              <Progress value={progress.roundProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Current Movement */}
        {currentMovement && (
          <Card className="mt-8 p-6 md:p-10 w-full max-w-2xl text-center border-2 border-primary">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Current Movement
            </div>
            <div className="text-4xl md:text-6xl font-bold mb-4">
              {currentMovement.exercise.name}
            </div>
            <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl">
              <Badge variant="secondary" className="text-xl md:text-2xl px-4 py-2">
                {currentMovement.reps} {currentMovement.unit.toLowerCase()}
              </Badge>
              {currentMovement.weight && (
                <Badge variant="outline" className="text-xl md:text-2xl px-4 py-2">
                  {currentMovement.weight} {currentMovement.weightUnit}
                </Badge>
              )}
            </div>
            {currentMovement.notes && (
              <div className="mt-4 text-muted-foreground">
                {currentMovement.notes}
              </div>
            )}
          </Card>
        )}

        {/* Next Movement Preview */}
        {currentBlock && state.currentMovementIndex < currentBlock.movements.length - 1 && (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
            <span>Next: {currentBlock.movements[state.currentMovementIndex + 1].exercise.name}</span>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className={`p-4 md:p-6 border-t bg-card transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}>
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {/* Previous */}
          <Button
            variant="outline"
            size="lg"
            onClick={previousMovement}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full"
          >
            <SkipBack className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          {/* Play/Pause */}
          {!state.isRunning ? (
            <Button
              onClick={handleStart}
              className="h-20 w-20 md:h-28 md:w-28 rounded-full"
            >
              <Play className="w-8 h-8 md:w-12 md:h-12 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handlePauseResume}
              variant={state.isPaused ? 'default' : 'secondary'}
              className="h-20 w-20 md:h-28 md:w-28 rounded-full"
            >
              {state.isPaused ? (
                <Play className="w-8 h-8 md:w-12 md:h-12 ml-1" />
              ) : (
                <Pause className="w-8 h-8 md:w-12 md:h-12" />
              )}
            </Button>
          )}

          {/* Next Movement */}
          <Button
            variant="outline"
            size="lg"
            onClick={nextMovement}
            disabled={!state.isRunning}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full"
          >
            <SkipForward className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          {/* Skip Round (only for multi-round blocks) */}
          {currentBlock && currentBlock.rounds > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={skipRound}
              disabled={!state.isRunning}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full"
            >
              <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          )}
        </div>

        {/* Control hints */}
        <div className="flex justify-center gap-8 mt-4 text-sm text-muted-foreground">
          <span>Tap center to {state.isRunning ? (state.isPaused ? 'resume' : 'pause') : 'start'}</span>
          <span>Tap arrows to navigate</span>
        </div>
      </div>
    </div>
  );
}
