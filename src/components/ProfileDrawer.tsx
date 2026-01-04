import { Sparkles, Flame, TrendingUp, User } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { getAuraLevel, getProgressToNextLevel, Badge } from "@/types/aura";
import AuraLevelIcon from "@/components/AuraLevelIcon";
import BadgesPanel from "@/components/BadgesPanel";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auraScore: number;
  streak: number;
  badges: Badge[];
}

const ProfileDrawer = ({
  open,
  onOpenChange,
  auraScore,
  streak,
  badges,
}: ProfileDrawerProps) => {
  const { user } = useAuth();
  const level = getAuraLevel(auraScore);
  const progressToNext = getProgressToNextLevel(auraScore);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-4">
          <DrawerTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">Your Profile</p>
              <p className="text-sm text-muted-foreground font-normal">
                {user?.email}
              </p>
            </div>
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Aura Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Aura Score Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase">
                  Aura Score
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {auraScore}
              </p>
            </div>

            {/* Streak Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase">
                  Streak
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {streak} Days
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AuraLevelIcon auraScore={auraScore} />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {level.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {level.level === "seedling" ? 1 : level.level === "sprout" ? 2 : 3}
                  </p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>

            {/* Progress to next level */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress to next level</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <div className="h-2 bg-emerald-200/50 dark:bg-emerald-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              {level.level !== "bloom" && (
                <p className="text-xs text-muted-foreground">
                  {level.maxScore - auraScore + 1} points to{" "}
                  {level.level === "seedling" ? "Sprout" : "Bloom"}
                </p>
              )}
            </div>
          </div>

          {/* Badges Section */}
          <BadgesPanel unlockedBadges={badges} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileDrawer;
