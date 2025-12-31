import { useState, useEffect, useCallback } from "react";
import { Mountain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuraResetTimerProps {
  onComplete: () => void;
  onClose: () => void;
}

const AuraResetTimer = ({ onComplete, onClose }: AuraResetTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((5 * 60 - timeRemaining) / (5 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-focus-enter">
      {/* Calming gradient background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(220 30% 25%) 0%,
            hsl(240 25% 20%) 50%,
            hsl(260 30% 25%) 100%
          )`,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 z-10">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Mountain icon with glow */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-blue-400/30 rounded-full scale-150" />
          <Mountain className="w-24 h-24 text-blue-200 relative animate-breathe" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-light text-white/90 mb-2">Aura Reset</h2>
          <p className="text-white/50 text-sm">Breathe and recharge</p>
        </div>

        {/* Timer display */}
        <div className="relative">
          {/* Circular progress */}
          <svg className="w-40 h-40 -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="text-blue-400 transition-all duration-1000"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)}
            />
          </svg>

          {/* Time text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-light text-white tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Skip button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-white/40 hover:text-white/70 hover:bg-white/5"
        >
          Skip Break
        </Button>
      </div>
    </div>
  );
};

export default AuraResetTimer;
