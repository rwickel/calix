import type { WOD, Block, Movement, TimingMode } from '@/types/wod';
import { exercises } from './exercises';

const findExercise = (id: string) => exercises.find(e => e.id === id)!;

// Helper to create a movement
const createMovement = (
  exerciseId: string,
  reps?: number,
  unit?: string,
  weight?: number,
  weightUnit?: 'KG' | 'LBS',
  duration?: number
): Movement => ({
  id: `${exerciseId}_${Date.now()}_${Math.random()}`,
  exerciseId,
  exercise: findExercise(exerciseId),
  reps,
  unit: (unit as any) || 'REPS',
  weight,
  weightUnit,
  duration,
});

// Helper to create a block
const createBlock = (
  name: string,
  movements: Movement[],
  rounds: number = 1,
  restBetweenRounds: number = 0,
  timingMode: TimingMode = 'FOR_TIME',
  timeCap?: number,
  workTime?: number,
  restTime?: number,
  totalIntervals?: number
): Block => ({
  id: `block_${Date.now()}_${Math.random()}`,
  name,
  movements,
  rounds,
  restBetweenRounds,
  timingMode,
  timeCap,
  workTime,
  restTime,
  totalIntervals,
  isLooping: rounds > 1,
  order: 0,
});

// THE GIRLS - Classic Benchmark WODs
export const theGirlsWODs: Partial<WOD>[] = [
  // Angie
  {
    id: 'angie',
    name: 'Angie',
    description: 'For time, complete all reps of each exercise before moving to the next.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('pullup', 100),
        createMovement('pushup', 100),
        createMovement('situp', 100),
        createMovement('air_squat', 100),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Barbara
  {
    id: 'barbara',
    name: 'Barbara',
    description: '5 rounds, rest 3 minutes between rounds.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('pullup', 20),
        createMovement('pushup', 30),
        createMovement('situp', 40),
        createMovement('air_squat', 50),
      ], 5, 180, 'FOR_TIME'),
    ],
  },

  // Chelsea
  {
    id: 'chelsea',
    name: 'Chelsea',
    description: 'EMOM for 30 minutes.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Every Minute', [
        createMovement('pullup', 5),
        createMovement('pushup', 10),
        createMovement('air_squat', 15),
      ], 1, 0, 'EMOM', 1800, 60, 0, 30),
    ],
  },

  // Cindy
  {
    id: 'cindy',
    name: 'Cindy',
    description: 'AMRAP in 20 minutes.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('pullup', 5),
        createMovement('pushup', 10),
        createMovement('air_squat', 15),
      ], 1, 0, 'AMRAP', 1200),
    ],
  },

  // Diane
  {
    id: 'diane',
    name: 'Diane',
    description: '21-15-9 reps for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        { ...createMovement('deadlift', 21, 'REPS', 102, 'KG'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
        { ...createMovement('handstand_pushup', 21, 'REPS'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Elizabeth
  {
    id: 'elizabeth',
    name: 'Elizabeth',
    description: '21-15-9 reps for time.',
    timingMode: 'FOR_TIME',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        { ...createMovement('clean', 21, 'REPS', 61, 'KG'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
        { ...createMovement('ring_dip', 21, 'REPS'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
      ]),
    ],
  },

  // Fran
  {
    id: 'fran',
    name: 'Fran',
    description: '21-15-9 reps for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        { ...createMovement('thruster', 21, 'REPS', 43, 'KG'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
        { ...createMovement('pullup', 21, 'REPS'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Grace
  {
    id: 'grace',
    name: 'Grace',
    description: '30 reps for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('clean', 30, 'REPS', 61, 'KG'),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Helen
  {
    id: 'helen',
    name: 'Helen',
    description: '3 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('run', 400, 'METERS'),
        createMovement('kb_swing', 21, 'REPS'),
        createMovement('pullup', 12),
      ], 3, 0, 'FOR_TIME'),
    ],
  },

  // Isabel
  {
    id: 'isabel',
    name: 'Isabel',
    description: '30 reps for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('snatch', 30, 'REPS', 61, 'KG'),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Jackie
  {
    id: 'jackie',
    name: 'Jackie',
    description: 'For time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('row', 1000, 'METERS'),
        createMovement('thruster', 50, 'REPS', 20, 'KG'),
        createMovement('pullup', 30),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Karen
  {
    id: 'karen',
    name: 'Karen',
    description: 'For time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('wallball_shot', 150, 'REPS'),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Kelly
  {
    id: 'kelly',
    name: 'Kelly',
    description: '5 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('run', 400, 'METERS'),
        createMovement('box_jump', 30, 'REPS', undefined, undefined, 24),
        createMovement('wallball_shot', 30, 'REPS'),
      ], 5, 0, 'FOR_TIME'),
    ],
  },

  // Linda (The Three Bars of Death)
  {
    id: 'linda',
    name: 'Linda',
    description: '10-9-8-7-6-5-4-3-2-1 reps for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        { ...createMovement('deadlift', 10, 'REPS'), repScheme: 'DESCENDING', repSequence: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
        { ...createMovement('bench_press', 10, 'REPS'), repScheme: 'DESCENDING', repSequence: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
        { ...createMovement('clean', 10, 'REPS'), repScheme: 'DESCENDING', repSequence: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Mary
  {
    id: 'mary',
    name: 'Mary',
    description: 'AMRAP in 20 minutes.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('handstand_pushup', 5),
        createMovement('pistol_squat', 10),
        createMovement('pullup', 15),
      ], 1, 0, 'AMRAP', 1200),
    ],
  },

  // Nancy
  {
    id: 'nancy',
    name: 'Nancy',
    description: '5 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'THE_GIRLS',
    blocks: [
      createBlock('Main', [
        createMovement('run', 400, 'METERS'),
        createMovement('overhead_squat', 15, 'REPS', 43, 'KG'),
      ], 5, 0, 'FOR_TIME'),
    ],
  },
];

// HERO WODs
export const heroWODs: Partial<WOD>[] = [
  // Murph
  {
    id: 'murph',
    name: 'Murph',
    description: 'For time. Partition the pull-ups, push-ups, and squats as needed.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Buy-in', [
        createMovement('run', 1600, 'METERS'),
      ], 1, 0, 'FOR_TIME'),
      createBlock('Main', [
        createMovement('pullup', 100),
        createMovement('pushup', 200),
        createMovement('air_squat', 300),
      ], 1, 0, 'FOR_TIME'),
      createBlock('Cash-out', [
        createMovement('run', 1600, 'METERS'),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Michael
  {
    id: 'michael',
    name: 'Michael',
    description: '3 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        createMovement('run', 800, 'METERS'),
        createMovement('back_squat', 50, 'REPS'),
        createMovement('ghd_situp', 50),
      ], 3, 0, 'FOR_TIME'),
    ],
  },

  // JT
  {
    id: 'jt',
    name: 'JT',
    description: '21-15-9 reps for time.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        { ...createMovement('handstand_pushup', 21, 'REPS'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
        { ...createMovement('ring_dip', 21, 'REPS'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
        { ...createMovement('pushup', 21, 'REPS'), repScheme: 'DESCENDING', repSequence: [21, 15, 9] },
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Michael P. Murphy (same as Murph but with vest)
  {
    id: 'murph_vest',
    name: 'Murph (with Vest)',
    description: 'For time with 20/14 lb vest. Partition as needed.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Buy-in', [
        createMovement('run', 1600, 'METERS'),
      ], 1, 0, 'FOR_TIME'),
      createBlock('Main', [
        createMovement('pullup', 100),
        createMovement('pushup', 200),
        createMovement('air_squat', 300),
      ], 1, 0, 'FOR_TIME'),
      createBlock('Cash-out', [
        createMovement('run', 1600, 'METERS'),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // Badger
  {
    id: 'badger',
    name: 'Badger',
    description: '3 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        createMovement('squat_clean', 30, 'REPS', 43, 'KG'),
        createMovement('pullup', 30),
        createMovement('run', 800, 'METERS'),
      ], 3, 0, 'FOR_TIME'),
    ],
  },

  // Fight Gone Bad
  {
    id: 'fight_gone_bad',
    name: 'Fight Gone Bad',
    description: '3 rounds, 1 minute per station, 1 minute rest between rounds.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Round 1', [
        createMovement('wallball_shot', 1, 'REPS'),
        createMovement('sumo_deadlift', 1, 'REPS', 34, 'KG'),
        createMovement('box_jump', 1, 'REPS', undefined, undefined, 20),
        createMovement('push_press', 1, 'REPS', 34, 'KG'),
        createMovement('row', 1, 'CALORIES'),
      ], 1, 0, 'INTERVAL', 1020, 60, 0, 15),
    ],
  },

  // Filthy 50
  {
    id: 'filthy_50',
    name: 'Filthy 50',
    description: 'For time, complete 50 reps of each.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        createMovement('box_jump', 50, 'REPS', undefined, undefined, 24),
        createMovement('jumping_pullup', 50),
        createMovement('kb_swing', 50, 'REPS'),
        createMovement('walking_lunge', 50),
        createMovement('knees_to_elbows', 50),
        createMovement('push_press', 50, 'REPS', 20, 'KG'),
        createMovement('wallball_shot', 50, 'REPS'),
        createMovement('burpee', 50),
        createMovement('double_under', 50),
      ], 1, 0, 'FOR_TIME'),
    ],
  },

  // The Seven
  {
    id: 'the_seven',
    name: 'The Seven',
    description: '7 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        createMovement('handstand_pushup', 7),
        createMovement('thruster', 7, 'REPS', 61, 'KG'),
        createMovement('knees_to_elbows', 7),
        createMovement('deadlift', 7, 'REPS', 111, 'KG'),
        createMovement('burpee', 7),
        createMovement('kb_swing', 7, 'REPS', 16, 'KG'),
        createMovement('pullup', 7),
      ], 7, 0, 'FOR_TIME'),
    ],
  },

  // Ryan
  {
    id: 'ryan',
    name: 'Ryan',
    description: '5 rounds for time.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        createMovement('burpee', 7),
        createMovement('muscle_up', 7),
      ], 5, 0, 'FOR_TIME'),
    ],
  },

  // Tommy V
  {
    id: 'tommy_v',
    name: 'Tommy V',
    description: 'For time.',
    isBenchmark: true,
    benchmarkCategory: 'HERO_WODS',
    blocks: [
      createBlock('Main', [
        createMovement('thruster', 21, 'REPS', 61, 'KG'),
        createMovement('rope_climb', 12),
        createMovement('thruster', 15, 'REPS', 61, 'KG'),
        createMovement('rope_climb', 9),
        createMovement('thruster', 9, 'REPS', 61, 'KG'),
        createMovement('rope_climb', 6),
      ], 1, 0, 'FOR_TIME'),
    ],
  },
];

// Combine all presets
export const allPresets: Partial<WOD>[] = [...theGirlsWODs, ...heroWODs];

// Get presets by category
export const getPresetsByCategory = (category: 'THE_GIRLS' | 'HERO_WODS'): Partial<WOD>[] => {
  return allPresets.filter(wod => wod.benchmarkCategory === category);
};

// Get preset by ID
export const getPresetById = (id: string): Partial<WOD> | undefined => {
  return allPresets.find(wod => wod.id === id);
};
