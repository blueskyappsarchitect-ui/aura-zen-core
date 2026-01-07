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
  {
    id: "consistent_cultivator",
    name: "Consistent Cultivator",
    description: "Reached a 7-day activity streak",
    icon: "🌻",
  },
  {
    id: "lifeguard",
    name: "Lifeguard",
    description: "Used Streak Freeze to save a 10+ day streak",
    icon: "🛟",
  },
  {
    id: "data_scientist",
    name: "Data Scientist",
    description: "Viewed Statistics dashboard 5 times in a week",
    icon: "📊",
  },
];

// Streak multiplier logic
export const STREAK_THRESHOLD = 3;
export const STREAK_MULTIPLIER = 1.2;

export const getStreakMultiplier = (streak: number): number => {
  return streak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER : 1;
};

// Habitat gradients based on level
export type HabitatTheme = {
  gradient: string;
  name: string;
};

export const HABITAT_THEMES: Record<AuraLevel, HabitatTheme> = {
  seedling: {
    name: "Deep Earth",
    gradient: "linear-gradient(135deg, hsl(30 40% 25%) 0%, hsl(120 30% 20%) 50%, hsl(80 35% 18%) 100%)",
  },
  sprout: {
    name: "Morning Meadow",
    gradient: "linear-gradient(135deg, hsl(200 60% 85%) 0%, hsl(150 50% 80%) 50%, hsl(120 45% 75%) 100%)",
  },
  bloom: {
    name: "Golden Hour",
    gradient: "linear-gradient(135deg, hsl(35 90% 60%) 0%, hsl(20 80% 55%) 50%, hsl(280 50% 50%) 100%)",
  },
};
