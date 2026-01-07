import { useMemo } from "react";
import { TrendingUp, Target, Zap, CloudRain } from "lucide-react";
import { getAuraLevel, AURA_LEVELS } from "@/types/aura";
import { cn } from "@/lib/utils";

interface DayStats {
  xpEarned: number;
  tasksCompleted: number;
}

interface AuraForecastProps {
  weeklyData: DayStats[];
  currentAuraScore: number;
  averageTasksPerDay: number;
  sprintAccepted?: boolean;
  onSprintAccept?: () => void;
}

const AuraForecast = ({ 
  weeklyData, 
  currentAuraScore, 
  averageTasksPerDay,
  sprintAccepted = false,
  onSprintAccept 
}: AuraForecastProps) => {
  // Calculate forecast based on last 7 days
  const forecast = useMemo(() => {
    const daysWithXP = weeklyData.filter(d => d.xpEarned > 0);
    if (daysWithXP.length === 0) return null;

    const avgDailyXP = daysWithXP.reduce((sum, d) => sum + d.xpEarned, 0) / daysWithXP.length;
    
    // Find next level
    const nextLevel = AURA_LEVELS.find(l => l.minScore > currentAuraScore);
    if (!nextLevel) return { daysToNext: 0, nextLevelName: "Max Level", avgDailyXP };

    const pointsNeeded = nextLevel.minScore - currentAuraScore;
    const daysToNext = Math.ceil(pointsNeeded / avgDailyXP);

    return {
      daysToNext,
      nextLevelName: nextLevel.name,
      avgDailyXP: Math.round(avgDailyXP),
      pointsNeeded,
    };
  }, [weeklyData, currentAuraScore]);

  // Calculate sprint challenge
  const sprintChallenge = useMemo(() => {
    if (averageTasksPerDay < 1) return null;
    
    // Challenge: 40% more tasks than average, rounded up
    const challengeTarget = Math.ceil(averageTasksPerDay * 1.4);
    const bonusXP = 50;

    return {
      target: Math.max(challengeTarget, Math.round(averageTasksPerDay) + 2),
      bonusXP,
      average: Math.round(averageTasksPerDay),
    };
  }, [averageTasksPerDay]);

  // Check for downward trend (recovery logic)
  const hasDownwardTrend = useMemo(() => {
    if (weeklyData.length < 3) return false;
    
    const recentDays = weeklyData.slice(-3);
    if (recentDays.length < 3) return false;
    
    const trendingDown = recentDays[1]?.xpEarned < recentDays[0]?.xpEarned &&
                         recentDays[2]?.xpEarned < recentDays[1]?.xpEarned;
    
    return trendingDown && recentDays[2]?.xpEarned === 0;
  }, [weeklyData]);

  if (!forecast && !sprintChallenge) return null;

  return (
    <div className="space-y-4">
      {/* Aura Forecast */}
      {forecast && forecast.daysToNext > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-300/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-700">Aura Forecast</span>
          </div>
          <p className="text-sm text-violet-600">
            At your current pace of <span className="font-bold">{forecast.avgDailyXP} XP/day</span>, 
            you'll reach <span className="font-bold">{forecast.nextLevelName}</span> in{" "}
            <span className="font-bold text-violet-700">{forecast.daysToNext} days</span>!
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-violet-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (currentAuraScore / (currentAuraScore + (forecast.pointsNeeded || 1))) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-violet-500">{forecast.pointsNeeded} to go</span>
          </div>
        </div>
      )}

      {/* Sprint Challenge */}
      {sprintChallenge && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-300/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Today's Sprint Challenge</span>
          </div>
          <p className="text-sm text-amber-600 mb-3">
            You usually complete <span className="font-bold">{sprintChallenge.average} tasks</span>. 
            Push yourself! Complete{" "}
            <span className="font-bold text-amber-700">{sprintChallenge.target} tasks</span> today for a{" "}
            <span className="font-bold text-amber-700">+{sprintChallenge.bonusXP} XP bonus</span>!
          </p>
          {!sprintAccepted ? (
            <button
              onClick={onSprintAccept}
              className={cn(
                "w-full py-2 px-4 rounded-xl text-sm font-medium transition-all",
                "bg-gradient-to-r from-amber-400 to-orange-400 text-white",
                "hover:from-amber-500 hover:to-orange-500",
                "shadow-md hover:shadow-lg hover:shadow-amber-500/25"
              )}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Accept Challenge
            </button>
          ) : (
            <div className="w-full py-2 px-4 rounded-xl text-sm font-medium text-center bg-emerald-100 text-emerald-700 border border-emerald-300">
              ✓ Challenge Accepted!
            </div>
          )}
        </div>
      )}

      {/* Recovery Notification */}
      {hasDownwardTrend && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-300/30 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-semibold text-cyan-700">Gentle Rain</span>
          </div>
          <p className="text-sm text-cyan-600">
            🌧️ Your vine is looking a bit dry. A small task today will bring back the sunshine!
          </p>
        </div>
      )}
    </div>
  );
};

export default AuraForecast;
