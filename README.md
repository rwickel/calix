# WOD Creator & Timer (Calix)

A professional, high-performance workout creator and multi-mode timer. Built for athletes and coaches to design complex sessions with ease.

## 🚀 Features

### 🛠️ Advanced WOD Builder
- **Multi-Block Sessions**: Create warmups, strength pieces, and metcons in a single session.
- **Smart Timing Modes**:
  - **AMRAP**: Loop through movements until the time cap.
  - **FOR TIME**: Race against the clock.
  - **EMOM**: Every Minute on the Minute (or custom intervals).
  - **INTERVAL**: Work/Rest cycles with custom rounds.
  - **FIXED SETS**: Manual pacing with optional "Add Pause" functionality.
- **Exercise Library**: Searchable database of movements with custom reps, units, and weights.

### 📝 Markdown Import
- Import workouts using a human-readable Markdown format.
- **Example Templates**: Integrated "Cindy", "Hero WODs", and "EMOM" templates to get you started faster.
- **Auto-Parser**: Automatically identifies movements, reps, and timing modes.

### ⏱️ Multi-Modal Timer
- Precise timing engine with audio cues for work/rest transitions.
- Phase-specific UI that adapts to the current training mode.

### 📱 Mobile Ready
- Built with **Capacitor** for deployment to Android and iOS.
- Native feel with web performance.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite.
- **Styling**: Tailwind CSS, Lucide Icons.
- **UI Components**: Shadcn UI (Radix Primitives).
- **Mobile**: Capacitor.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/rwickel/calix.git

# Navigate to the app directory
cd app

# Install dependencies
npm install
```

### Development
```bash
# Start Vite development server
npm run dev
```

### Mobile Deployment
```bash
# Build the web assets
npm run build

# Sync with Capacitor
npx cap sync

# Open in native IDE
npx cap open android
npx cap open ios
```

## 📄 License
This project is for personal and professional workout management. 