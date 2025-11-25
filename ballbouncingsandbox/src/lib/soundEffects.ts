// Create a single shared audio context for better performance
let audioContext: AudioContext | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicGainNode: GainNode | null = null;
let isMusicPlaying = false;
let soundsEnabled = true;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (happens after page load or user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

export const setSoundsEnabled = (enabled: boolean) => {
  soundsEnabled = enabled;
};

export const setMusicEnabled = (enabled: boolean) => {
  if (enabled && !isMusicPlaying) {
    playBackgroundMusic();
  } else if (!enabled && isMusicPlaying) {
    stopBackgroundMusic();
  }
};

const playBackgroundMusic = () => {
  try {
    const ctx = getAudioContext();
    
    // Create a gentle ambient music loop using multiple oscillators
    musicGainNode = ctx.createGain();
    musicGainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    musicGainNode.connect(ctx.destination);
    
    // Calm chord progression (C major pentatonic)
    const frequencies = [261.63, 329.63, 392.00]; // C, E, G
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slight detuning for a richer sound
      oscillator.detune.setValueAtTime(index * 2, ctx.currentTime);
      
      // Individual voice volume
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      
      oscillator.connect(gain);
      gain.connect(musicGainNode!);
      
      oscillator.start(ctx.currentTime);
      musicOscillators.push(oscillator);
    });
    
    isMusicPlaying = true;
  } catch (error) {
    console.error('Error playing music:', error);
  }
};

const stopBackgroundMusic = () => {
  if (musicOscillators.length > 0) {
    musicOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    musicOscillators = [];
  }
  if (musicGainNode && audioContext) {
    musicGainNode.disconnect();
    musicGainNode = null;
  }
  isMusicPlaying = false;
};

export const playBounceSound = () => {
  if (!soundsEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Drum-like sound: low frequency with quick decay
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.error('Error playing bounce sound:', error);
  }
};

export const playPopSound = () => {
  if (!soundsEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Pop sound: quick high to low frequency sweep
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  } catch (error) {
    console.error('Error playing pop sound:', error);
  }
};
