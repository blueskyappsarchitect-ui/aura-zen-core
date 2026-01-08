import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VineSpecies, VINE_SPECIES, isSpeciesUnlocked, getSpeciesInfo } from "@/types/species";

interface VineSpeciesSelectorProps {
  currentSpecies: VineSpecies;
  auraScore: number;
  streak: number;
  onSelectSpecies: (species: VineSpecies) => void;
}

const VineSpeciesSelector = ({
  currentSpecies,
  auraScore,
  streak,
  onSelectSpecies,
}: VineSpeciesSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
        🌱 Vine Species
      </h3>
      <div className="grid gap-2">
        {VINE_SPECIES.map((species) => {
          const unlocked = isSpeciesUnlocked(species.id, auraScore, streak);
          const isSelected = currentSpecies === species.id;

          return (
            <button
              key={species.id}
              onClick={() => unlocked && onSelectSpecies(species.id)}
              disabled={!unlocked}
              className={cn(
                "relative p-3 rounded-xl border-2 text-left transition-all duration-200",
                unlocked
                  ? isSelected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-white/30 bg-white/50 hover:border-primary/50 hover:bg-white/70"
                  : "border-muted/30 bg-muted/20 cursor-not-allowed opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{species.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{species.name}</span>
                    {isSelected && unlocked && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    {!unlocked && (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {species.description}
                  </p>
                  {!unlocked && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      🔒 {species.unlockRequirement}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VineSpeciesSelector;
