# Your Workout Timer - Project Context

This document provides a comprehensive overview of the **Your Workout Timer** project to assist Gemini in understanding the codebase, architecture, and development workflows.

## Project Overview

**Your Workout Timer** is a modern, responsive interval workout timer application built for both web and mobile platforms. It allows users to configure complex interval training sessions with specific work, rest, and preparation phases, including advanced features like progressive adjustments per round.

### Core Technologies

-   **Frontend Framework:** React 18 with TypeScript.
-   **Build Tool:** Vite.
-   **Styling:** Tailwind CSS.
-   **UI Components:** Shadcn UI (Radix UI primitives).
-   **Animations:** Framer Motion.
-   **Icons:** Lucide React.
-   **Mobile Platform:** Capacitor (Android).
-   **State Management:** React Hooks (Custom hooks for core logic).

## Architecture

The project follows a standard React component-based architecture with a strong separation between UI and business logic.

### Directory Structure

-   `src/components/`: Contains UI components.
    -   `ui/`: Base primitive components from Shadcn UI.
    -   `TimerDisplay.tsx`: The primary visual timer representation.
    -   `ConfigCard.tsx`: Interface for adjusting workout settings.
-   `src/hooks/`: Core business logic encapsulated in custom hooks.
    -   `useWorkoutTimer.ts`: Manages the timer state machine (phases, rounds, countdowns).
    -   `useAudio.ts`: Handles sound effects for phase changes and countdowns.
    -   `useFavorites.ts`: Manages persistence of user-saved workout configurations.
-   `src/pages/`: Page-level components (primarily `Index.tsx`).
-   `src/types/`: TypeScript interfaces and type definitions (e.g., `TimerConfig`, `TimerPhase`).
-   `android/`: Native Android project files managed by Capacitor.

### Core Logic: Timer State Machine

The workout progresses through several phases defined in `src/types/timer.ts`:
`idle` -> `preparation` -> `work` -> `pause` -> `work` ... -> `complete`

The `useWorkoutTimer` hook calculates "adjusted" times for each round based on the user's `workAdjustment` and `restAdjustment` settings, allowing the workout to get progressively harder or easier.

## Building and Running

### Development

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```powershell
# Build for web
npm run build
```

### Mobile (Android)

```powershell
# Sync web build to Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Development Conventions

1.  **TypeScript:** Strict typing is used throughout. Always define interfaces for props and state.
2.  **Styling:** Use Tailwind CSS utility classes. Prefer the `cn` utility from `src/lib/utils.ts` for conditional classes.
3.  **Components:** Small, reusable components located in `src/components/`.
4.  **State:** Business logic should reside in hooks (`src/hooks/`) to keep components focused on rendering.
5.  **Persistence:** Workout favorites are stored in `localStorage` via the `useFavorites` hook.

## Key Files for Reference

-   `package.json`: Dependencies and scripts.
-   `capacitor.config.ts`: Mobile app configuration.
-   `src/types/timer.ts`: The "source of truth" for the data model.
-   `src/hooks/useWorkoutTimer.ts`: The central engine of the application.
-   `src/pages/Index.tsx`: The main entry point for the application UI.
