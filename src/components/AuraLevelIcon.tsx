import { Sprout, Leaf, Flower2 } from "lucide-react";
import { getAuraLevel, AuraLevelInfo } from "@/types/aura";
import { cn } from "@/lib/utils";

interface AuraLevelIconProps {
  auraScore: number;
  className?: string;
  showLabel?: boolean;
}

const AuraLevelIcon = ({ auraScore, className, showLabel = false }: AuraLevelIconProps) => {
  const level = getAuraLevel(auraScore);

  const iconStyles: Record<AuraLevelInfo["level"], string> = {
    seedling: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50",
    sprout: "text-green-500 bg-green-100 dark:bg-green-900/50",
    bloom: "text-pink-500 bg-pink-100 dark:bg-pink-900/50",
  };

  const IconComponent = {
    Sprout,
    Leaf,
    Flower2,
  }[level.icon];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
          iconStyles[level.level]
        )}
      >
        <IconComponent className="w-4 h-4" />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {level.name}
        </span>
      )}
    </div>
  );
};

export default AuraLevelIcon;
