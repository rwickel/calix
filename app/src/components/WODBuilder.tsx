import { useState } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown,
  Dumbbell, Repeat, Settings, X, GripVertical,
  Save, Play, FileText, Download, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ExerciseLibrary } from './ExerciseLibrary';
import type { Movement, Exercise, TimingMode, WOD } from '@/types/wod';
import { useWODStore } from '@/hooks/useWODStore';
import { parseWOD } from '@/lib/wodParser';
import { toast } from 'sonner';
import { exercises } from '@/data/exercises';

interface WODBuilderProps {
  onStartWOD: () => void;
}

const timingModeLabels: Record<TimingMode, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  INTERVAL: 'Interval',
  FIXED_SETS: 'Fixed Sets',
};

const MARKDOWN_TEMPLATES = [
  {
    title: "AMRAP (e.g. Cindy)",
    content: `# Cindy
Description: As many rounds as possible in 20 minutes
Mode: AMRAP
Time Cap: 20

## Main
- 5 Pull-ups
- 10 Push-ups
- 15 Air Squats`
  },
  {
    title: "For Time (Hero WOD)",
    content: `# DT
Description: 5 Rounds for Time
Mode: FOR_TIME

## The Work
Rounds: 5
- 12 Deadlifts (70 kg)
- 9 Hang Power Cleans (70 kg)
- 6 Push Jerks (70 kg)`
  },
  {
    title: "EMOM (Kettlebell)",
    content: `# KB Power
Description: Every Minute on the Minute for 10 minutes
Mode: EMOM

## Intervals
Intervals: 10
Work: 60
- 15 Kettlebell Swings
- 5 Goblet Squats`
  },
  {
    title: "Intervals (Sprint/Rest)",
    content: `# Sprint Finisher
Description: High intensity intervals
Mode: INTERVAL

## Sprints
Intervals: 8
Work: 20
Rest: 10
- 10 Burpees`
  }
];

export function WODBuilder({ onStartWOD }: WODBuilderProps) {
  const {
    currentWOD,
    updateWOD,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    addMovement,
    updateMovement,
    removeMovement,
    moveMovement,
    saveWOD,
    loadPreset,
  } = useWODStore();

  const [isExerciseLibraryOpen, setIsExerciseLibraryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingMovement, setEditingMovement] = useState<{ blockId: string; movement: Movement } | null>(null);

  if (!currentWOD) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Dumbbell className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground">No WOD loaded. Create a new one or load a preset.</p>
      </div>
    );
  }

  const handleAddMovement = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsExerciseLibraryOpen(true);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    if (selectedBlockId) {
      addMovement(selectedBlockId, exercise);
      setSelectedBlockId(null);
    }
  };

  const getRepDisplay = (movement: Movement) => {
    if (movement.repScheme === 'DESCENDING' && movement.repSequence) {
      return movement.repSequence.join('-');
    }
    return movement.reps;
  };

  const handleImport = () => {
    try {
      const parsedWOD = parseWOD(importText);
      loadPreset(parsedWOD);
      setIsImportOpen(false);
      setImportText('');
      toast.success('WOD imported from Markdown successfully');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to parse Markdown. Please check the format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* WOD Header */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>WOD Name</Label>
            <Input
              value={currentWOD.name}
              onChange={(e) => updateWOD({ name: e.target.value })}
              placeholder="Enter WOD name..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="text-xs"
            >
              <FileText className="w-4 h-4 mr-2" />
              Import from Markdown
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Blocks
          </h2>
          <Button onClick={addBlock} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        </div>

        {currentWOD.blocks.map((block, blockIndex) => (
          <Card key={block.id} className="border-l-4 border-l-primary">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <Input
                  value={block.name}
                  onChange={(e) => updateBlock(block.id, { name: e.target.value })}
                  className="font-semibold flex-1"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={blockIndex === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={blockIndex === currentWOD.blocks.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlock(block.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              {/* Block timing settings */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-xs">Timing Mode</Label>
                  <Select
                    value={block.timingMode}
                    onValueChange={(value) => updateBlock(block.id, { timingMode: value as TimingMode })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(timingModeLabels).map(([mode, label]) => (
                        <SelectItem key={mode} value={mode}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rounds - Only for EMOM, INTERVAL, FIXED_SETS. Hide for AMRAP, FOR_TIME. */}
                {block.timingMode !== 'AMRAP' && block.timingMode !== 'FOR_TIME' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Rounds</Label>
                    <Input
                      type="number"
                      value={block.rounds}
                      onChange={(e) => updateBlock(block.id, {
                        rounds: parseInt(e.target.value) || 1,
                        isLooping: (parseInt(e.target.value) || 1) > 1
                      })}
                      className="h-8"
                      min={1}
                    />
                  </div>
                )}

                {/* Time Cap - Only for AMRAP */}
                {block.timingMode === 'AMRAP' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Time Cap (min)</Label>
                    <Input
                      type="number"
                      value={block.timeCap ? Math.floor(block.timeCap / 60) : ''}
                      onChange={(e) => updateBlock(block.id, { timeCap: parseInt(e.target.value) * 60 || undefined })}
                      className="h-8"
                      placeholder="None"
                    />
                  </div>
                )}

                {/* Work (sec) - For EMOM, INTERVAL */}
                {(block.timingMode === 'EMOM' || block.timingMode === 'INTERVAL') && (
                  <div className="space-y-2">
                    <Label className="text-xs">Work (sec)</Label>
                    <Input
                      type="number"
                      value={block.workTime || 60}
                      onChange={(e) => updateBlock(block.id, { workTime: parseInt(e.target.value) || 60 })}
                      className="h-8"
                    />
                  </div>
                )}

                {/* Rest (sec) - For INTERVAL only (EMOM has no rest per user) */}
                {block.timingMode === 'INTERVAL' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Rest (sec)</Label>
                    <Input
                      type="number"
                      value={block.restTime || 0}
                      onChange={(e) => updateBlock(block.id, { restTime: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                )}

                {/* Intervals - For EMOM, INTERVAL */}
                {(block.timingMode === 'EMOM' || block.timingMode === 'INTERVAL') && (
                  <div className="space-y-2">
                    <Label className="text-xs">Intervals</Label>
                    <Input
                      type="number"
                      value={block.totalIntervals || ''}
                      onChange={(e) => updateBlock(block.id, { totalIntervals: parseInt(e.target.value) || undefined })}
                      className="h-8"
                      placeholder="Max"
                    />
                  </div>
                )}

                {/* Round Rest - Hide for EMOM, FOR_TIME, AMRAP */}
                {block.rounds > 1 && block.timingMode !== 'EMOM' && block.timingMode !== 'FOR_TIME' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Round Rest (sec)</Label>
                    <Input
                      type="number"
                      value={block.restBetweenRounds}
                      onChange={(e) => updateBlock(block.id, { restBetweenRounds: parseInt(e.target.value) || 0 })}
                      className="h-8"
                      placeholder="sec"
                    />
                  </div>
                )}
              </div>

              {/* Movements */}
              <div className="space-y-2">
                {block.movements.map((movement, movementIndex) => (
                  <div
                    key={movement.id}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg group"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="font-medium flex-1">{movement.exercise.name}</span>
                    <Badge variant="secondary">
                      {getRepDisplay(movement)} {movement.unit.toLowerCase()}
                    </Badge>
                    {movement.weight && (
                      <Badge variant="outline">
                        {movement.weight} {movement.weightUnit}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveMovement(block.id, movement.id, 'up')}
                        disabled={movementIndex === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveMovement(block.id, movement.id, 'down')}
                        disabled={movementIndex === block.movements.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingMovement({ blockId: block.id, movement })}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeMovement(block.id, movement.id)}
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                {block.movements.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                    No movements yet. Add one below.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMovement(block.id)}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Movement
                </Button>
                {block.timingMode === 'FIXED_SETS' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const restEx = exercises.find(e => e.id === 'rest');
                      if (restEx) addMovement(block.id, restEx);
                    }}
                    className="flex-1"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Add Pause
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {currentWOD.blocks.length === 0 && (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
            <p>No blocks yet. Add your first block to get started.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button onClick={saveWOD} variant="outline" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save WOD
        </Button>
        <Button
          onClick={onStartWOD}
          className="flex-1"
          disabled={currentWOD.blocks.length === 0 || currentWOD.blocks.every(b => b.movements.length === 0)}
        >
          <Play className="w-4 h-4 mr-2" />
          Start WOD
        </Button>
      </div>

      {/* Exercise Library Dialog */}
      <ExerciseLibrary
        isOpen={isExerciseLibraryOpen}
        onClose={() => setIsExerciseLibraryOpen(false)}
        onSelect={handleExerciseSelect}
      />

      {/* Edit Movement Dialog */}
      <Dialog open={!!editingMovement} onOpenChange={() => setEditingMovement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Movement</DialogTitle>
          </DialogHeader>
          {editingMovement && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reps / Amount</Label>
                <Input
                  type="number"
                  value={editingMovement.movement.reps || ''}
                  onChange={(e) => {
                    const updated = { ...editingMovement.movement, reps: parseInt(e.target.value) || 0 };
                    setEditingMovement({ ...editingMovement, movement: updated });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={editingMovement.movement.unit}
                  onValueChange={(value) => {
                    const updated = { ...editingMovement.movement, unit: value as any };
                    setEditingMovement({ ...editingMovement, movement: updated });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPS">Reps</SelectItem>
                    <SelectItem value="SECONDS">Seconds</SelectItem>
                    <SelectItem value="MINUTES">Minutes</SelectItem>
                    <SelectItem value="CALORIES">Calories</SelectItem>
                    <SelectItem value="METERS">Meters</SelectItem>
                    <SelectItem value="MILES">Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editingMovement.movement.weight || ''}
                    onChange={(e) => {
                      const updated = { ...editingMovement.movement, weight: parseInt(e.target.value) || undefined };
                      setEditingMovement({ ...editingMovement, movement: updated });
                    }}
                    placeholder="No weight"
                  />
                  <Select
                    value={editingMovement.movement.weightUnit || 'KG'}
                    onValueChange={(value) => {
                      const updated = { ...editingMovement.movement, weightUnit: value as 'KG' | 'LBS' };
                      setEditingMovement({ ...editingMovement, movement: updated });
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">kg</SelectItem>
                      <SelectItem value="LBS">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => {
                  updateMovement(editingMovement.blockId, editingMovement.movement.id, editingMovement.movement);
                  setEditingMovement(null);
                }}
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Markdown Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import WOD from Markdown</DialogTitle>
            <DialogDescription>
              Paste your WOD definition in Markdown format below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="examples" className="border-none">
                <AccordionTrigger className="text-xs font-semibold py-2 hover:no-underline bg-muted px-3 rounded-md">
                  View Example Formats
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {MARKDOWN_TEMPLATES.map((template, idx) => (
                        <div key={idx} className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">{template.title}</p>
                          <div className="relative group">
                            <pre className="text-[10px] bg-muted/50 p-3 rounded-md overflow-x-auto border">
                              {template.content}
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setImportText(template.content)}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Textarea
              placeholder="# WOD Name..."
              className="min-h-[300px] font-mono text-sm"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importText.trim()}>
              <Download className="w-4 h-4 mr-2" />
              Import WOD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
