import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemePreset = "zen" | "midnight" | "forest";
export type SoundProfile = "zen-bell" | "birdsong" | "digital-beep";

interface Settings {
  theme: ThemePreset;
  highContrast: boolean;
  reducedMotion: boolean;
  soundProfile: SoundProfile;
}

interface SettingsContextType {
  settings: Settings;
  setTheme: (theme: ThemePreset) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setSoundProfile: (profile: SoundProfile) => void;
  playSound: (profile?: SoundProfile) => void;
}

const defaultSettings: Settings = {
  theme: "zen",
  highContrast: false,
  reducedMotion: false,
  soundProfile: "zen-bell",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

// Sound URLs (using Web Audio API for simple sounds)
const createZenBell = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 2);
};

const createBirdsong = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
  oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.4);
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
};

const createDigitalBeep = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.type = "square";
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("aura-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem("aura-settings", JSON.stringify(settings));
  }, [settings]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  // Apply high contrast class
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
  }, [settings.highContrast]);

  // Apply reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", settings.reducedMotion);
  }, [settings.reducedMotion]);

  const setTheme = (theme: ThemePreset) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setHighContrast = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast: enabled }));
  };

  const setReducedMotion = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion: enabled }));
  };

  const setSoundProfile = (profile: SoundProfile) => {
    setSettings((prev) => ({ ...prev, soundProfile: profile }));
  };

  const playSound = (profile?: SoundProfile) => {
    const soundToPlay = profile || settings.soundProfile;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    switch (soundToPlay) {
      case "zen-bell":
        createZenBell(audioContext);
        break;
      case "birdsong":
        createBirdsong(audioContext);
        break;
      case "digital-beep":
        createDigitalBeep(audioContext);
        break;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setTheme,
        setHighContrast,
        setReducedMotion,
        setSoundProfile,
        playSound,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
