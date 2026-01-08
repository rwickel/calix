import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronLeft } from 'lucide-react';
import { TimerConfig, DEFAULT_CONFIG } from '@/types/timer';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { TimerDisplay } from '@/components/TimerDisplay';
import { TimerControls } from '@/components/TimerControls';
import { ConfigCard } from '@/components/ConfigCard';
import { WorkoutSummary } from '@/components/WorkoutSummary';

const Index: React.FC = () => {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(true);
  const timer = useWorkoutTimer(config);

  const handleStartWorkout = () => {
    setShowConfig(false);
    timer.reset();
    timer.start();
  };

  const handleBackToConfig = () => {
    timer.reset();
    setShowConfig(true);
  };

  return (
    <div className="flex min-h-full flex-col bg-background mobile-safe">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 bg-card/80 px-4 backdrop-blur-lg">
        {!showConfig ? (
          <button
            onClick={handleBackToConfig}
            className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
        ) : (
          <div />
        )}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-primary">
          Workout Timer
        </h1>
        {!showConfig && (
          <button
            onClick={handleBackToConfig}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
        {showConfig && <div />}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-lg p-4">
          <AnimatePresence mode="wait">
            {showConfig ? (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 pb-8"
              >
                <ConfigCard config={config} onChange={setConfig} />
                <WorkoutSummary config={config} />
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartWorkout}
                  className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all glow-primary hover:brightness-110"
                >
                  Start Workout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-12"
              >
                <TimerDisplay state={timer.state} totalRounds={config.rounds} />
                <TimerControls
                  state={timer.state}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onReset={timer.reset}
                  onSkip={timer.skipPhase}
                  onAdjustTime={timer.adjustTime}
                />

                {timer.state.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <h2 className="mb-4 text-2xl font-bold text-work">
                      🎉 Workout Complete!
                    </h2>
                    <button
                      onClick={handleBackToConfig}
                      className="rounded-lg bg-muted px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted/80"
                    >
                      Back to Settings
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
