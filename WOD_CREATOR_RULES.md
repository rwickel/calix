# WOD Creator - Custom Workout Creation Rules

This document outlines the rules and configurations for creating custom workouts in the WOD Creator application.

## 1. Timing Mode Specifications

Each block in a workout can have one of the following timing modes, which dictate the available settings and timer behavior.

### AMRAP (As Many Rounds As Possible)
*   **Goal**: Complete as many rounds and reps as possible within the time cap.
*   **Settings**:
    *   **Time Cap**: Required. Determines the duration of the AMRAP.
    *   **Rounds**: Not applicable (loops infinitely until time expires).
*   **Timer Behavior**: Counts down from the time cap to zero.

### FOR TIME
*   **Goal**: Complete the prescribed work as fast as possible.
*   **Settings**:
    *   **Rounds**: Not applicable (the whole block is one sequence).
    *   **Time Cap**: Not applicable (timer counts up indefinitely).
*   **Timer Behavior**: Counts up from zero.

### EMOM (Every Minute on the Minute)
*   **Goal**: Complete prescribed movements within each minute (or interval).
*   **Settings**:
    *   **Work (sec)**: The duration of the active window (default 60s).
    *   **Rest (sec)**: Not applicable (EMOMs are typically continuous).
    *   **Intervals**: Required. Determines the total number of minutes/intervals.
*   **Timer Behavior**: Counts down within each interval, beeping at the start of the next.

### INTERVAL
*   **Goal**: Alternate between work and rest periods.
*   **Settings**:
    *   **Work (sec)**: Duration of the work period.
    *   **Rest (sec)**: Duration of the rest period after each work interval.
    *   **Intervals**: Total number of work/rest cycles.
*   **Timer Behavior**: Alternates between "WORK" and "REST" phases with audio cues.

### FIXED SETS
*   **Goal**: Complete a specific number of sets/rounds at your own pace.
*   **Settings**:
    *   **Rounds / Sets**: Required.
    *   **Add Pause**: Special button to add a resting movement between exercises.
*   **Timer Behavior**: Counts up. User manually advances to the next movement/set.

## 2. Movement Configuration
*   **Reps / Amount**: Number of repetitions or measurement value.
*   **Unit**: REPS, SECONDS, MINUTES, CALORIES, METERS, MILES.
*   **Weight**: Optional weight and unit (KG/LBS).
*   **Rest After**: Optional rest period associated with a specific movement.

## 3. General Rules
*   **Mixed Mode**: Workouts can contain multiple blocks with different timing modes (e.g., a FOR TIME warmup followed by an AMRAP main piece).
*   **Audio Cues**: The system provides beeps and spoken cues (if enabled) for start, stop, work, rest, and 3-2-1 countdowns.
