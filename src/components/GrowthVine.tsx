import { useMemo, useEffect, useState } from "react";
import { getAuraLevel, getProgressToNextLevel } from "@/types/aura";

interface GrowthVineProps {
  auraScore: number;
  completedTasks: number;
  totalTasks: number;
  isPulsing?: boolean;
}

const GrowthVine = ({ auraScore, completedTasks, totalTasks, isPulsing = false }: GrowthVineProps) => {
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const levelProgress = getProgressToNextLevel(auraScore);
  const currentLevel = getAuraLevel(auraScore);
  const [showPulse, setShowPulse] = useState(false);

  // Trigger pulse animation when isPulsing changes to true
  useEffect(() => {
    if (isPulsing) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isPulsing, auraScore]);

  // Generate leaf positions based on progress
  const leaves = useMemo(() => {
    const leafCount = Math.floor(taskProgress / 15); // One leaf every 15%
    return Array.from({ length: Math.min(leafCount, 6) }, (_, i) => ({
      id: i,
      position: 12 + i * 14, // Distribute leaves along the vine
      delay: i * 0.1,
      size: 8 + Math.random() * 4,
    }));
  }, [taskProgress]);

  return (
    <div className="mb-6">
      {/* Level Progress Label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            🌱 Growth Vine
          </span>
          <span className="text-xs text-muted-foreground">
            Level: {currentLevel.name}
          </span>
        </div>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {Math.round(levelProgress)}% to next level
        </span>
      </div>

      {/* Vine Container */}
      <div 
        className={`relative h-6 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-full overflow-hidden border border-emerald-200/50 dark:border-emerald-800/50 transition-all duration-300 ${
          showPulse ? 'animate-vine-pulse' : ''
        }`}
      >
        {/* Main Vine Stem */}
        <div
          className={`absolute left-0 top-1/2 h-1 bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400 rounded-full transition-all duration-1000 ease-out transform -translate-y-1/2 ${
            showPulse ? 'animate-vine-glow' : ''
          }`}
          style={{ width: `${taskProgress}%` }}
        >
          {/* Vine glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Animated Leaves */}
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            className="absolute transform -translate-y-1/2 animate-leaf-grow"
            style={{
              left: `${leaf.position}%`,
              top: leaf.id % 2 === 0 ? "25%" : "75%",
              animationDelay: `${leaf.delay}s`,
            }}
          >
            <svg
              width={leaf.size}
              height={leaf.size}
              viewBox="0 0 24 24"
              fill="none"
              className={`text-emerald-500 dark:text-emerald-400 ${
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

        {/* Growing tip with pulse */}
        {taskProgress > 0 && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
            style={{ left: `${taskProgress}%` }}
          >
            <div className="w-3 h-3 bg-lime-400 rounded-full shadow-lg shadow-lime-400/50 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-lime-300 rounded-full animate-ping opacity-75" />
          </div>
        )}

        {/* Level markers */}
        <div className="absolute left-[33%] top-0 bottom-0 w-px bg-emerald-300/50 dark:bg-emerald-700/50" />
        <div className="absolute left-[66%] top-0 bottom-0 w-px bg-emerald-300/50 dark:bg-emerald-700/50" />
      </div>

      {/* Task Progress */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {completedTasks}/{totalTasks} tasks completed
        </span>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>🌱</span>
          <span>🌿</span>
          <span>🌸</span>
        </div>
      </div>
    </div>
  );
};

export default GrowthVine;
