import { useCallback, useRef } from "react";

// EMERGENCY: Global audio mute flag - set to true to silence all audio during stabilization
declare global {
  interface Window {
    isFlickering?: boolean;
  }
}

// Set emergency mute for 5 minutes from first load
if (typeof window !== 'undefined' && window.isFlickering === undefined) {
  window.isFlickering = true;
  console.log('[Emergency] Audio muted for 5 minutes');
  setTimeout(() => {
    window.isFlickering = false;
    console.log('[Emergency] Audio unmuted');
  }, 5 * 60 * 1000);
}

export const useAudioFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    // EMERGENCY: Check global mute flag
    if (window.isFlickering) {
      return null;
    }
    
    // Only create AudioContext when called (on user interaction) to comply with browser autoplay policies
    if (!audioContextRef.current && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        // AudioContext creation failed, likely due to browser restrictions
        return null;
      }
    }
    
    // Resume if suspended (happens when created before user gesture)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  // Light click sound for task completion
  const playTaskComplete = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return; // Fail silently if no audio context
    const now = ctx.currentTime;

    // Create a pleasant chime with harmonics
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.05);
      osc.stop(now + 1);
    });
  }, [getAudioContext]);

  // Water splash sound for watering the vine
  const playWaterSplash = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return; // Fail silently if no audio context
    const now = ctx.currentTime;

    // Create noise for splash effect
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate pink noise for water effect
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for water-like sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);

    // Add water drop "plop" sound
    const drop = ctx.createOscillator();
    const dropGain = ctx.createGain();
    
    drop.type = 'sine';
    drop.frequency.setValueAtTime(600, now + 0.05);
    drop.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    
    dropGain.gain.setValueAtTime(0, now);
    dropGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    drop.connect(dropGain);
    dropGain.connect(ctx.destination);
    
    drop.start(now);
    drop.stop(now + 0.3);
  }, [getAudioContext]);

  // Soft click for button interactions
  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return; // Fail silently if no audio context
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 800;

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }, [getAudioContext]);

  // Level up fanfare
  const playLevelUp = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return; // Fail silently if no audio context
    const now = ctx.currentTime;

    const notes = [
      { freq: 392, time: 0 },      // G4
      { freq: 523.25, time: 0.1 }, // C5
      { freq: 659.25, time: 0.2 }, // E5
      { freq: 783.99, time: 0.3 }, // G5
      { freq: 1046.5, time: 0.5 }, // C6
    ];

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.15, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.5);
    });
  }, [getAudioContext]);

  // Sunshine send sound
  const playSunshine = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return; // Fail silently if no audio context
    const now = ctx.currentTime;

    // Warm, rising tones
    const notes = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.08 },
      { freq: 659.25, time: 0.16 },
    ];

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.1, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.4);
    });
  }, [getAudioContext]);

  // Badge unlock sound - unique per badge type
  const playBadgeUnlock = useCallback((badgeId: string) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Define badge-specific sound characteristics
    const badgeSounds: Record<string, { notes: number[]; type: OscillatorType }> = {
      botanist: { notes: [392, 493.88, 587.33, 783.99], type: 'sine' }, // G4, B4, D5, G5 (nature chord)
      community_caretaker: { notes: [440, 554.37, 659.25, 880], type: 'triangle' }, // A4, C#5, E5, A5 (warm)
      data_scientist: { notes: [523.25, 622.25, 783.99, 932.33], type: 'square' }, // C5, Eb5, G5, Bb5 (digital)
      early_bird: { notes: [659.25, 783.99, 987.77, 1174.66], type: 'sine' }, // E5, G5, B5, D6 (bright)
      first_bloom: { notes: [392, 440, 523.25, 659.25], type: 'sine' }, // G4, A4, C5, E5 (gentle)
      streak_master: { notes: [329.63, 415.30, 523.25, 659.25, 783.99], type: 'sawtooth' }, // Power chord
      aura_warrior: { notes: [261.63, 329.63, 392, 523.25, 659.25], type: 'sine' }, // Epic arpeggio
      consistent_cultivator: { notes: [440, 523.25, 659.25, 783.99], type: 'triangle' }, // Harmonious
      lifeguard: { notes: [523.25, 587.33, 659.25, 783.99, 880], type: 'sine' }, // Triumphant
    };

    const sound = badgeSounds[badgeId] || { notes: [523.25, 659.25, 783.99, 1046.5], type: 'sine' as OscillatorType };

    sound.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = sound.type;
      osc.frequency.value = freq;
      
      const time = i * 0.08;
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.12, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + time);
      osc.stop(now + time + 0.5);
    });
  }, [getAudioContext]);

  return {
    playTaskComplete,
    playWaterSplash,
    playClick,
    playLevelUp,
    playSunshine,
    playBadgeUnlock,
  };
};