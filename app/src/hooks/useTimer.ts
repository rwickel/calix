import { useState, useEffect, useRef, useCallback } from 'react';
import type { WOD, Block, Movement, TimerState } from '@/types/wod';
import { audioEngine } from '@/lib/audio';

interface UseTimerProps {
  wod: WOD | null;
  onComplete?: () => void;
  onRoundComplete?: (round: number) => void;
  onBlockChange?: (blockIndex: number) => void;
}

interface UseTimerReturn {
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextMovement: () => void;
  previousMovement: () => void;
  skipRound: () => void;
  formatTime: (seconds: number) => string;
  getCurrentMovement: () => Movement | null;
  getCurrentBlock: () => Block | null;
  getProgress: () => { blockProgress: number; roundProgress: number; overallProgress: number };
  isCountdownPhase: boolean;
  countdownValue: number;
}

const createInitialState = (wod: WOD | null): TimerState => {
  const firstBlock = wod?.blocks[0];
  return {
    isRunning: false,
    isPaused: false,
    currentBlockIndex: 0,
    currentMovementIndex: 0,
    currentRound: 1,
    elapsedTime: 0,
    remainingTime: firstBlock?.timeCap || 0,
    currentInterval: 1,
    isWorkPhase: true,
    wod,
  };
};

export function useTimer({ wod, onComplete, onRoundComplete, onBlockChange }: UseTimerProps): UseTimerReturn {
  const [state, setState] = useState<TimerState>(() => createInitialState(wod));
  const [isCountdownPhase, setIsCountdownPhase] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Update state when WOD changes
  useEffect(() => {
    setState(createInitialState(wod));
  }, [wod]);

  const getCurrentBlock = useCallback((): Block | null => {
    if (!wod || !wod.blocks.length) return null;
    return wod.blocks[state.currentBlockIndex] || null;
  }, [wod, state.currentBlockIndex]);

  const getCurrentMovement = useCallback((): Movement | null => {
    const block = getCurrentBlock();
    if (!block || !block.movements.length) return null;
    return block.movements[state.currentMovementIndex] || null;
  }, [getCurrentBlock, state.currentMovementIndex]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback(() => {
    if (!wod) return { blockProgress: 0, roundProgress: 0, overallProgress: 0 };

    const currentBlock = getCurrentBlock();
    const totalBlocks = wod.blocks.length;
    const blockProgress = totalBlocks > 0 ? (state.currentBlockIndex / totalBlocks) * 100 : 0;

    const totalRounds = currentBlock?.rounds || 1;
    const roundProgress = totalRounds > 0 ? ((state.currentRound - 1) / totalRounds) * 100 : 0;

    // Calculate overall progress based on blocks completed
    let overallProgress = (state.currentBlockIndex / totalBlocks) * 100;
    if (currentBlock && totalBlocks > 0) {
      // Add progress within the current block
      const blockWeight = 100 / totalBlocks;
      if (currentBlock.timingMode === 'AMRAP' && currentBlock.timeCap) {
        overallProgress += ((currentBlock.timeCap - state.remainingTime) / currentBlock.timeCap) * blockWeight;
      } else {
        const totalMovementsInBlock = currentBlock.movements.length * currentBlock.rounds;
        const currentMovementInBlock = (state.currentRound - 1) * currentBlock.movements.length + state.currentMovementIndex;
        overallProgress += (currentMovementInBlock / totalMovementsInBlock) * blockWeight;
      }
    }

    return { blockProgress, roundProgress, overallProgress: Math.min(overallProgress, 100) };
  }, [wod, state, getCurrentBlock]);

  const advanceMovement = useCallback(() => {
    const currentBlock = getCurrentBlock();
    if (!currentBlock || !wod) return false;

    const isLastMovement = state.currentMovementIndex >= currentBlock.movements.length - 1;
    const isLastRound = state.currentRound >= currentBlock.rounds;
    const isLastBlock = state.currentBlockIndex >= wod.blocks.length - 1;

    // AMRAP logic: Always loop within the block, incrementing rounds
    if (currentBlock.timingMode === 'AMRAP') {
      if (isLastMovement) {
        setState(prev => ({
          ...prev,
          currentRound: prev.currentRound + 1,
          currentMovementIndex: 0,
        }));
        onRoundComplete?.(state.currentRound + 1);
      } else {
        setState(prev => ({
          ...prev,
          currentMovementIndex: prev.currentMovementIndex + 1,
        }));
      }
      return false; // AMRAP only ends via timer
    }

    // Standard progression for other modes
    if (isLastMovement) {
      if (isLastRound) {
        if (isLastBlock) {
          // WOD Complete
          return true;
        } else {
          // Next block
          const nextBlock = wod.blocks[state.currentBlockIndex + 1];
          setState(prev => ({
            ...prev,
            currentBlockIndex: prev.currentBlockIndex + 1,
            currentMovementIndex: 0,
            currentRound: 1,
            remainingTime: nextBlock.timeCap || 0,
            currentInterval: 1,
            isWorkPhase: true,
          }));
          onBlockChange?.(state.currentBlockIndex + 1);
        }
      } else {
        // Next round
        setState(prev => ({
          ...prev,
          currentRound: prev.currentRound + 1,
          currentMovementIndex: 0,
        }));
        onRoundComplete?.(state.currentRound + 1);
      }
    } else {
      // Next movement
      setState(prev => ({
        ...prev,
        currentMovementIndex: prev.currentMovementIndex + 1,
      }));
    }
    return false;
  }, [getCurrentBlock, wod, state, onBlockChange, onRoundComplete]);

  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.wod) return prev;
      const currentBlock = prev.wod.blocks[prev.currentBlockIndex];
      if (!currentBlock) return prev;

      const newElapsed = prev.elapsedTime + 1;
      let newRemaining = prev.remainingTime;
      let newInterval = prev.currentInterval;
      let newIsWorkPhase = prev.isWorkPhase;

      switch (currentBlock.timingMode) {
        case 'AMRAP':
          newRemaining = Math.max(0, prev.remainingTime - 1);
          if (newRemaining === 0) {
            // Block Complete, try to advance
            audioEngine.playCue('BEEP_LONG');
            // We can't easily call advanceMovement here because it's a callback that uses state
            // Instead, we'll let the user manually advance or we can make advanceMovement work inside setState if we refactor it.
            // For now, let's just stop the timer or auto-advance if possible.
            // Actually, for AMRAP, when time is up, the block is done.
            return { ...prev, remainingTime: 0, isPaused: true };
          }
          // Countdown warnings
          if (newRemaining <= 3 && newRemaining > 0) {
            audioEngine.playCue(newRemaining === 3 ? 'COUNTDOWN_3' : newRemaining === 2 ? 'COUNTDOWN_2' : 'COUNTDOWN_1');
          }
          break;

        case 'EMOM':
        case 'INTERVAL':
          const cycleTime = currentBlock.workTime || 60;
          const currentCycleTime = newElapsed % cycleTime;

          if (currentCycleTime === 0) {
            // New interval
            newInterval = prev.currentInterval + 1;
            newIsWorkPhase = true;
            audioEngine.playCue('WORK');

            if (currentBlock.totalIntervals && newInterval > currentBlock.totalIntervals) {
              // Block complete
              return { ...prev, isPaused: true };
            }
          } else if (currentCycleTime === (currentBlock.workTime || 60) - (currentBlock.restTime || 0)) {
            // Rest phase starts
            newIsWorkPhase = false;
            audioEngine.playCue('REST');
          }
          break;

        case 'FOR_TIME':
          // Just count up, check for time cap
          if (currentBlock.timeCap && newElapsed >= currentBlock.timeCap) {
            audioEngine.playCue('BEEP_LONG');
            return { ...prev, isPaused: true };
          }
          break;
      }

      return {
        ...prev,
        elapsedTime: newElapsed,
        remainingTime: newRemaining,
        currentInterval: newInterval,
        isWorkPhase: newIsWorkPhase,
      };
    });
  }, []);

  const startCountdown = useCallback(() => {
    setIsCountdownPhase(true);
    setCountdownValue(3);
    audioEngine.playCue('COUNTDOWN_3');

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdownValue(count);

      if (count > 0) {
        audioEngine.playCue(count === 2 ? 'COUNTDOWN_2' : 'COUNTDOWN_1');
      } else {
        // GO!
        if (countdownRef.current) clearInterval(countdownRef.current);
        setIsCountdownPhase(false);
        audioEngine.playCue('START');

        // Start the actual timer
        startTimeRef.current = Date.now();
        setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
        intervalRef.current = setInterval(tick, 1000);
      }
    }, 1000);
  }, [tick]);

  const start = useCallback(() => {
    if (!wod) return;
    startCountdown();
  }, [wod, startCountdown]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsCountdownPhase(false);
    setState(createInitialState(wod));
  }, [wod]);

  const nextMovement = useCallback(() => {
    const isComplete = advanceMovement();
    if (isComplete) {
      audioEngine.playCue('COMPLETE');
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState(prev => ({ ...prev, isRunning: false }));
      onComplete?.();
    } else {
      audioEngine.playCue('BEEP_SHORT');
    }
  }, [advanceMovement, onComplete]);

  const previousMovement = useCallback(() => {
    setState(prev => {
      if (prev.currentMovementIndex > 0) {
        return { ...prev, currentMovementIndex: prev.currentMovementIndex - 1 };
      } else if (prev.currentRound > 1) {
        const prevBlock = prev.wod?.blocks[prev.currentBlockIndex];
        return {
          ...prev,
          currentRound: prev.currentRound - 1,
          currentMovementIndex: (prevBlock?.movements.length || 1) - 1,
        };
      } else if (prev.currentBlockIndex > 0) {
        const prevBlock = prev.wod?.blocks[prev.currentBlockIndex - 1];
        return {
          ...prev,
          currentBlockIndex: prev.currentBlockIndex - 1,
          currentRound: prevBlock?.rounds || 1,
          currentMovementIndex: (prevBlock?.movements.length || 1) - 1,
        };
      }
      return prev;
    });
    audioEngine.playCue('BEEP_SHORT');
  }, []);

  const skipRound = useCallback(() => {
    const currentBlock = getCurrentBlock();
    if (!currentBlock || !wod) return;

    const isLastRound = state.currentRound >= currentBlock.rounds;
    const isLastBlock = state.currentBlockIndex >= wod.blocks.length - 1;

    if (isLastRound) {
      if (isLastBlock) {
        audioEngine.playCue('COMPLETE');
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState(prev => ({ ...prev, isRunning: false }));
        onComplete?.();
      } else {
        setState(prev => ({
          ...prev,
          currentBlockIndex: prev.currentBlockIndex + 1,
          currentMovementIndex: 0,
          currentRound: 1,
        }));
        onBlockChange?.(state.currentBlockIndex + 1);
        audioEngine.playCue('BEEP_LONG');
      }
    } else {
      setState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        currentMovementIndex: 0,
      }));
      onRoundComplete?.(state.currentRound + 1);
      audioEngine.playCue('BEEP_LONG');
    }
  }, [getCurrentBlock, wod, state, onBlockChange, onRoundComplete, onComplete]);

  return {
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
  };
}
