// Audio system for timer cues using Web Audio API
// No external dependencies needed

export type AudioCue = 'BEEP_SHORT' | 'BEEP_LONG' | 'COUNTDOWN_3' | 'COUNTDOWN_2' | 'COUNTDOWN_1' | 'START' | 'COMPLETE' | 'REST' | 'WORK';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.7;

  constructor() {
    // Initialize on first user interaction
    this.init();
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  private playBeep(frequency: number = 880, duration: number = 0.15) {
    this.playTone(frequency, duration, 'sine');
  }

  private playLongTone(frequency: number = 880, duration: number = 1.0) {
    this.playTone(frequency, duration, 'sine');
  }

  playCue(cue: AudioCue) {
    this.ensureContext();

    switch (cue) {
      case 'BEEP_SHORT':
        this.playBeep(880, 0.1);
        break;
      case 'BEEP_LONG':
        this.playLongTone(880, 0.5);
        break;
      case 'COUNTDOWN_3':
        this.playBeep(523.25, 0.15); // C5
        break;
      case 'COUNTDOWN_2':
        this.playBeep(659.25, 0.15); // E5
        break;
      case 'COUNTDOWN_1':
        this.playBeep(783.99, 0.15); // G5
        break;
      case 'START':
        // Ascending triple beep
        this.playBeep(523.25, 0.1);
        setTimeout(() => this.playBeep(659.25, 0.1), 100);
        setTimeout(() => this.playBeep(880, 0.3), 200);
        break;
      case 'COMPLETE':
        // Victory fanfare
        this.playTone(523.25, 0.2, 'sine');
        setTimeout(() => this.playTone(659.25, 0.2, 'sine'), 150);
        setTimeout(() => this.playTone(783.99, 0.2, 'sine'), 300);
        setTimeout(() => this.playTone(1046.5, 0.6, 'sine'), 450);
        break;
      case 'REST':
        this.playLongTone(440, 0.3); // A4
        break;
      case 'WORK':
        this.playLongTone(880, 0.3); // A5
        break;
    }
  }

  // Play countdown sequence (3-2-1-GO)
  playCountdown() {
    this.ensureContext();
    this.playCue('COUNTDOWN_3');
    setTimeout(() => this.playCue('COUNTDOWN_2'), 1000);
    setTimeout(() => this.playCue('COUNTDOWN_1'), 2000);
    setTimeout(() => this.playCue('START'), 3000);
  }

  // Test all sounds
  testAll() {
    const cues: AudioCue[] = ['BEEP_SHORT', 'BEEP_LONG', 'COUNTDOWN_3', 'COUNTDOWN_2', 'COUNTDOWN_1', 'START', 'COMPLETE', 'REST', 'WORK'];
    let delay = 0;
    cues.forEach(cue => {
      setTimeout(() => this.playCue(cue), delay);
      delay += 800;
    });
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();

// Hook for React components
export const useAudio = () => {
  return {
    playCue: (cue: AudioCue) => audioEngine.playCue(cue),
    playCountdown: () => audioEngine.playCountdown(),
    setEnabled: (enabled: boolean) => audioEngine.setEnabled(enabled),
    setVolume: (volume: number) => audioEngine.setVolume(volume),
    testAll: () => audioEngine.testAll(),
  };
};
