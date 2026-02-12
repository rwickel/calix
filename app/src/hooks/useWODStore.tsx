import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { WOD, Block, Movement, Exercise } from '@/types/wod';

const STORAGE_KEY = 'wod_creator_data';

interface WODStore {
  wods: WOD[];
  currentWOD: WOD | null;
  savedWODs: WOD[];
}

interface WODContextType {
  wods: WOD[];
  currentWOD: WOD | null;
  savedWODs: WOD[];
  isLoaded: boolean;
  createWOD: () => WOD;
  loadWOD: (wod: WOD) => void;
  saveWOD: () => void;
  deleteWOD: (wodId: string) => void;
  updateWOD: (updates: Partial<WOD>) => void;
  addBlock: () => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: 'up' | 'down') => void;
  addMovement: (blockId: string, exercise: Exercise) => void;
  updateMovement: (blockId: string, movementId: string, updates: Partial<Movement>) => void;
  removeMovement: (blockId: string, movementId: string) => void;
  moveMovement: (blockId: string, movementId: string, direction: 'up' | 'down') => void;
  loadPreset: (preset: Partial<WOD>) => WOD;
}

const WODContext = createContext<WODContextType | undefined>(undefined);

const createNewWOD = (): WOD => {
  const wodId = `wod_${Date.now()}`;
  return {
    id: wodId,
    name: 'New WOD',
    description: '',
    blocks: [createNewBlock(0)],
    equipment: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isBenchmark: false,
  };
};

const createNewBlock = (order: number): Block => ({
  id: `block_${Date.now()}_${Math.random()}`,
  name: `Block ${order + 1}`,
  timingMode: 'FOR_TIME',
  movements: [],
  rounds: 1,
  restBetweenRounds: 0,
  isLooping: false,
  order,
});

const createNewMovement = (exercise: Exercise): Movement => ({
  id: `movement_${Date.now()}_${Math.random()}`,
  exerciseId: exercise.id,
  exercise,
  reps: 10,
  unit: exercise.defaultUnit,
});

export function WODProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<WODStore>({
    wods: [],
    currentWOD: null,
    savedWODs: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        parsed.savedWODs = (parsed.savedWODs || []).map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
        }));
        setStore(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Failed to load WOD data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when store changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (e) {
        console.error('Failed to save WOD data:', e);
      }
    }
  }, [store, isLoaded]);

  // WOD Management
  const createWOD = useCallback(() => {
    const newWOD = createNewWOD();
    setStore(prev => ({ ...prev, currentWOD: newWOD }));
    return newWOD;
  }, []);

  const loadWOD = useCallback((wod: WOD) => {
    setStore(prev => ({ ...prev, currentWOD: { ...wod } }));
  }, []);

  const saveWOD = useCallback(() => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      const updatedWOD = { ...prev.currentWOD, updatedAt: new Date() };
      const existingIndex = prev.savedWODs.findIndex(w => w.id === updatedWOD.id);
      let newSavedWODs;
      if (existingIndex >= 0) {
        newSavedWODs = [...prev.savedWODs];
        newSavedWODs[existingIndex] = updatedWOD;
      } else {
        newSavedWODs = [...prev.savedWODs, updatedWOD];
      }
      return { ...prev, currentWOD: updatedWOD, savedWODs: newSavedWODs };
    });
  }, []);

  const deleteWOD = useCallback((wodId: string) => {
    setStore(prev => ({
      ...prev,
      savedWODs: prev.savedWODs.filter(w => w.id !== wodId),
      currentWOD: prev.currentWOD?.id === wodId ? null : prev.currentWOD,
    }));
  }, []);

  const updateWOD = useCallback((updates: Partial<WOD>) => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      return {
        ...prev,
        currentWOD: { ...prev.currentWOD, ...updates, updatedAt: new Date() },
      };
    });
  }, []);

  // Block Management
  const addBlock = useCallback(() => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      const newBlock = createNewBlock(prev.currentWOD.blocks.length);
      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: [...prev.currentWOD.blocks, newBlock],
        },
      };
    });
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: prev.currentWOD.blocks.map(b =>
            b.id === blockId ? { ...b, ...updates } : b
          ),
        },
      };
    });
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: prev.currentWOD.blocks.filter(b => b.id !== blockId),
        },
      };
    });
  }, []);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      const blocks = [...prev.currentWOD.blocks];
      const index = blocks.findIndex(b => b.id === blockId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return prev;

      [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: blocks.map((b, i) => ({ ...b, order: i })),
        },
      };
    });
  }, []);

  // Movement Management
  const addMovement = useCallback((blockId: string, exercise: Exercise) => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      const newMovement = createNewMovement(exercise);
      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: prev.currentWOD.blocks.map(b =>
            b.id === blockId
              ? { ...b, movements: [...b.movements, newMovement] }
              : b
          ),
        },
      };
    });
  }, []);

  const updateMovement = useCallback((blockId: string, movementId: string, updates: Partial<Movement>) => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: prev.currentWOD.blocks.map(b =>
            b.id === blockId
              ? {
                ...b,
                movements: b.movements.map(m =>
                  m.id === movementId ? { ...m, ...updates } : m
                ),
              }
              : b
          ),
        },
      };
    });
  }, []);

  const removeMovement = useCallback((blockId: string, movementId: string) => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: prev.currentWOD.blocks.map(b =>
            b.id === blockId
              ? { ...b, movements: b.movements.filter(m => m.id !== movementId) }
              : b
          ),
        },
      };
    });
  }, []);

  const moveMovement = useCallback((blockId: string, movementId: string, direction: 'up' | 'down') => {
    setStore(prev => {
      if (!prev.currentWOD) return prev;
      const block = prev.currentWOD.blocks.find(b => b.id === blockId);
      if (!block) return prev;

      const movements = [...block.movements];
      const index = movements.findIndex(m => m.id === movementId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= movements.length) return prev;

      [movements[index], movements[newIndex]] = [movements[newIndex], movements[index]];

      return {
        ...prev,
        currentWOD: {
          ...prev.currentWOD,
          blocks: prev.currentWOD.blocks.map(b =>
            b.id === blockId ? { ...b, movements } : b
          ),
        },
      };
    });
  }, []);

  // Load preset
  const loadPreset = useCallback((preset: Partial<WOD>) => {
    const newWOD: WOD = {
      ...createNewWOD(),
      ...preset,
      id: `wod_${Date.now()}`,
      isBenchmark: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setStore(prev => ({ ...prev, currentWOD: newWOD }));
    return newWOD;
  }, []);

  const value = {
    ...store,
    isLoaded,
    createWOD,
    loadWOD,
    saveWOD,
    deleteWOD,
    updateWOD,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    addMovement,
    updateMovement,
    removeMovement,
    moveMovement,
    loadPreset,
  };

  return <WODContext.Provider value={value}>{children}</WODContext.Provider>;
}

export function useWODStore() {
  const context = useContext(WODContext);
  if (context === undefined) {
    throw new Error('useWODStore must be used within a WODProvider');
  }
  return context;
}
