import { useState } from 'react';
import { Trophy, Clock, Dumbbell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { WOD, TimingMode, WODScore } from '@/types/wod';

interface ScoreEntryProps {
  isOpen: boolean;
  onClose: () => void;
  wod: WOD;
  elapsedTime: number;
  onSave: (score: Partial<WODScore>) => void;
}

const timingModeLabels: Record<TimingMode, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  INTERVAL: 'Interval',
  FIXED_SETS: 'Fixed Sets',
};

export function ScoreEntry({ isOpen, onClose, wod, elapsedTime, onSave }: ScoreEntryProps) {
  const [totalTime, setTotalTime] = useState(elapsedTime);
  const [totalRounds, setTotalRounds] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [weightUsed, setWeightUsed] = useState('');
  const [weightUnit, setWeightUnit] = useState<'KG' | 'LBS'>('KG');
  const [rx, setRx] = useState(true);
  const [notes, setNotes] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const score: Partial<WODScore> = {
      wodId: wod.id,
      completedAt: new Date(),
      rx,
      notes: notes || undefined,
    };

    if (wod.timingMode === 'FOR_TIME') {
      score.totalTime = totalTime;
    } else if (wod.timingMode === 'AMRAP') {
      score.totalRounds = totalRounds;
      score.totalReps = totalReps;
    }

    if (weightUsed) {
      score.weightUsed = parseFloat(weightUsed);
      score.weightUnit = weightUnit;
    }

    onSave(score);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTotalTime(elapsedTime);
    setTotalRounds(0);
    setTotalReps(0);
    setWeightUsed('');
    setWeightUnit('KG');
    setRx(true);
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Record Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* WOD Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{wod.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {timingModeLabels[wod.timingMode]}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tabular-nums">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">elapsed time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Inputs based on WOD type */}
          {wod.timingMode === 'FOR_TIME' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Total Time (seconds)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={totalTime}
                  onChange={(e) => setTotalTime(parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 px-3 bg-muted rounded-md">
                  <span className="text-sm font-mono">{formatTime(totalTime)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your finish time in seconds
              </p>
            </div>
          )}

          {wod.timingMode === 'AMRAP' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rounds Completed</Label>
                <Input
                  type="number"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Reps</Label>
                <Input
                  type="number"
                  value={totalReps}
                  onChange={(e) => setTotalReps(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Weight Used */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Weight Used (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={weightUsed}
                onChange={(e) => setWeightUsed(e.target.value)}
                placeholder="No weight recorded"
                className="flex-1"
              />
              <div className="flex rounded-md overflow-hidden border">
                <button
                  onClick={() => setWeightUnit('KG')}
                  className={`px-4 py-2 text-sm font-medium ${
                    weightUnit === 'KG' ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                >
                  kg
                </button>
                <button
                  onClick={() => setWeightUnit('LBS')}
                  className={`px-4 py-2 text-sm font-medium ${
                    weightUnit === 'LBS' ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>

          {/* RX / Scaled */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-semibold">RX (As Prescribed)</Label>
              <p className="text-sm text-muted-foreground">
                Did you complete the WOD as written?
              </p>
            </div>
            <Switch checked={rx} onCheckedChange={setRx} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any modifications?"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Save Score
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
