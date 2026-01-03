import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyTimelineStateProps {
  onAddTask: () => void;
}

const EmptyTimelineState = ({ onAddTask }: EmptyTimelineStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
      {/* Glowing Orb Illustration */}
      <div className="relative mb-8">
        {/* Outer glow rings */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <div className="absolute inset-2 w-28 h-28 rounded-full bg-primary/20 blur-xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        
        {/* Main orb */}
        <div className="relative w-32 h-32 rounded-full glass glass-glow flex items-center justify-center overflow-hidden">
          {/* Inner gradient */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
          
          {/* Floating particles */}
          <div className="absolute w-2 h-2 rounded-full bg-primary/60 animate-float" style={{ top: "20%", left: "30%" }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-primary/40 animate-float" style={{ top: "60%", left: "60%", animationDelay: "1s" }} />
          <div className="absolute w-1 h-1 rounded-full bg-primary/50 animate-float" style={{ top: "40%", left: "70%", animationDelay: "0.5s" }} />
          
          {/* Center sparkle */}
          <Sparkles className="w-10 h-10 text-primary/80 animate-pulse" />
        </div>
      </div>

      {/* Welcome Text */}
      <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
        Your Aura Timeline Awaits
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-[280px] mb-8">
        Plant your first task and watch your focus garden grow throughout the day.
      </p>

      {/* CTA Button */}
      <Button
        onClick={onAddTask}
        size="lg"
        className={cn(
          "h-14 px-8 rounded-2xl",
          "bg-primary hover:bg-primary/90",
          "text-primary-foreground font-semibold text-base",
          "shadow-glow transition-all duration-300",
          "hover:scale-105 active:scale-95"
        )}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Plant Your First Task
      </Button>
    </div>
  );
};

export default EmptyTimelineState;
