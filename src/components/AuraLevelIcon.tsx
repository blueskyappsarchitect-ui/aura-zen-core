import { Sprout, Leaf, Flower2 } from "lucide-react";
import { getAuraLevel, AuraLevelInfo } from "@/types/aura";
import { cn } from "@/lib/utils";

interface AuraLevelIconProps {
  auraScore: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { container: "w-6 h-6 rounded-md", icon: "w-3 h-3" },
  md: { container: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
  lg: { container: "w-16 h-16 rounded-2xl", icon: "w-8 h-8" },
};

const AuraLevelIcon = ({ auraScore, className, showLabel = false, size = "md" }: AuraLevelIconProps) => {
  const level = getAuraLevel(auraScore);
  const sizeStyle = sizeStyles[size];

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
          "flex items-center justify-center transition-all duration-300",
          sizeStyle.container,
          iconStyles[level.level]
        )}
      >
        <IconComponent className={sizeStyle.icon} />
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
