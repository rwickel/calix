// WOD Type Definitions

export type TimingMode = 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'INTERVAL' | 'FIXED_SETS';

export type MeasurementUnit = 'REPS' | 'SECONDS' | 'MINUTES' | 'CALORIES' | 'METERS' | 'MILES' | 'KG' | 'LBS';

export type RepScheme = 'STANDARD' | 'DESCENDING' | 'ASCENDING' | 'CUSTOM';

export interface Equipment {
  id: string;
  name: string;
  icon?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  equipment: Equipment[];
  defaultUnit: MeasurementUnit;
  tags: string[];
}

export interface Movement {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  reps?: number;
  repScheme?: RepScheme;
  repSequence?: number[]; // For custom schemes like 21-15-9
  unit: MeasurementUnit;
  weight?: number;
  weightUnit?: 'KG' | 'LBS';
  distance?: number;
  distanceUnit?: 'METERS' | 'MILES';
  duration?: number; // in seconds
  restAfter?: number; // rest after this movement in seconds
  notes?: string;
}

export interface Block {
  id: string;
  name: string;
  description?: string;
  timingMode: TimingMode;
  timeCap?: number; // in seconds
  workTime?: number; // for EMOM/Interval (seconds)
  restTime?: number; // for EMOM/Interval (seconds)
  totalIntervals?: number; // for EMOM/Interval
  movements: Movement[];
  rounds: number;
  restBetweenRounds: number; // in seconds
  isLooping: boolean;
  order: number;
}

export interface WOD {
  id: string;
  name: string;
  description?: string;
  blocks: Block[];
  equipment: Equipment[];
  createdAt: Date;
  updatedAt: Date;
  isBenchmark: boolean;
  benchmarkCategory?: 'THE_GIRLS' | 'HERO_WODS' | 'CUSTOM';
  originalWodId?: string; // for scaled versions
}

export interface WODScore {
  id: string;
  wodId: string;
  completedAt: Date;
  totalTime?: number; // in seconds (for For Time)
  totalRounds?: number; // for AMRAP
  totalReps?: number; // for AMRAP
  weightUsed?: number;
  weightUnit?: 'KG' | 'LBS';
  notes?: string;
  rx: boolean; // performed as prescribed
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentBlockIndex: number;
  currentMovementIndex: number;
  currentRound: number;
  elapsedTime: number; // total elapsed time in seconds
  remainingTime: number; // for countdown modes
  currentInterval: number; // for EMOM/Interval
  isWorkPhase: boolean; // for EMOM/Interval
  wod: WOD | null;
  startTime?: number;
  pausedAt?: number;
}

// Preset WOD Templates
export interface PresetTemplate {
  id: string;
  name: string;
  category: 'THE_GIRLS' | 'HERO_WODS' | 'CUSTOM';
  description?: string;
  wod: Partial<WOD>;
}

// Audio cue types
export type AudioCue = 'BEEP_SHORT' | 'BEEP_LONG' | 'COUNTDOWN_3' | 'COUNTDOWN_2' | 'COUNTDOWN_1' | 'START' | 'COMPLETE' | 'REST' | 'WORK';
