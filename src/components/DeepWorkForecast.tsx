import { Sparkles, Clock } from "lucide-react";
import { Task } from "@/types/task";

interface DeepWorkForecastProps {
  tasks: Task[];
  selectedDate: Date;
}

const DeepWorkForecast = ({ tasks, selectedDate }: DeepWorkForecastProps) => {
  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const isFuture = selectedDate > new Date();

  // Only show for future days
  if (!isFuture && !isToday) return null;
  if (isToday) return null; // Don't show for today

  // Find the largest gap in the schedule
  const findLargestGap = () => {
    if (tasks.length === 0) {
      return { start: "09:00", duration: 480 }; // 8 hours if no tasks
    }

    const sortedTasks = [...tasks]
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskStartMinutes = hours * 60 + minutes;
        const taskEndMinutes = taskStartMinutes + task.duration;
        return { ...task, taskStartMinutes, taskEndMinutes };
      })
      .sort((a, b) => a.taskStartMinutes - b.taskStartMinutes);

    let largestGap = { start: "09:00", duration: 0 };

    // Check gap from morning start (9 AM) to first task
    const morningStart = 9 * 60;
    if (sortedTasks[0].taskStartMinutes > morningStart) {
      const gap = sortedTasks[0].taskStartMinutes - morningStart;
      if (gap > largestGap.duration) {
        largestGap = { start: "09:00", duration: gap };
      }
    }

    // Check gaps between tasks
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentEnd = sortedTasks[i].taskEndMinutes;
      const nextStart = sortedTasks[i + 1].taskStartMinutes;
      const gap = nextStart - currentEnd;

      if (gap > largestGap.duration) {
        const hours = Math.floor(currentEnd / 60);
        const mins = currentEnd % 60;
        largestGap = {
          start: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
          duration: gap,
        };
      }
    }

    // Check gap from last task to evening (6 PM)
    const eveningEnd = 18 * 60;
    const lastEnd = sortedTasks[sortedTasks.length - 1].taskEndMinutes;
    if (eveningEnd > lastEnd) {
      const gap = eveningEnd - lastEnd;
      if (gap > largestGap.duration) {
        const hours = Math.floor(lastEnd / 60);
        const mins = lastEnd % 60;
        largestGap = {
          start: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
          duration: gap,
        };
      }
    }

    return largestGap;
  };

  const largestGap = findLargestGap();
  const gapHours = Math.floor(largestGap.duration / 60);
  const gapMinutes = largestGap.duration % 60;

  // Only show if gap is at least 1 hour
  if (largestGap.duration < 60) return null;

  const formatDuration = () => {
    if (gapHours >= 2) {
      return `${gapHours}-hour`;
    } else if (gapHours === 1 && gapMinutes >= 30) {
      return "1.5-hour";
    } else {
      return "1-hour";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-4">
      <div className="relative overflow-hidden rounded-xl p-3 border border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm">
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              <span className="text-violet-600 dark:text-violet-400">✨ High Flow Potential:</span>{" "}
              You have a {formatDuration()} opening at {largestGap.start}.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Perfect for a Study or Deep Work block.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepWorkForecast;
