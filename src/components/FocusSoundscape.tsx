import { useState, useEffect, useRef, useCallback } from "react";
import { Music, X, Headphones, CloudRain, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { TaskCategory } from "@/types/task";

interface SoundPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  // Using royalty-free audio sources
  audioUrl: string;
}

const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "lofi",
    name: "Lofi Beats",
    icon: <Headphones className="w-5 h-5" />,
    description: "Steady, rhythmic study",
    audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-01.mp3", // Placeholder - will use Web Audio API
  },
  {
    id: "rain",
    name: "Rainy Cafe",
    icon: <CloudRain className="w-5 h-5" />,
    description: "Creative writing",
    audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.mp3",
  },
  {
    id: "brown",
    name: "Brown Noise",
    icon: <Waves className="w-5 h-5" />,
    description: "Maximum focus",
    audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-03.mp3",
  },
];

// Category colors for visualizer
const CATEGORY_COLORS: Record<TaskCategory, string> = {
  study: "hsl(262, 70%, 65%)",
  personal: "hsl(25, 90%, 65%)",
  rest: "hsl(160, 50%, 55%)",
};

interface FocusSoundscapeProps {
  category: TaskCategory;
  isTimerComplete: boolean;
  onFadeComplete?: () => void;
}

const FocusSoundscape = ({ category, isTimerComplete, onFadeComplete }: FocusSoundscapeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(32).fill(0));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  // Create audio context and nodes
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  // Generate brown noise
  const createBrownNoise = useCallback((ctx: AudioContext, duration: number = 3600) => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Normalize
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  // Generate rain-like sound
  const createRainSound = useCallback((ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        // Create rain-like pitter-patter with varying intensity
        const noise = Math.random() * 2 - 1;
        const envelope = Math.sin((i / bufferSize) * Math.PI * 20) * 0.5 + 0.5;
        data[i] = noise * 0.3 * envelope * (Math.random() > 0.98 ? 2 : 1);
      }
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  // Generate lofi-style beat
  const createLofiBeats = useCallback((ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      const bpm = 70;
      const samplesPerBeat = (60 / bpm) * ctx.sampleRate;
      
      for (let i = 0; i < bufferSize; i++) {
        const beatPhase = (i % samplesPerBeat) / samplesPerBeat;
        // Low-pass filtered noise with beat
        const kick = beatPhase < 0.1 ? Math.sin(beatPhase * 100) * (1 - beatPhase * 10) : 0;
        const hihat = (i % (samplesPerBeat / 2)) < 100 ? (Math.random() * 2 - 1) * 0.2 : 0;
        const ambientNoise = (Math.random() * 2 - 1) * 0.05;
        
        data[i] = kick * 0.4 + hihat * 0.15 + ambientNoise;
      }
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  // Start playing a preset
  const playPreset = useCallback((presetId: string) => {
    const ctx = initAudio();
    
    // Stop current sound
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }
    
    let source: AudioBufferSourceNode;
    
    switch (presetId) {
      case "lofi":
        source = createLofiBeats(ctx);
        break;
      case "rain":
        source = createRainSound(ctx);
        break;
      case "brown":
        source = createBrownNoise(ctx);
        break;
      default:
        return;
    }
    
    source.connect(gainNodeRef.current!);
    gainNodeRef.current!.gain.value = volume;
    source.start();
    sourceNodeRef.current = source;
    setActivePreset(presetId);
  }, [initAudio, createBrownNoise, createRainSound, createLofiBeats, volume]);

  // Stop playing
  const stopSound = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setActivePreset(null);
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && !isFadingOut) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume, isFadingOut]);

  // Fade out when timer completes
  useEffect(() => {
    if (isTimerComplete && activePreset && gainNodeRef.current) {
      setIsFadingOut(true);
      const startVolume = gainNodeRef.current.gain.value;
      const fadeDuration = 3000; // 3 seconds
      const startTime = Date.now();
      
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / fadeDuration, 1);
        const newVolume = startVolume * (1 - progress);
        
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = newVolume;
        }
        
        if (progress >= 1) {
          clearInterval(fadeInterval);
          stopSound();
          setIsFadingOut(false);
          onFadeComplete?.();
        }
      }, 50);
      
      return () => clearInterval(fadeInterval);
    }
  }, [isTimerComplete, activePreset, stopSound, onFadeComplete]);

  // Audio visualizer animation
  useEffect(() => {
    if (!activePreset || !analyserRef.current) {
      setAnalyserData(new Array(32).fill(0));
      return;
    }
    
    const updateVisualizer = () => {
      if (!analyserRef.current) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Normalize and smooth data
      const normalized = Array.from(dataArray.slice(0, 32)).map((v) => v / 255);
      setAnalyserData(normalized);
      
      animationRef.current = requestAnimationFrame(updateVisualizer);
    };
    
    updateVisualizer();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [activePreset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSound]);

  return (
    <>
      {/* Music Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "absolute bottom-8 left-6 p-3 rounded-full glass transition-all duration-200 hover:scale-105",
          activePreset && "ring-2 ring-primary/50 animate-pulse"
        )}
      >
        <Music className="w-5 h-5 text-foreground/70" />
      </button>

      {/* Soundscape Menu */}
      {isOpen && (
        <div className="absolute bottom-20 left-6 glass rounded-2xl p-4 min-w-[240px] animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground/80">Focus Soundscape</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-foreground/10 transition-colors"
            >
              <X className="w-4 h-4 text-foreground/60" />
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-2 mb-4">
            {SOUND_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => activePreset === preset.id ? stopSound() : playPreset(preset.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  activePreset === preset.id
                    ? "bg-foreground/20 ring-2 ring-foreground/30"
                    : "bg-foreground/5 hover:bg-foreground/10"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  activePreset === preset.id ? "bg-foreground/20" : "bg-foreground/10"
                )}>
                  {preset.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-foreground">{preset.name}</p>
                  <p className="text-xs text-foreground/60">{preset.description}</p>
                </div>
                {activePreset === preset.id && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="pt-3 border-t border-foreground/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-foreground/60 uppercase tracking-wider">Vol</span>
              <Slider
                value={[volume * 100]}
                onValueChange={(val) => setVolume(val[0] / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-foreground/60 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Audio Visualizer - Bottom of screen */}
      {activePreset && (
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-center gap-[2px] px-4 pb-2 overflow-hidden">
          {analyserData.map((value, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, value * 24)}px`,
                backgroundColor: CATEGORY_COLORS[category],
                opacity: 0.6 + value * 0.4,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default FocusSoundscape;
