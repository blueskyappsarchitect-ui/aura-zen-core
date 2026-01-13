import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Heart, Flower2 } from "lucide-react";

interface SuperBloomCelebrationProps {
  open: boolean;
  onClose: () => void;
}

const SuperBloomCelebration = ({ open, onClose }: SuperBloomCelebrationProps) => {
  const { playLevelUp } = useAudioFeedback();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (open) {
      // Play celebratory sound
      playLevelUp();
      
      // Super Bloom confetti - multiple bursts with evolving colors
      const colors = [
        ["#ec4899", "#f472b6", "#a855f7", "#c084fc"], // Pink/Purple
        ["#fbbf24", "#f59e0b", "#ef4444", "#f97316"], // Gold/Orange
        ["#22c55e", "#10b981", "#34d399", "#6ee7b7"], // Green/Teal
        ["#3b82f6", "#8b5cf6", "#ec4899", "#fbbf24"], // Rainbow finale
      ];

      // Phase 1: Side bursts
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.5 },
          colors: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.8,
          scalar: 1.2,
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.5 },
          colors: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.8,
          scalar: 1.2,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Phase 2: Central explosion
      setTimeout(() => {
        setPhase(1);
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { x: 0.5, y: 0.4 },
          colors: colors[3],
          gravity: 0.6,
          scalar: 1.5,
        });
      }, 500);

      // Phase 3: Firework bursts
      setTimeout(() => {
        setPhase(2);
        [0.2, 0.5, 0.8].forEach((x, i) => {
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 100,
              startVelocity: 45,
              origin: { x, y: 0.6 },
              colors: colors[i],
              ticks: 300,
            });
          }, i * 200);
        });
      }, 1500);

      // Phase 4: Final shower
      setTimeout(() => {
        setPhase(3);
        confetti({
          particleCount: 200,
          spread: 180,
          origin: { x: 0.5, y: 0.2 },
          colors: colors[3],
          gravity: 1.2,
          scalar: 1.8,
          ticks: 400,
        });
      }, 2500);
    }
  }, [open, playLevelUp]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center border-none bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-amber-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute top-4 left-4 animate-bounce delay-100">
            <Sparkles className="w-6 h-6 text-pink-400/60" />
          </div>
          <div className="absolute top-8 right-8 animate-bounce delay-300">
            <Flower2 className="w-8 h-8 text-purple-400/60" />
          </div>
          <div className="absolute bottom-12 left-8 animate-bounce delay-500">
            <Heart className="w-5 h-5 text-amber-400/60" />
          </div>
          <div className="absolute bottom-8 right-12 animate-bounce delay-700">
            <Sparkles className="w-7 h-7 text-pink-400/60" />
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6 py-8">
          {/* Crown Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Crown className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 bg-clip-text text-transparent animate-pulse">
            🌸 SUPER BLOOM 🌸
          </DialogTitle>

          {/* Subtitle */}
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 animate-bounce">
            ✨ Founder Access Activated ✨
          </div>

          {/* Description */}
          <DialogDescription className="text-base text-foreground/80 px-6 leading-relaxed">
            Welcome, Aura Evolution Founder! You now have full Admin access to shape the Grove.
            <br /><br />
            <span className="text-sm text-muted-foreground italic">
              "Every great garden begins with a single seed..."
            </span>
          </DialogDescription>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-pink-500">∞</span>
              <span className="text-xs text-muted-foreground">Aura Power</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-500">👑</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-amber-500">🌱</span>
              <span className="text-xs text-muted-foreground">Founder</span>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="mt-4 bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 hover:from-pink-600 hover:via-purple-600 hover:to-amber-600 text-white px-8 py-3 rounded-full shadow-2xl shadow-purple-500/40 text-lg font-bold"
          >
            Enter the Grove 🌿
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperBloomCelebration;
