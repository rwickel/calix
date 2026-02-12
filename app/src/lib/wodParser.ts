import { exercises } from '@/data/exercises';
import type { WOD, Block, Movement, TimingMode } from '@/types/wod';

/**
 * Parses a WOD from a Markdown string.
 * 
 * Format:
 * # [WOD Name]
 * Description: [Brief description]
 * Mode: [FOR_TIME | AMRAP | EMOM | INTERVAL | FIXED_SETS]
 * Time Cap: [minutes] (optional)
 * 
 * ## [Block Name]
 * Rounds: [number]
 * Rest: [seconds]
 * - [reps] [Movement Name] ([weight] [unit])
 * - [reps] [Movement Name]
 */
export function parseWOD(markdown: string): Partial<WOD> {
    const lines = markdown.split('\n');
    const wod: Partial<WOD> = {
        blocks: [],
        equipment: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isBenchmark: false,
    };

    let globalMode: TimingMode = 'FOR_TIME';
    let globalTimeCap: number | undefined;
    let globalWorkTime: number | undefined;
    let globalRestTime: number | undefined;
    let globalIntervals: number | undefined;

    let currentBlock: Partial<Block> | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse WOD Title
        if (line.startsWith('# ')) {
            wod.name = line.substring(2).trim();
            continue;
        }

        // Parse WOD Metadata
        if (line.toLowerCase().startsWith('description:')) {
            wod.description = line.substring(12).trim();
            continue;
        }

        if (line.toLowerCase().startsWith('mode:')) {
            const mode = line.substring(5).trim().toUpperCase();
            if (['FOR_TIME', 'AMRAP', 'EMOM', 'INTERVAL', 'FIXED_SETS'].includes(mode)) {
                if (currentBlock) {
                    currentBlock.timingMode = mode as TimingMode;
                } else {
                    globalMode = mode as TimingMode;
                }
            }
            continue;
        }

        if (line.toLowerCase().startsWith('time cap:')) {
            const cap = parseInt(line.substring(9).trim());
            if (!isNaN(cap)) {
                if (currentBlock) {
                    currentBlock.timeCap = cap * 60;
                } else {
                    globalTimeCap = cap * 60;
                }
            }
            continue;
        }

        if (line.toLowerCase().startsWith('work:')) {
            const work = parseInt(line.substring(5).trim());
            if (!isNaN(work)) {
                if (currentBlock) currentBlock.workTime = work;
                else globalWorkTime = work;
            }
            continue;
        }

        if (line.toLowerCase().startsWith('rest:')) {
            const rest = parseInt(line.substring(5).trim());
            if (!isNaN(rest)) {
                if (currentBlock) {
                    if (currentBlock.timingMode === 'EMOM' || currentBlock.timingMode === 'INTERVAL') {
                        currentBlock.restTime = rest;
                    } else {
                        currentBlock.restBetweenRounds = rest;
                    }
                } else {
                    globalRestTime = rest;
                }
            }
            continue;
        }

        if (line.toLowerCase().startsWith('intervals:')) {
            const intervals = parseInt(line.substring(10).trim());
            if (!isNaN(intervals)) {
                if (currentBlock) currentBlock.totalIntervals = intervals;
                else globalIntervals = intervals;
            }
            continue;
        }

        // Parse Blocks
        if (line.startsWith('## ')) {
            if (currentBlock) {
                wod.blocks!.push(currentBlock as Block);
            }
            currentBlock = {
                id: `block_${Date.now()}_${Math.random()}`,
                name: line.substring(3).trim(),
                timingMode: globalMode,
                timeCap: globalTimeCap,
                workTime: globalWorkTime,
                restTime: globalRestTime,
                totalIntervals: globalIntervals,
                movements: [],
                rounds: 1,
                restBetweenRounds: currentBlock ? 0 : (globalRestTime || 0),
                isLooping: false,
                order: wod.blocks!.length,
            };
            continue;
        }

        if (currentBlock) {
            if (line.toLowerCase().startsWith('rounds:')) {
                const rounds = parseInt(line.substring(7).trim());
                if (!isNaN(rounds)) {
                    currentBlock.rounds = rounds;
                    currentBlock.isLooping = rounds > 1;
                }
                continue;
            }

            // Parse Movements
            if (line.startsWith('- ')) {
                const movementStr = line.substring(2).trim();
                const movement = parseMovementLine(movementStr);
                if (movement) {
                    currentBlock.movements!.push(movement);
                }
                continue;
            }
        }
    }

    if (currentBlock) {
        wod.blocks!.push(currentBlock as Block);
    }

    // Default values if missing
    if (!wod.name) wod.name = 'Imported WOD';

    if (wod.blocks!.length === 0) {
        // Create a default block if no movements were found
        wod.blocks!.push({
            id: `block_${Date.now()}`,
            name: 'Main',
            timingMode: globalMode,
            timeCap: globalTimeCap || (globalMode === 'AMRAP' ? 1200 : undefined),
            movements: [],
            rounds: 1,
            restBetweenRounds: globalRestTime || 0,
            isLooping: false,
            order: 0,
        });
    } else {
        // Post-processing for AMRAP defaults on blocks
        wod.blocks!.forEach(block => {
            if (block.timingMode === 'AMRAP' && !block.timeCap) {
                block.timeCap = 1200;
            }
        });
    }

    return wod;
}

function parseMovementLine(line: string): Movement | null {
    // Regex pattern: [reps] [exercise name] ([weight] [weightUnit])
    // Examples: 
    // "10 Pull-ups"
    // "20 Push-ups"
    // "15 Deadlifts (100 kg)"
    // "400 Meters Run"

    const match = line.match(/^(\d+)\s+(.+?)(?:\s*\((.+?)\))?$/);
    if (!match) return null;

    const repsStr = match[1];
    let exerciseNameStr = match[2].trim();
    const weightStr = match[3] ? match[3].trim() : null;

    const reps = parseInt(repsStr);

    // Try to find exercise by name (case-insensitive fuzzy match)
    const exercise = findExerciseByName(exerciseNameStr);
    if (!exercise) return null;

    const movement: Movement = {
        id: `movement_${Date.now()}_${Math.random()}`,
        exerciseId: exercise.id,
        exercise: exercise,
        reps: reps,
        unit: exercise.defaultUnit,
    };

    if (weightStr) {
        const weightMatch = weightStr.match(/^(\d+)\s*(kg|kg|lbs|LBS)$/i);
        if (weightMatch) {
            movement.weight = parseInt(weightMatch[1]);
            movement.weightUnit = weightMatch[2].toUpperCase() as 'KG' | 'LBS';
        }
    }

    return movement;
}

function findExerciseByName(name: string) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const search = normalize(name);

    // Handle some common variations
    const searchSingular = search.endsWith('s') ? search.slice(0, -1) : search;
    const searchPlural = search.endsWith('s') ? search : search + 's';

    const exercisePool = exercises.map(e => ({
        ...e,
        normalizedName: normalize(e.name),
        normalizedId: normalize(e.id)
    }));

    // 1. Exact match on normalized name or ID
    let found = exercisePool.find(e =>
        e.normalizedName === search ||
        e.normalizedId === search ||
        e.normalizedName === searchSingular ||
        e.normalizedName === searchPlural
    );
    if (found) return exercises.find(e => e.id === found!.id);

    // 2. Starts with / Includes match
    found = exercisePool.find(e =>
        e.normalizedName.startsWith(search) ||
        search.startsWith(e.normalizedName) ||
        e.normalizedName.includes(search) ||
        search.includes(e.normalizedName)
    );
    if (found) return exercises.find(e => e.id === found!.id);

    return null;
}
