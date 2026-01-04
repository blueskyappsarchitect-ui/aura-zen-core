import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Sprout, Leaf, Flower2 } from "lucide-react";
import { AuraLevelInfo } from "@/types/aura";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LevelUpCelebrationProps {
  open: boolean;
  onClose: () => void;
  newLevel: AuraLevelInfo;
}

const LevelUpCelebration = ({ open, onClose, newLevel }: LevelUpCelebrationProps) => {
  useEffect(() => {
    if (open) {
      // Golden confetti burst
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#fcd34d", "#fef3c7"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#fcd34d", "#fef3c7"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [open]);

  const IconComponent = {
    Sprout,
    Leaf,
    Flower2,
  }[newLevel.icon];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center border-none bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/50 dark:via-yellow-950/50 dark:to-orange-950/50">
        <div className="flex flex-col items-center gap-6 py-8">
          {/* Glowing Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-amber-400/30 rounded-full" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-level-up-glow">
              <IconComponent className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Your Aura is Growing!
          </DialogTitle>

          {/* Description */}
          <DialogDescription className="text-lg text-muted-foreground">
            You've reached{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {newLevel.name}
            </span>{" "}
            level!
          </DialogDescription>

          {/* Level Badge */}
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-lg shadow-lg shadow-amber-500/30">
            ✨ Level {newLevel.level === "seedling" ? 1 : newLevel.level === "sprout" ? 2 : 3}: {newLevel.name}
          </div>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-full shadow-lg shadow-amber-500/30"
          >
            Continue Growing 🌱
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpCelebration;
