import { useState, useEffect } from 'react';
import {
  Dumbbell, Plus, FolderOpen, Trophy,
  Play, Save, Clock, Timer,
  Volume2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster, toast } from 'sonner';
import { WODBuilder } from '@/components/WODBuilder';
import { TimerDisplay } from '@/components/TimerDisplay';
import { PresetSelector } from '@/components/PresetSelector';
import { SavedWODs } from '@/components/SavedWODs';
import { ScoreEntry } from '@/components/ScoreEntry';
import { useWODStore, WODProvider } from '@/hooks/useWODStore';
import type { WOD, WODScore } from '@/types/wod';
import { audioEngine } from '@/lib/audio';
import './App.css';

type ViewMode = 'builder' | 'timer' | 'empty';

function AppContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('empty');
  const [isPresetSelectorOpen, setIsPresetSelectorOpen] = useState(false);
  const [isSavedWODsOpen, setIsSavedWODsOpen] = useState(false);
  const [isScoreEntryOpen, setIsScoreEntryOpen] = useState(false);
  const [completedWODData, setCompletedWODData] = useState<{ wod: WOD; elapsedTime: number } | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [savedScores, setSavedScores] = useState<WODScore[]>([]);

  const {
    currentWOD,
    savedWODs,
    createWOD,
    loadWOD,
    saveWOD,
    loadPreset,
  } = useWODStore();

  // Load saved scores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wod_scores');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedScores(parsed.map((s: any) => ({
          ...s,
          completedAt: new Date(s.completedAt),
        })));
      } catch (e) {
        console.error('Failed to load scores:', e);
      }
    }
  }, []);

  // Save scores to localStorage
  useEffect(() => {
    if (savedScores.length > 0) {
      localStorage.setItem('wod_scores', JSON.stringify(savedScores));
    }
  }, [savedScores]);

  // Audio toggle
  useEffect(() => {
    audioEngine.setEnabled(audioEnabled);
  }, [audioEnabled]);

  const handleCreateNew = () => {
    createWOD();
    setViewMode('builder');
    toast.success('New WOD created');
  };

  const handleLoadPreset = (preset: Partial<WOD>) => {
    loadPreset(preset);
    setViewMode('builder');
    toast.success(`Loaded ${preset.name}`);
  };

  const handleLoadSaved = (wod: WOD) => {
    loadWOD(wod);
    setIsSavedWODsOpen(false);
    setViewMode('builder');
    toast.success(`Loaded ${wod.name}`);
  };

  const handleStartSaved = (wod: WOD) => {
    loadWOD(wod);
    setIsSavedWODsOpen(false);
    setViewMode('timer');
  };

  const handleStartWOD = () => {
    if (!currentWOD || currentWOD.blocks.length === 0 || currentWOD.blocks.every(b => b.movements.length === 0)) {
      toast.error('Add movements to at least one block to start');
      return;
    }
    setViewMode('timer');
  };

  const handleWODComplete = () => {
    if (currentWOD) {
      setCompletedWODData({ wod: currentWOD, elapsedTime: 0 }); // elapsedTime will come from timer
      setIsScoreEntryOpen(true);
    }
    setViewMode('builder');
  };

  const handleTimerExit = () => {
    setViewMode('builder');
  };

  const handleSaveScore = (score: Partial<WODScore>) => {
    const newScore: WODScore = {
      id: `score_${Date.now()}`,
      wodId: score.wodId!,
      completedAt: score.completedAt!,
      totalTime: score.totalTime,
      totalRounds: score.totalRounds,
      totalReps: score.totalReps,
      weightUsed: score.weightUsed,
      weightUnit: score.weightUnit,
      notes: score.notes,
      rx: score.rx ?? true,
    };
    setSavedScores(prev => [newScore, ...prev]);
    toast.success('Score saved!');
  };

  const handleSaveWOD = () => {
    saveWOD();
    toast.success('WOD saved successfully');
  };

  // Timer view
  if (viewMode === 'timer' && currentWOD) {
    return (
      <TimerDisplay
        wod={currentWOD}
        onComplete={handleWODComplete}
        onExit={handleTimerExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Calix</h1>
                <p className="text-xs text-muted-foreground">Create. Time. Crush it.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
                title={audioEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPresetSelectorOpen(true)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Presets
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSavedWODsOpen(true)}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Saved
                {savedWODs.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {savedWODs.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {viewMode === 'empty' ? (
          // Empty state
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Timer className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Calix </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create custom workouts, time your sessions, and track your progress.
                Load a preset or build your own WOD from scratch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={handleCreateNew}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Create New WOD</h3>
                  <p className="text-sm text-muted-foreground">
                    Build a custom workout from scratch
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setIsPresetSelectorOpen(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold mb-1">Load Preset</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from benchmark WODs
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setIsSavedWODsOpen(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-1">Saved WODs</h3>
                  <p className="text-sm text-muted-foreground">
                    {savedWODs.length > 0
                      ? `${savedWODs.length} saved workout${savedWODs.length !== 1 ? 's' : ''}`
                      : 'No saved workouts yet'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scores */}
            {savedScores.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Scores
                </h3>
                <div className="space-y-2">
                  {savedScores.slice(0, 5).map(score => (
                    <Card key={score.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {new Date(score.completedAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {score.rx ? 'RX' : 'Scaled'}
                              {score.totalTime && ` • ${Math.floor(score.totalTime / 60)}:${(score.totalTime % 60).toString().padStart(2, '0')}`}
                              {score.totalRounds !== undefined && ` • ${score.totalRounds} rounds${score.totalReps ? ` + ${score.totalReps}` : ''}`}
                            </p>
                          </div>
                          {score.rx ? (
                            <Badge>RX</Badge>
                          ) : (
                            <Badge variant="outline">Scaled</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Builder view
          <div className="space-y-6">
            {/* Builder Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setViewMode('empty')}>
                  ← Back
                </Button>
                {currentWOD && (
                  <div>
                    <h2 className="text-xl font-bold">{currentWOD.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {currentWOD.blocks[0] && (
                        <Badge variant="outline">{currentWOD.blocks[0].timingMode}</Badge>
                      )}
                      <span>{currentWOD.blocks.length} block{currentWOD.blocks.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSaveWOD}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleStartWOD}>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </div>
            </div>

            <Separator />

            {/* WOD Builder */}
            <WODBuilder onStartWOD={handleStartWOD} />
          </div>
        )}
      </main>

      {/* Dialogs */}
      <PresetSelector
        isOpen={isPresetSelectorOpen}
        onClose={() => setIsPresetSelectorOpen(false)}
        onSelect={handleLoadPreset}
      />

      <SavedWODs
        isOpen={isSavedWODsOpen}
        onClose={() => setIsSavedWODsOpen(false)}
        onLoad={handleLoadSaved}
        onStart={handleStartSaved}
      />

      {completedWODData && (
        <ScoreEntry
          isOpen={isScoreEntryOpen}
          onClose={() => setIsScoreEntryOpen(false)}
          wod={completedWODData.wod}
          elapsedTime={completedWODData.elapsedTime}
          onSave={handleSaveScore}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WODProvider>
      <AppContent />
    </WODProvider>
  );
}
