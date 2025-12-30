import { useEffect, useRef, useState } from "react";
import { Sparkles, Flame, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

interface AuraDashboardProps {
  auraScore: number;
  streak: number;
  completedTasks: number;
  totalTasks: number;
  shouldAnimate?: boolean;
}

const AuraDashboard = ({
  auraScore,
  streak,
  completedTasks,
  totalTasks,
  shouldAnimate = false,
}: AuraDashboardProps) => {
  const scoreRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Trigger animation and confetti when score increases
  useEffect(() => {
    if (shouldAnimate && scoreRef.current) {
      setIsAnimating(true);
      
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
    }
  }, [shouldAnimate, auraScore]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-8">
      <div className="aura-dashboard-card relative overflow-hidden rounded-3xl p-6 border border-white/20">
        {/* Background gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-category-study/30 to-category-study/50 backdrop-blur-xl" />
        
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {/* Content */}
        <div className="relative z-10">
          {/* Stats Row */}
          <div className="flex items-center justify-between mb-6">
            {/* Aura Score */}
            <div 
              ref={scoreRef}
              className={`flex items-center gap-3 ${isAnimating ? 'animate-score-bounce' : ''}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Aura Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  ✨ {auraScore}
                </p>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Daily Streak</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  🔥 {streak} Days
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-muted-foreground">Daily Progress</span>
              </div>
              <span className="text-sm font-semibold text-purple-600">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Glow effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                {/* Pulse at the end */}
                {progress > 0 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-purple-400/50 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Daily Vibe Section */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
              Today's Vibe
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {progress === 0 
                ? "Ready to start your day? Your first task awaits. Let's build that momentum! ✨"
                : progress < 50 
                ? "You're warming up nicely! Keep the flow going and watch your Aura grow. 🌟"
                : progress < 100
                ? "You're in a flow state! Most of your deep work is done. Time for a peaceful evening. 🌙"
                : "Amazing! You've completed all your tasks. Your Aura is absolutely radiant today! 🎉"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraDashboard;
