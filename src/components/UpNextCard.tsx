import { useMemo, useState, useEffect } from "react";
import { Clock, ChevronUp } from "lucide-react";
import { Task, CATEGORY_CONFIG } from "@/types/task";
import { cn } from "@/lib/utils";

interface UpNextCardProps {
  tasks: Task[];
  onScrollToTask: (taskId: string) => void;
}

const UpNextCard = ({ tasks, onScrollToTask }: UpNextCardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update every minute for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const nextTask = useMemo(() => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Find the next upcoming task
    const upcomingTasks = tasks
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskMinutes = hours * 60 + minutes;
        return { ...task, taskMinutes, minutesUntil: taskMinutes - currentMinutes };
      })
      .filter((task) => task.minutesUntil > 0)
      .sort((a, b) => a.minutesUntil - b.minutesUntil);

    return upcomingTasks[0] || null;
  }, [tasks, currentTime]);

  if (!nextTask) return null;

  const config = CATEGORY_CONFIG[nextTask.category];

  return (
    <button
      onClick={() => onScrollToTask(nextTask.id)}
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-20",
        "flex items-center gap-3 px-5 py-3 rounded-full",
        "glass glass-glow",
        "transition-all duration-300 hover:scale-105",
        "border border-primary/20 shadow-lg",
        "animate-fade-in"
      )}
    >
      {/* Glow pulse effect */}
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow opacity-50" />
      
      <div className="relative flex items-center gap-3">
        {/* Up arrow indicator */}
        <ChevronUp className="w-4 h-4 text-primary animate-bounce" />
        
        {/* Task info */}
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Next Up</span>
          <span className={cn("text-sm font-medium", config.textClass)}>
            {nextTask.name}
          </span>
        </div>
        
        {/* Time until */}
        <div className="flex items-center gap-1 text-primary">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {nextTask.minutesUntil < 60 
              ? `${nextTask.minutesUntil}m`
              : `${Math.floor(nextTask.minutesUntil / 60)}h ${nextTask.minutesUntil % 60}m`
            }
          </span>
        </div>
      </div>
    </button>
  );
};

export default UpNextCard;
