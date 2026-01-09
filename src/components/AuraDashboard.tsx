import { useEffect, useRef, useState } from "react";
import { Sparkles, Flame, Snowflake } from "lucide-react";
import confetti from "canvas-confetti";
import AuraLevelIcon from "@/components/AuraLevelIcon";
import GrowthVine from "@/components/GrowthVine";
import AuraWell from "@/components/AuraWell";
import { getStreakMultiplier, STREAK_THRESHOLD } from "@/types/aura";
import { VineSpecies } from "@/types/species";

interface AuraDashboardProps {
  auraScore: number;
  streak: number;
  completedTasks: number;
  totalTasks: number;
  shouldAnimate?: boolean;
  hasWateredToday: boolean;
  isStreakFrozen: boolean;
  isWithered: boolean;
  onWater: () => void;
  vineSpecies: VineSpecies;
  hasGlimmer: boolean;
}

const AuraDashboard = ({
  auraScore,
  streak,
  completedTasks,
  totalTasks,
  shouldAnimate = false,
  hasWateredToday,
  isStreakFrozen,
  isWithered,
  onWater,
  vineSpecies,
  hasGlimmer,
}: AuraDashboardProps) => {
  const scoreRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const multiplier = getStreakMultiplier(streak);
  const hasMultiplier = streak >= STREAK_THRESHOLD;

  // Trigger animation and confetti when score increases
  useEffect(() => {
    if (shouldAnimate && scoreRef.current) {
      setIsAnimating(true);
      setIsPulsing(true);
      
      // Get the position of the score element for confetti
      const rect = scoreRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Fire confetti near the score
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: ["#c4b5fd", "#a78bfa", "#8b5cf6", "#fcd34d", "#fbbf24"],
        ticks: 100,
        gravity: 1.2,
        scalar: 0.8,
      });

      // Reset animation state
      setTimeout(() => setIsAnimating(false), 600);
      setTimeout(() => setIsPulsing(false), 800);
    }
  }, [shouldAnimate, auraScore]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-8">
      <div 
        className={`aura-dashboard-card relative overflow-hidden rounded-3xl p-6 border border-white/20 transition-all duration-500 ${
          isWithered ? 'grayscale-[50%]' : ''
        }`}
      >
        {/* Background gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-category-study/30 to-category-study/50 backdrop-blur-xl" />
        
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {/* Content */}
        <div className="relative z-10">
          {/* Stats Row */}
          <div className="flex items-center justify-between mb-6">
            {/* Aura Score with Level Icon */}
            <div 
              ref={scoreRef}
              data-tour="aura-score"
              className={`flex items-center gap-3 ${isAnimating ? 'animate-score-bounce' : ''}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                  Aura Score
                  <AuraLevelIcon auraScore={auraScore} showLabel />
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    ✨ {auraScore}
                  </p>
                  {hasMultiplier && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold animate-pulse">
                      🔥 {multiplier}x
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Aura Well */}
            <AuraWell 
              hasWateredToday={hasWateredToday}
              onWater={onWater}
              isWithered={isWithered}
            />

            {/* Streak */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isStreakFrozen 
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/30' 
                  : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/30'
              }`}>
                {isStreakFrozen ? (
                  <Snowflake className="w-7 h-7 text-white" />
                ) : (
                  <Flame className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                  {isStreakFrozen ? 'Streak Frozen' : 'Daily Streak'}
                </p>
                <p className={`text-3xl font-bold bg-clip-text text-transparent ${
                  isStreakFrozen 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}>
                  {isStreakFrozen ? '❄️' : '🔥'} {streak} Days
                </p>
              </div>
            </div>
          </div>

          {/* Growth Vine Progress Bar */}
          <GrowthVine
            auraScore={auraScore}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            isPulsing={isPulsing}
            isWithered={isWithered}
            species={vineSpecies}
            hasGlimmer={hasGlimmer}
          />

          {/* Aura Insight Section */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
              Aura Insight
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isWithered 
                ? "Your vine is thirsty! Tap the Aura Well to water it and restore vibrance. 💧"
                : auraScore < 50 
                ? "Great start! Let's pick one small thing to do next. Every step counts. ✨"
                : auraScore < 150 
                ? "You're in the flow! Keep that momentum going—your Aura is growing beautifully. 🌟"
                : auraScore < 500
                ? "Seedling stage mastered! Keep nurturing your growth. 🌱"
                : auraScore < 1500
                ? "Your Sprout is flourishing! You're building amazing habits. 🌿"
                : "Aura Legend status! You've reached Bloom—your dedication is inspiring. 🌸"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraDashboard;
