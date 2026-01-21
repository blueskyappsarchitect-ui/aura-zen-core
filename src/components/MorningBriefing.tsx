import { useState } from "react";
import { Sun, Battery, Cloud, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EnergyLevel = "high" | "medium" | "low" | null;

interface MorningBriefingProps {
  onComplete: (energy: EnergyLevel, intention: string) => void;
}

const energyOptions = [
  {
    level: "high" as const,
    icon: Battery,
    emoji: "🔋",
    label: "High Energy",
    description: "Ready for deep work",
    aiMessage: "Perfect time for that Deep Work session! You have a 2-hour window at 10 AM. Let's make it count.",
  },
  {
    level: "medium" as const,
    icon: Cloud,
    emoji: "⛅️",
    label: "Medium Energy",
    description: "Steady progress",
    aiMessage: "Great! I've balanced your schedule with focused work and breaks. Steady wins the race.",
  },
  {
    level: "low" as const,
    icon: Flame,
    emoji: "🕯️",
    label: "Low Energy",
    description: "Focus on rest & small wins",
    aiMessage: "I've padded your schedule with extra rest today. Let's keep it light and celebrate small wins.",
  },
];

const MorningBriefing = ({ onComplete }: MorningBriefingProps) => {
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>(null);
  const [intention, setIntention] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const handleStartDay = () => {
    // Immediately call onComplete to close the modal
    onComplete(selectedEnergy, intention);
  };

  const selectedOption = energyOptions.find((o) => o.level === selectedEnergy);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Morning Sun Glow Background - pointer-events-none to not block clicks */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-orange-50/20 to-background dark:from-amber-900/20 dark:via-orange-950/10 dark:to-background pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-amber-300/40 via-orange-200/20 to-transparent dark:from-amber-500/20 dark:via-orange-400/10 blur-3xl animate-pulse-glow pointer-events-none" />

      {/* Glassmorphism Modal - z-20 ensures buttons are above background effects */}
      <div
        className={`relative z-20 w-full max-w-lg mx-4 p-8 rounded-3xl glass shadow-2xl transition-all duration-500 ${
          isExiting ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Greeting */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg shadow-amber-500/30">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Good Morning, Aura
          </h1>
          <p className="text-muted-foreground">Let's set the tone for your day</p>
        </div>

        {/* Energy Selector */}
        {!selectedEnergy && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-center text-foreground font-medium mb-4">
              How is your energy level today?
            </p>
            <div className="grid gap-3">
              {energyOptions.map((option) => (
                <button
                  key={option.level}
                  onClick={() => setSelectedEnergy(option.level)}
                  className="relative z-30 flex items-center gap-4 p-4 rounded-2xl border-2 border-border/50 bg-card/80 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl">{option.emoji}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Game Plan */}
        {selectedEnergy && !intention && selectedOption && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Aura AI</p>
                  <p className="text-foreground">{selectedOption.aiMessage}</p>
                </div>
              </div>
            </div>

            {/* Intention Input */}
            <div className="space-y-3">
              <label className="block text-center text-foreground font-medium">
                One thing I want to feel today is...
              </label>
              <Input
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="e.g., Calm, Proud, Focused"
                className="text-center text-lg h-12 rounded-xl border-2 focus:border-primary"
              />
            </div>

            {/* Start Buttons */}
            <Button
              onClick={handleStartDay}
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-all duration-300"
            >
              {intention.trim() ? "Start My Day ✨" : "Let's Begin →"}
            </Button>

            <button
              onClick={() => setSelectedEnergy(null)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Change energy level
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorningBriefing;
