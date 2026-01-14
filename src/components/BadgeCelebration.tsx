import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AVAILABLE_BADGES } from "@/types/aura";

interface BadgeCelebrationProps {
  open: boolean;
  onClose: () => void;
  badgeId: string;
}

// Badge-specific confetti colors
const BADGE_CONFETTI_COLORS: Record<string, string[]> = {
  botanist: ["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"], // Greens
  community_caretaker: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef08a", "#fef3c7"], // Yellows/Sunny
  data_scientist: ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd", "#bfdbfe"], // Blues/Digital
  early_bird: ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"], // Oranges/Sunrise
  first_bloom: ["#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8", "#fce7f3"], // Pinks/Bloom
  streak_master: ["#ef4444", "#f97316", "#fbbf24", "#dc2626", "#fb923c"], // Fire colors
  aura_warrior: ["#a855f7", "#8b5cf6", "#c084fc", "#d8b4fe", "#f3e8ff"], // Purples/Aura
  consistent_cultivator: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"], // Teals
  lifeguard: ["#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#cffafe"], // Cyans/Water
  focus_titan: ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"], // Indigo/Shield
};

const BadgeCelebration = ({ open, onClose, badgeId }: BadgeCelebrationProps) => {
  const { playBadgeUnlock } = useAudioFeedback();
  
  const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
  const confettiColors = BADGE_CONFETTI_COLORS[badgeId] || ["#fbbf24", "#f59e0b", "#d97706"];

  useEffect(() => {
    if (open && badge) {
      // Play badge-specific sound
      playBadgeUnlock(badgeId);
      
      // Badge-specific confetti burst
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.65 },
          colors: confettiColors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.65 },
          colors: confettiColors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Add a central burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: confettiColors,
        });
      }, 300);
    }
  }, [open, badge, badgeId, confettiColors, playBadgeUnlock]);

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center border-none bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/50 dark:via-yellow-950/50 dark:to-orange-950/50 z-[200]">
        <div className="flex flex-col items-center gap-5 py-6">
          {/* Glowing Badge Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-amber-400/30 rounded-full" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-bounce">
              <span className="text-4xl">{badge.icon}</span>
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Badge Unlocked!
          </DialogTitle>

          {/* Badge Name */}
          <div className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/30">
            {badge.icon} {badge.name}
          </div>

          {/* Description */}
          <DialogDescription className="text-sm text-muted-foreground px-4">
            {badge.description}
          </DialogDescription>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg shadow-amber-500/30"
          >
            Awesome! 🎉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeCelebration;
