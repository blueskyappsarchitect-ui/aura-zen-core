import { useState, useRef, useEffect } from "react";
import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

interface AuraWellProps {
  hasWateredToday: boolean;
  onWater: () => void;
  isWithered: boolean;
  hasOverdueTask?: boolean;
}

const AuraWell = ({ hasWateredToday, onWater, isWithered, hasOverdueTask = false }: AuraWellProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isThirstyPulse, setIsThirstyPulse] = useState(false);
  const wellRef = useRef<HTMLButtonElement>(null);
  const { playWaterSplash } = useAudioFeedback();

  // Thirsty pulse effect every 5 seconds when vine is withered or not watered
  useEffect(() => {
    if (hasWateredToday || isAnimating) return;
    
    const interval = setInterval(() => {
      setIsThirstyPulse(true);
      setTimeout(() => setIsThirstyPulse(false), 600);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hasWateredToday, isAnimating]);

  // Determine the button state - overdue task takes priority for visual urgency
  const showOverdueGlow = hasOverdueTask && !hasWateredToday;

  const handleWater = () => {
    if (hasWateredToday || isAnimating) return;

    setIsAnimating(true);
    
    // Play water splash at the peak of the ripple animation (400ms into 800ms animation)
    setTimeout(() => {
      playWaterSplash();
    }, 400);
    
    onWater();

    // Reset animation after it completes
    setTimeout(() => setIsAnimating(false), 1500);
  };

  return (
    <div className="relative">
      {/* Water ripple effect container */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/60 animate-water-ripple"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          {/* Water droplets */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`drop-${i}`}
              className="absolute left-1/2 top-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-water-drop"
              style={{
                animationDelay: `${i * 0.1}s`,
                '--drop-angle': `${i * 45}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* The Well Button */}
      <button
        ref={wellRef}
        onClick={handleWater}
        disabled={hasWateredToday}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
          "shadow-lg",
          hasWateredToday
            ? "bg-gradient-to-br from-slate-300 to-slate-400 cursor-not-allowed opacity-60"
            : showOverdueGlow
            ? "bg-gradient-to-br from-rose-500 to-purple-600 hover:scale-110 cursor-pointer animate-overdue-pulse"
            : isWithered
            ? "bg-gradient-to-br from-amber-600 to-orange-700 animate-well-glow-thirsty hover:scale-110 cursor-pointer"
            : "bg-gradient-to-br from-cyan-400 to-blue-500 animate-well-glow hover:scale-110 cursor-pointer",
          // Thirsty pulse animation - gentle scale bump every 5 seconds
          isThirstyPulse && !hasWateredToday && "scale-110"
        )}
      >
        {/* Inner glow ring */}
        {!hasWateredToday && (
          <div 
            className={cn(
              "absolute inset-1 rounded-full opacity-50",
              showOverdueGlow
                ? "bg-gradient-to-br from-rose-300 to-purple-400 animate-pulse"
                : isWithered
                ? "bg-gradient-to-br from-amber-300 to-orange-400 animate-pulse"
                : "bg-gradient-to-br from-cyan-200 to-blue-300 animate-pulse"
            )}
          />
        )}
        
        {/* Icon */}
        <Droplet 
          className={cn(
            "w-7 h-7 relative z-10 transition-all duration-300",
            hasWateredToday 
              ? "text-slate-500" 
              : isWithered
              ? "text-white"
              : "text-white",
            isAnimating && "animate-bounce"
          )} 
          fill={hasWateredToday ? "transparent" : "currentColor"}
        />

        {/* Sparkle effects when available */}
        {!hasWateredToday && !isAnimating && (
          <>
            <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-sparkle opacity-80" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-2 left-0 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
          </>
        )}
      </button>

      {/* Label */}
      <p className={cn(
        "text-xs font-medium text-center mt-2 transition-colors",
        hasWateredToday 
          ? "text-muted-foreground" 
          : showOverdueGlow 
          ? "text-rose-500" 
          : isWithered 
          ? "text-amber-600" 
          : "text-cyan-600"
      )}>
        {hasWateredToday ? "Watered ✓" : showOverdueGlow ? "Overdue!" : isWithered ? "Thirsty!" : "Water"}
      </p>
    </div>
  );
};

export default AuraWell;
