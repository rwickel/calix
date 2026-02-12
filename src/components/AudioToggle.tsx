import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

interface AudioToggleProps {
  enabled: boolean;
  onToggle: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({
  enabled,
  onToggle,
  volume,
  onVolumeChange
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const getVolumeIcon = () => {
    if (!enabled || volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  const handleMobileToggle = () => {
    if (isMobile) {
      setShowSlider(!showSlider);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2"
      onMouseEnter={!isMobile ? () => setShowSlider(true) : undefined}
      onMouseLeave={!isMobile ? () => setShowSlider(false) : undefined}
      onClick={isMobile ? handleMobileToggle : undefined}
    >
      <AnimatePresence>
        {showSlider && enabled && (
          <motion.div
            initial={{ opacity: 0, width: 0, marginRight: 0 }}
            animate={{ opacity: 1, width: 80, marginRight: isMobile ? 0 : 8 }}
            exit={{ opacity: 0, width: 0, marginRight: 0 }}
            className={`overflow-hidden ${isMobile ? 'absolute top-full mt-2 right-0 z-50' : ''}`}
          >
            <Slider
              value={[volume * 100]}
              onValueChange={([val]) => onVolumeChange(val / 100)}
              max={100}
              step={5}
              className="w-20"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`rounded-lg p-2 transition-colors ${
          enabled
            ? 'bg-primary/20 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
        title={enabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {getVolumeIcon()}
      </motion.button>
    </div>
  );
};
