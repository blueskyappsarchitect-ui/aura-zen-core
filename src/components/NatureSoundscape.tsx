import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AuraLevel } from "@/types/aura";

interface NatureSoundscapeProps {
  habitatLevel: AuraLevel;
}

type SoundType = 'birds' | 'wind' | 'water' | 'crickets' | 'fire';

interface SoundConfig {
  label: string;
  emoji: string;
  frequency: number;
  type: OscillatorType;
  detune: number;
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  birds: { label: 'Birds', emoji: '🐦', frequency: 2000, type: 'sine', detune: 400 },
  wind: { label: 'Wind', emoji: '🌬️', frequency: 200, type: 'sawtooth', detune: 50 },
  water: { label: 'Stream', emoji: '💧', frequency: 300, type: 'triangle', detune: 100 },
  crickets: { label: 'Crickets', emoji: '🦗', frequency: 4000, type: 'square', detune: 200 },
  fire: { label: 'Fire', emoji: '🔥', frequency: 150, type: 'sawtooth', detune: 30 },
};

const HABITAT_PRESETS: Record<AuraLevel, SoundType[]> = {
  seedling: ['crickets', 'wind'],
  sprout: ['birds', 'wind', 'water'],
  bloom: ['birds', 'water', 'fire'],
};

const NatureSoundscape = ({ habitatLevel }: NatureSoundscapeProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [activeSounds, setActiveSounds] = useState<SoundType[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<SoundType, { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    // Only create AudioContext on user interaction to comply with browser autoplay policies
    if (!audioContextRef.current && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.connect(audioContextRef.current.destination);
        masterGainRef.current.gain.value = volume / 100 * 0.3;
      } catch (e) {
        // AudioContext creation failed
        return;
      }
    }
    
    // Resume if suspended
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [volume]);

  const createAmbientSound = useCallback((soundType: SoundType) => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const config = SOUNDS[soundType];
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    const filter = audioContextRef.current.createBiquadFilter();

    osc.type = config.type;
    osc.frequency.value = config.frequency;
    osc.detune.value = config.detune;

    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    gain.gain.value = 0.02;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current);

    const lfo = audioContextRef.current.createOscillator();
    const lfoGain = audioContextRef.current.createGain();
    lfo.frequency.value = 0.1 + Math.random() * 0.2;
    lfoGain.gain.value = config.detune * 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    lfo.start();

    osc.start();
    oscillatorsRef.current.set(soundType, { osc, gain, lfo });
  }, []);

  const stopSound = useCallback((soundType: SoundType) => {
    const sound = oscillatorsRef.current.get(soundType);
    if (sound) {
      try {
        sound.osc.stop();
        sound.lfo.stop();
      } catch (e) {}
      oscillatorsRef.current.delete(soundType);
    }
  }, []);

  const toggleSound = useCallback((soundType: SoundType) => {
    if (activeSounds.includes(soundType)) {
      stopSound(soundType);
      setActiveSounds(prev => prev.filter(s => s !== soundType));
    } else {
      createAmbientSound(soundType);
      setActiveSounds(prev => [...prev, soundType]);
    }
  }, [activeSounds, createAmbientSound, stopSound]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      oscillatorsRef.current.forEach((_, soundType) => stopSound(soundType));
      setActiveSounds([]);
      setIsPlaying(false);
    } else {
      initAudio();
      const presetSounds = HABITAT_PRESETS[habitatLevel];
      presetSounds.forEach(sound => createAmbientSound(sound));
      setActiveSounds(presetSounds);
      setIsPlaying(true);
    }
  }, [isPlaying, habitatLevel, initAudio, createAmbientSound, stopSound]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100 * 0.3;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((_, soundType) => stopSound(soundType));
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSound]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-full w-10 h-10 transition-all ${
            isPlaying 
              ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-green-500/30' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'
          }`}
        >
          {isPlaying ? (
            <Trees className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Nature Soundscape</h4>
              <p className="text-xs text-muted-foreground">
                {habitatLevel === 'seedling' && 'Deep Earth 🌍'}
                {habitatLevel === 'sprout' && 'Morning Meadow 🌅'}
                {habitatLevel === 'bloom' && 'Golden Hour ✨'}
              </p>
            </div>
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={togglePlayback}
              className="rounded-full"
            >
              {isPlaying ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Volume</span>
              <span>{volume}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={(v) => setVolume(v[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(SOUNDS) as [SoundType, SoundConfig][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  if (!isPlaying) {
                    initAudio();
                    setIsPlaying(true);
                  }
                  toggleSound(key);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  activeSounds.includes(key)
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="text-lg">{config.emoji}</span>
                <span className="text-xs">{config.label}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground/60">
            Sounds auto-adjust based on your level
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NatureSoundscape;