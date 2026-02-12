# Calix: Pro WOD Creator & Timer

Calix is a high-performance workout creation and timing platform designed for athletes, coaches, and fitness enthusiasts. Build complex training sessions, import WODs via Markdown, and execute them with a precision multi-modal timer.

##  App Home
*The Calix dashboard provides a streamlined overview of your training day. Access your saved workouts, browse benchmark WODs, and launch the timer with a single tap.*
![Calix Home](image.png)

## Custom WOD Builder
*The most flexible workout builder on the market. Mix multiple timing modes (AMRAP, EMOM, For Time, Intervals) into a single unified session.*
![WOD Builder](image-1.png)

##  Key Features

###  Smart Timing Modes
- **AMRAP (As Many Rounds As Possible)**: Set a time cap and crush as many sets as you can.
- **FOR TIME**: Race against the clock to complete your prescribed work.
- **EMOM (Every Minute on the Minute)**: Precision intervals for high-intensity training.
- **INTERVAL**: Customizable Work/Rest cycles with audio cues.
- **FIXED SETS**: Perfect for strength training with manual pacing and "Add Pause" support.

### 📝 Markdown Import Engine
- Paste or upload workouts in a human-readable Markdown format.
- **Templates**: Instant access to "Cindy", "Hero WODs", and tactical templates through a new collapsible UI.
- **Smart Parsing**: Automatically detects movements, reps, and weights.

###  High-Fidelity Timer
- Precision timing with spoken and rhythmic audio cues.
- Adaptive UI that changes based on the current movement and remaining time.

###  Mobile Ready
- Fully powered by **Capacitor**, ready for native deployment to **iOS** and **Android**.

##  Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/rwickel/calix.git

# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Mobile
```bash
# Production build
npm run build

# Synchronize with mobile platforms
npx cap sync

# Open in native developer tools
npx cap open android
npx cap open ios
```

## 📄 License
All rights reserved. 
