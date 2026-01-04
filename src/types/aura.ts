// Aura Evolution System Types

export type AuraLevel = "seedling" | "sprout" | "bloom";

export interface AuraLevelInfo {
  level: AuraLevel;
  name: string;
  minScore: number;
  maxScore: number;
  icon: "Sprout" | "Leaf" | "Flower2";
}

export const AURA_LEVELS: AuraLevelInfo[] = [
  { level: "seedling", name: "Seedling", minScore: 0, maxScore: 500, icon: "Sprout" },
  { level: "sprout", name: "Sprout", minScore: 501, maxScore: 1500, icon: "Leaf" },
  { level: "bloom", name: "Bloom", minScore: 1501, maxScore: Infinity, icon: "Flower2" },
];

export const getAuraLevel = (score: number): AuraLevelInfo => {
  if (score >= 1501) return AURA_LEVELS[2];
  if (score >= 501) return AURA_LEVELS[1];
  return AURA_LEVELS[0];
};

export const getProgressToNextLevel = (score: number): number => {
  const currentLevel = getAuraLevel(score);
  if (currentLevel.level === "bloom") return 100; // Max level
  
  const levelRange = currentLevel.maxScore - currentLevel.minScore + 1;
  const progressInLevel = score - currentLevel.minScore;
  return Math.min(100, (progressInLevel / levelRange) * 100);
};

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "early_bird",
    name: "The Early Bird",
    description: "Finished a task before 9 AM",
    icon: "🐦",
  },
  {
    id: "focus_titan",
    name: "Focus Titan",
    description: "Completed a 90-minute Shield Mode session",
    icon: "🛡️",
  },
  {
    id: "first_bloom",
    name: "First Bloom",
    description: "Completed your first task",
    icon: "🌸",
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Maintained a 7-day streak",
    icon: "🔥",
  },
  {
    id: "aura_warrior",
    name: "Aura Warrior",
    description: "Reached 1000 Aura points",
    icon: "⚔️",
  },
];
