import { useState, useMemo } from 'react';
import { Search, Dumbbell, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exercises, getCategories, equipmentList } from '@/data/exercises';
import type { Exercise } from '@/types/wod';

interface ExerciseLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseLibrary({ isOpen, onClose, onSelect }: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const categories = useMemo(() => getCategories(), []);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = searchQuery === '' || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || exercise.category === selectedCategory;
      
      const matchesEquipment = !selectedEquipment || 
        exercise.equipment.some(eq => eq.id === selectedEquipment);

      return matchesSearch && matchesCategory && matchesEquipment;
    });
  }, [searchQuery, selectedCategory, selectedEquipment]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedEquipment(null);
  };

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    onClose();
    clearFilters();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Dumbbell className="w-6 h-6 text-primary" />
            Exercise Library
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Equipment Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Dumbbell className="w-4 h-4" />
              <span>Filter by equipment:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedEquipment === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEquipment(null)}
              >
                All
              </Button>
              {equipmentList.slice(0, 10).map(equip => (
                <Button
                  key={equip.id}
                  variant={selectedEquipment === equip.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEquipment(equip.id)}
                >
                  {equip.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(searchQuery || selectedCategory || selectedEquipment) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Exercise List */}
        <ScrollArea className="h-[400px]">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => handleSelect(exercise)}
                className="text-left p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exercise.category}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {exercise.defaultUnit}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {exercise.equipment.slice(0, 2).map(eq => (
                    <span key={eq.id} className="text-xs text-muted-foreground">
                      {eq.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {exercise.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
          
          {filteredExercises.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No exercises found matching your criteria.</p>
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
          </span>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
