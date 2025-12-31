import { useState, useEffect, useMemo } from "react";
import { Sunrise, Mountain } from "lucide-react";
import { Task, CATEGORY_CONFIG } from "@/types/task";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TransitionBridgeProps {
  tasks: Task[];
  onStartNextTask?: (task: Task) => void;
  onStartBreak?: () => void;
}

interface CurrentTaskInfo {
  task: Task;
  minutesRemaining: number;
  nextTask: Task | null;
}

const TransitionBridge = ({ tasks, onStartNextTask, onStartBreak }: TransitionBridgeProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTaskInfo = useMemo((): CurrentTaskInfo | null => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find current task and next task
    const sortedTasks = [...tasks]
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskStartMinutes = hours * 60 + minutes;
        const taskEndMinutes = taskStartMinutes + task.duration;
        return { ...task, taskStartMinutes, taskEndMinutes };
      })
      .sort((a, b) => a.taskStartMinutes - b.taskStartMinutes);

    const currentTask = sortedTasks.find(
      (task) => task.taskStartMinutes <= currentMinutes && task.taskEndMinutes > currentMinutes
    );

    if (!currentTask) return null;

    const minutesRemaining = currentTask.taskEndMinutes - currentMinutes;
    const nextTaskIndex = sortedTasks.findIndex((t) => t.id === currentTask.id) + 1;
    const nextTask = sortedTasks[nextTaskIndex] || null;

    return { task: currentTask, minutesRemaining, nextTask };
  }, [tasks, currentTime]);

  // Only show when 5 minutes or less remaining
  if (!currentTaskInfo || currentTaskInfo.minutesRemaining > 5) {
    return null;
  }

  const config = CATEGORY_CONFIG[currentTaskInfo.task.category];
  const nextTaskConfig = currentTaskInfo.nextTask 
    ? CATEGORY_CONFIG[currentTaskInfo.nextTask.category] 
    : null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md animate-fade-in">
      <div
        className={cn(
          "rounded-2xl p-4 glass border transition-bridge-card",
          "border-primary/20 shadow-lg"
        )}
      >
        {/* Breathe animation overlay */}
        <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-breathe pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Sunrise className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">
              {currentTaskInfo.minutesRemaining} minute{currentTaskInfo.minutesRemaining !== 1 ? "s" : ""} left
            </p>
            <p className="text-sm font-medium text-foreground">
              Get ready to transition
              {currentTaskInfo.nextTask && (
                <span className={cn("ml-1", nextTaskConfig?.textClass)}>
                  → {currentTaskInfo.nextTask.name}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitionBridge;
