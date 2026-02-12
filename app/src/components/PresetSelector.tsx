import { useState } from 'react';
import { Trophy, Flame, Search, X, Dumbbell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { theGirlsWODs, heroWODs } from '@/data/presets';
import type { WOD, TimingMode } from '@/types/wod';

interface PresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (wod: Partial<WOD>) => void;
}

const timingModeLabels: Record<TimingMode, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  INTERVAL: 'Interval',
  FIXED_SETS: 'Fixed Sets',
};

export function PresetSelector({ isOpen, onClose, onSelect }: PresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWOD, setSelectedWOD] = useState<Partial<WOD> | null>(null);

  const filteredGirls = theGirlsWODs.filter(wod =>
    wod.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHeroes = heroWODs.filter(wod =>
    wod.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (wod: Partial<WOD>) => {
    setSelectedWOD(wod);
  };

  const handleConfirm = () => {
    if (selectedWOD) {
      onSelect(selectedWOD);
      setSelectedWOD(null);
      setSearchQuery('');
      onClose();
    }
  };

  const getMovementSummary = (wod: Partial<WOD>) => {
    if (!wod.blocks) return '';
    const totalMovements = wod.blocks.reduce((acc, block) => acc + block.movements.length, 0);
    const totalRounds = wod.blocks.reduce((acc, block) => acc + (block.rounds || 1), 0);
    return `${totalMovements} movements${totalRounds > 1 ? `, ${totalRounds} rounds` : ''}`;
  };

  const getEstimatedTime = (wod: Partial<WOD>) => {
    if (wod.timeCap) {
      return `${Math.floor(wod.timeCap / 60)} min cap`;
    }
    if (wod.timingMode === 'AMRAP') {
      return `${Math.floor((wod.timeCap || 1200) / 60)} min AMRAP`;
    }
    return 'Open ended';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Load Preset WOD
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search presets..."
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

        {/* Tabs */}
        <Tabs defaultValue="girls" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="girls"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Flame className="w-4 h-4 mr-2 text-pink-500" />
              The Girls ({filteredGirls.length})
            </TabsTrigger>
            <TabsTrigger
              value="heroes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              Hero WODs ({filteredHeroes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="girls" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredGirls.map(wod => (
                  <PresetCard
                    key={wod.id}
                    wod={wod}
                    isSelected={selectedWOD?.id === wod.id}
                    onClick={() => handleSelect(wod)}
                    timingModeLabels={timingModeLabels}
                    getEstimatedTime={getEstimatedTime}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="heroes" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredHeroes.map(wod => (
                  <PresetCard
                    key={wod.id}
                    wod={wod}
                    isSelected={selectedWOD?.id === wod.id}
                    onClick={() => handleSelect(wod)}
                    timingModeLabels={timingModeLabels}
                    getEstimatedTime={getEstimatedTime}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Preview Panel */}
        {selectedWOD && (
          <div className="p-4 border-t bg-muted">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedWOD.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedWOD.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">
                    {timingModeLabels[selectedWOD.timingMode as TimingMode]}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {getEstimatedTime(selectedWOD)}
                  </Badge>
                  <Badge variant="outline">
                    <Dumbbell className="w-3 h-3 mr-1" />
                    {getMovementSummary(selectedWOD)}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleConfirm}>
                Load WOD
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {filteredGirls.length + filteredHeroes.length} presets available
          </span>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PresetCardProps {
  wod: Partial<WOD>;
  isSelected: boolean;
  onClick: () => void;
  timingModeLabels: Record<TimingMode, string>;
  getEstimatedTime: (wod: Partial<WOD>) => string;
}

function PresetCard({ wod, isSelected, onClick, timingModeLabels, getEstimatedTime }: PresetCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:border-primary ${
        isSelected ? 'border-2 border-primary bg-primary/5' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{wod.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {wod.description}
            </p>
          </div>
          {isSelected && (
            <Badge className="bg-primary text-primary-foreground">
              Selected
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          <Badge variant="secondary" className="text-xs">
            {timingModeLabels[wod.timingMode as TimingMode]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getEstimatedTime(wod)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
