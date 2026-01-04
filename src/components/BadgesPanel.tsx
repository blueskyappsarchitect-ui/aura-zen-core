import { Badge as BadgeType, AVAILABLE_BADGES } from "@/types/aura";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface BadgesPanelProps {
  unlockedBadges: BadgeType[];
}

const BadgesPanel = ({ unlockedBadges }: BadgesPanelProps) => {
  const unlockedIds = new Set(unlockedBadges.map((b) => b.id));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <span className="text-lg">🏅</span> Badges
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {AVAILABLE_BADGES.map((badge) => {
          const isUnlocked = unlockedIds.has(badge.id);
          const unlockedBadge = unlockedBadges.find((b) => b.id === badge.id);

          return (
            <div
              key={badge.id}
              className={cn(
                "relative p-4 rounded-2xl border transition-all duration-300",
                isUnlocked
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800"
                  : "bg-muted/30 border-border/50 opacity-50"
              )}
            >
              {/* Badge Icon */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl",
                  isUnlocked
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
                    : "bg-muted"
                )}
              >
                {isUnlocked ? (
                  badge.icon
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Badge Info */}
              <h4
                className={cn(
                  "font-semibold text-sm mb-1",
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {badge.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {badge.description}
              </p>

              {/* Unlock Date */}
              {isUnlocked && unlockedBadge?.unlockedAt && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Unlocked{" "}
                  {new Date(unlockedBadge.unlockedAt).toLocaleDateString()}
                </p>
              )}

              {/* Locked Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 rounded-2xl bg-background/20 backdrop-blur-[1px]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesPanel;
