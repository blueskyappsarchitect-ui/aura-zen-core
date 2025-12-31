import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestAuraBlockProps {
  startTime: string;
  duration: number;
  topPosition: number;
}

const HOUR_HEIGHT = 80;

const RestAuraBlock = ({ startTime, duration, topPosition }: RestAuraBlockProps) => {
  const height = (duration / 60) * HOUR_HEIGHT;

  return (
    <div
      className="absolute right-0 pl-6"
      style={{
        top: `${topPosition}px`,
        left: "50%",
        width: "calc(50% - 1.5rem)",
        marginLeft: "1.5rem",
        height: `${height}px`,
        zIndex: 4,
      }}
    >
      <div
        className={cn(
          "h-full rounded-xl border-2 border-dashed",
          "border-muted-foreground/30 bg-muted/20",
          "flex flex-col items-center justify-center gap-2",
          "transition-colors duration-200 hover:bg-muted/30"
        )}
      >
        <Mountain className="w-5 h-5 text-muted-foreground/50" />
        <span className="text-xs font-medium text-muted-foreground/60">
          Buffer Time
        </span>
        <span className="text-[10px] text-muted-foreground/40">
          {duration} min
        </span>
      </div>
    </div>
  );
};

export default RestAuraBlock;
