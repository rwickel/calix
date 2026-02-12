import { useState } from 'react';
import { FolderOpen, Trash2, Play, Edit, Search, X, Clock, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WOD, TimingMode } from '@/types/wod';
import { useWODStore } from '@/hooks/useWODStore';

interface SavedWODsProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (wod: WOD) => void;
  onStart: (wod: WOD) => void;
}

const timingModeLabels: Record<TimingMode, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  INTERVAL: 'Interval',
  FIXED_SETS: 'Fixed Sets',
};

export function SavedWODs({ isOpen, onClose, onLoad, onStart }: SavedWODsProps) {
  const { savedWODs, deleteWOD } = useWODStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [wodToDelete, setWodToDelete] = useState<WOD | null>(null);

  const filteredWODs = savedWODs.filter(wod =>
    wod.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (wod: WOD) => {
    setWodToDelete(wod);
  };

  const confirmDelete = () => {
    if (wodToDelete) {
      deleteWOD(wodToDelete.id);
      setWodToDelete(null);
    }
  };

  const getMovementSummary = (wod: WOD) => {
    const totalMovements = wod.blocks.reduce((acc, block) => acc + block.movements.length, 0);
    const totalRounds = wod.blocks.reduce((acc, block) => acc + (block.rounds || 1), 0);
    return `${totalMovements} movements${totalRounds > 1 ? `, ${totalRounds} rounds` : ''}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FolderOpen className="w-6 h-6 text-primary" />
            Saved WODs
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search saved WODs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* WOD List */}
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {filteredWODs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved WODs yet.</p>
                <p className="text-sm">Create and save a WOD to see it here.</p>
              </div>
            ) : (
              filteredWODs.map(wod => (
                <Card key={wod.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{wod.name}</h3>
                          {wod.isBenchmark && (
                            <Badge variant="secondary" className="text-xs">
                              Benchmark
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {timingModeLabels[wod.timingMode]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Dumbbell className="w-3 h-3 mr-1" />
                            {getMovementSummary(wod)}
                          </Badge>
                          {wod.timeCap && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.floor(wod.timeCap / 60)} min cap
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Saved {formatDate(wod.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onLoad(wod)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onStart(wod)}
                          title="Start"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(wod)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {filteredWODs.length} WOD{filteredWODs.length !== 1 ? 's' : ''} saved
          </span>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!wodToDelete} onOpenChange={() => setWodToDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete WOD?</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{wodToDelete?.name}"? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setWodToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
