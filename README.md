# Your Workout Timer

A professional, customizable interval workout timer with work, rest, and preparation phases.

## Getting Started

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/rwickel/your-workout-timer.git

# Step 2: Navigate to the project directory
cd your-workout-timer

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Build Android App

```sh
npm install
npm run build
npx cap sync android
npx cap open android
```

## Capacitor Configuration

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourworkouttimer.app',
  appName: 'Your Workout Timer',
  webDir: 'dist',  
};

export default config;
```