// Vine Species Types

export type VineSpecies = "ivy" | "wisteria" | "golden_pothos";

export interface SpeciesInfo {
  id: VineSpecies;
  name: string;
  description: string;
  unlockRequirement: string;
  colors: {
    stem: string;
    stemVia: string;
    stemTo: string;
    leaf: string;
    tip: string;
    glow: string;
  };
  icon: string;
}

export const VINE_SPECIES: SpeciesInfo[] = [
  {
    id: "ivy",
    name: "Ivy",
    description: "The classic green vine, reliable and evergreen.",
    unlockRequirement: "Default",
    colors: {
      stem: "from-emerald-600",
      stemVia: "via-green-500",
      stemTo: "to-lime-400",
      leaf: "text-emerald-500 dark:text-emerald-400",
      tip: "bg-lime-400",
      glow: "shadow-lime-400/50",
    },
    icon: "🌿",
  },
  {
    id: "wisteria",
    name: "Wisteria",
    description: "A flowing purple vine with hanging flower clusters.",
    unlockRequirement: "Reach Bloom level",
    colors: {
      stem: "from-purple-600",
      stemVia: "via-violet-500",
      stemTo: "to-fuchsia-400",
      leaf: "text-purple-500 dark:text-purple-400",
      tip: "bg-fuchsia-400",
      glow: "shadow-fuchsia-400/50",
    },
    icon: "💜",
  },
  {
    id: "golden_pothos",
    name: "Golden Pothos",
    description: "A variegated vine with yellow-green leaves.",
    unlockRequirement: "Maintain a 14-day streak",
    colors: {
      stem: "from-amber-500",
      stemVia: "via-yellow-400",
      stemTo: "to-lime-300",
      leaf: "text-amber-500 dark:text-amber-400",
      tip: "bg-yellow-400",
      glow: "shadow-yellow-400/50",
    },
    icon: "💛",
  },
];

export const getSpeciesInfo = (species: VineSpecies): SpeciesInfo => {
  return VINE_SPECIES.find((s) => s.id === species) || VINE_SPECIES[0];
};

export const isSpeciesUnlocked = (
  species: VineSpecies,
  auraScore: number,
  streak: number
): boolean => {
  switch (species) {
    case "ivy":
      return true;
    case "wisteria":
      return auraScore >= 1501; // Bloom level
    case "golden_pothos":
      return streak >= 14;
    default:
      return false;
  }
};

// Seasonal types
export type Season = "spring" | "summer" | "autumn" | "winter";

export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
};
