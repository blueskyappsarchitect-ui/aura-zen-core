import { useRef, useState, useEffect, useCallback } from "react";

interface StabilityGuardState {
  isPaused: boolean;
  renderCount: number;
}

/**
 * Anti-loop guard hook that detects rapid re-renders and triggers a stability pause.
 * If more than `threshold` renders occur within `windowMs` milliseconds,
 * it pauses for `pauseDurationMs` to break potential render loops.
 */
export const useStabilityGuard = (
  threshold: number = 3,
  windowMs: number = 1000,
  pauseDurationMs: number = 2000
): StabilityGuardState => {
  const [isPaused, setIsPaused] = useState(false);
  const renderTimestamps = useRef<number[]>([]);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    
    // Add current render timestamp
    renderTimestamps.current.push(now);
    
    // Remove timestamps outside the window
    renderTimestamps.current = renderTimestamps.current.filter(
      (ts) => now - ts < windowMs
    );
    
    // Check if we've exceeded threshold
    if (renderTimestamps.current.length > threshold && !isPaused) {
      console.warn('[StabilityGuard] Rapid re-renders detected, initiating stability pause');
      setIsPaused(true);
      
      // Clear any existing timeout
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      
      // Resume after pause duration
      pauseTimeoutRef.current = setTimeout(() => {
        console.log('[StabilityGuard] Stability pause complete, resuming');
        setIsPaused(false);
        renderTimestamps.current = []; // Reset timestamps
      }, pauseDurationMs);
    }
    
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [threshold, windowMs, pauseDurationMs, isPaused]);

  return {
    isPaused,
    renderCount: renderTimestamps.current.length,
  };
};
