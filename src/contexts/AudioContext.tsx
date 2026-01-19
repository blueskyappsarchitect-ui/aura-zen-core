import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";

interface AudioContextType {
  isAudioEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  toggleAudio: () => void;
  setVolume: (volume: number) => void;
  startAmbient: () => void;
  stopAmbient: () => void;
}

const AudioStateContext = createContext<AudioContextType | null>(null);

export const useAudioState = () => {
  const context = useContext(AudioStateContext);
  if (!context) {
    throw new Error("useAudioState must be used within AudioProvider");
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(25);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }[]>([]);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        masterGainRef.current.gain.value = volume / 100 * 0.15;
      } catch (e) {
        console.error('AudioContext creation failed:', e);
        return false;
      }
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return true;
  }, [volume]);

  const createLofiNatureSound = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    // Lo-fi nature layers: soft wind, gentle water, distant birds
    const layers = [
      // Soft wind - low rumble
      { freq: 80, type: 'sawtooth' as OscillatorType, lfoFreq: 0.05, gainVal: 0.015, detune: 20 },
      // Gentle stream - mid frequencies  
      { freq: 250, type: 'triangle' as OscillatorType, lfoFreq: 0.1, gainVal: 0.008, detune: 50 },
      // Distant birds - high chirps (very subtle)
      { freq: 1800, type: 'sine' as OscillatorType, lfoFreq: 0.3, gainVal: 0.003, detune: 200 },
      // Crickets ambience
      { freq: 3500, type: 'sine' as OscillatorType, lfoFreq: 2, gainVal: 0.002, detune: 100 },
    ];

    layers.forEach(layer => {
      const osc = audioContextRef.current!.createOscillator();
      const gain = audioContextRef.current!.createGain();
      const filter = audioContextRef.current!.createBiquadFilter();

      osc.type = layer.type;
      osc.frequency.value = layer.freq;
      osc.detune.value = Math.random() * layer.detune;

      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.Q.value = 0.5;

      gain.gain.value = layer.gainVal;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current!);

      // LFO for natural variation
      const lfo = audioContextRef.current!.createOscillator();
      const lfoGain = audioContextRef.current!.createGain();
      lfo.frequency.value = layer.lfoFreq;
      lfoGain.gain.value = layer.detune * 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();

      osc.start();
      oscillatorsRef.current.push({ osc, gain, lfo });
    });
  }, []);

  const stopAllSounds = useCallback(() => {
    oscillatorsRef.current.forEach(({ osc, lfo }) => {
      try {
        osc.stop();
        lfo.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
  }, []);

  const startAmbient = useCallback(() => {
    if (!isAudioEnabled) return;
    if (!initAudioContext()) return;
    
    stopAllSounds();
    createLofiNatureSound();
    setIsPlaying(true);
  }, [isAudioEnabled, initAudioContext, stopAllSounds, createLofiNatureSound]);

  const stopAmbient = useCallback(() => {
    stopAllSounds();
    setIsPlaying(false);
  }, [stopAllSounds]);

  const toggleAudio = useCallback(() => {
    if (isAudioEnabled) {
      stopAmbient();
      setIsAudioEnabled(false);
    } else {
      setIsAudioEnabled(true);
      // Don't auto-start, let the Grove/Focus trigger it
    }
  }, [isAudioEnabled, stopAmbient]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVolume / 100 * 0.15;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllSounds]);

  return (
    <AudioStateContext.Provider value={{
      isAudioEnabled,
      isPlaying,
      volume,
      toggleAudio,
      setVolume,
      startAmbient,
      stopAmbient,
    }}>
      {children}
    </AudioStateContext.Provider>
  );
};
