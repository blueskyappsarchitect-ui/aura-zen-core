import { forwardRef } from "react";
import { Flame, Sparkles } from "lucide-react";
import { getAuraLevel, getProgressToNextLevel, HABITAT_THEMES, getStreakMultiplier, STREAK_THRESHOLD } from "@/types/aura";
import AuraLevelIcon from "@/components/AuraLevelIcon";

interface AuraShareCardProps {
  auraScore: number;
  streak: number;
  completedTasks: number;
  totalTasks: number;
}

const AuraShareCard = forwardRef<HTMLDivElement, AuraShareCardProps>(
  ({ auraScore, streak, completedTasks, totalTasks }, ref) => {
    const level = getAuraLevel(auraScore);
    const progressToNext = getProgressToNextLevel(auraScore);
    const habitat = HABITAT_THEMES[level.level];
    const multiplier = getStreakMultiplier(streak);
    const hasMultiplier = streak >= STREAK_THRESHOLD;
    const isBloom = level.level === "bloom";
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Generate leaf positions
    const leafCount = Math.floor(taskProgress / 15);
    const leaves = Array.from({ length: Math.min(leafCount, 6) }, (_, i) => ({
      id: i,
      position: 12 + i * 14,
      size: 8 + Math.random() * 4,
    }));

    return (
      <div
        ref={ref}
        className="relative w-[340px] h-[420px] rounded-3xl overflow-hidden"
        style={{ background: habitat.gradient }}
      >
        {/* Bloom shimmer effect */}
        {isBloom && (
          <>
            <div className="absolute inset-0 animate-shimmer-sparkle opacity-60" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-sparkle"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Card content */}
        <div className="relative h-full flex flex-col p-6 z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/90" />
              <span className="text-white/90 font-semibold text-sm uppercase tracking-wider">
                Aura Growth
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-white text-xs font-medium">
                🌿 {habitat.name}
              </span>
            </div>
          </div>

          {/* Main Aura Display */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Level Icon */}
            <div className={`mb-4 ${isBloom ? 'animate-bloom-glow' : ''}`}>
              <AuraLevelIcon auraScore={auraScore} size="lg" />
            </div>

            {/* Level Name */}
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">
              {level.name}
            </h2>
            <p className="text-white/70 text-sm mb-4">
              Level {level.level === "seedling" ? 1 : level.level === "sprout" ? 2 : 3}
            </p>

            {/* Aura Score */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-5xl font-bold text-white drop-shadow-lg">
                {auraScore}
              </div>
              <div className="text-white/80 text-lg">Aura</div>
            </div>

            {/* Streak Display */}
            {streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-white font-semibold">{streak} Day Streak</span>
                {hasMultiplier && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold">
                    {multiplier}x
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Growth Vine (simplified for card) */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
                🌱 Growth Vine
              </span>
              <span className="text-white/80 text-xs">
                {Math.round(progressToNext)}% to next level
              </span>
            </div>

            {/* Vine Container */}
            <div className="relative h-5 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
              {/* Main Vine Stem */}
              <div
                className="absolute left-0 top-1/2 h-1.5 bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 rounded-full transform -translate-y-1/2"
                style={{ width: `${taskProgress}%` }}
              />

              {/* Leaves */}
              {leaves.map((leaf) => (
                <div
                  key={leaf.id}
                  className="absolute transform -translate-y-1/2"
                  style={{
                    left: `${leaf.position}%`,
                    top: leaf.id % 2 === 0 ? "25%" : "75%",
                  }}
                >
                  <svg
                    width={leaf.size}
                    height={leaf.size}
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`text-emerald-300 ${
                      leaf.id % 2 === 0 ? "rotate-45" : "-rotate-45"
                    }`}
                  >
                    <path
                      d="M12 3c-1.5 3-3 5.5-3 8.5 0 4 2.5 6.5 6 8.5-2-1-3-3-3-5 0-3 2-5.5 3-8.5C14 4 13 2 12 3z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              ))}

              {/* Growing tip */}
              {taskProgress > 0 && (
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${taskProgress}%` }}
                >
                  <div className="w-2.5 h-2.5 bg-lime-300 rounded-full shadow-lg shadow-lime-400/50" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-white/60 text-xs">
                {completedTasks}/{totalTasks} tasks
              </span>
              <div className="flex gap-2 text-xs">
                <span>🌱</span>
                <span>🌿</span>
                <span>🌸</span>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="mt-4 text-center">
            <span className="text-white/40 text-xs font-medium">
              ✨ Made with Aura
            </span>
          </div>
        </div>
      </div>
    );
  }
);

AuraShareCard.displayName = "AuraShareCard";

export default AuraShareCard;
