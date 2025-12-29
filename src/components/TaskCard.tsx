import { BookOpen, User, Coffee } from "lucide-react";
import { Task, TaskCategory, CATEGORY_CONFIG } from "@/types/task";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 80; // Must match Timeline

const iconMap = {
  BookOpen,
  User,
  Coffee,
};

interface TaskCardProps {
  task: Task;
  isNew?: boolean;
}

const TaskCard = ({ task, isNew = false }: TaskCardProps) => {
  const config = CATEGORY_CONFIG[task.category];
  const Icon = iconMap[config.icon as keyof typeof iconMap];
  
  // Calculate height based on duration
  const heightPx = (task.duration / 60) * HOUR_HEIGHT;
  const minHeight = 48; // Minimum readable height
  const finalHeight = Math.max(heightPx, minHeight);

  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2 flex items-start gap-2 shadow-soft transition-all duration-200 hover:scale-[1.02] cursor-pointer",
        config.bgClass,
        isNew && "animate-task-enter"
      )}
      style={{ height: `${finalHeight}px` }}
    >
      {/* Category Icon */}
      <div className={cn("mt-0.5 shrink-0", config.textClass)}>
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className={cn("text-sm font-medium leading-tight truncate", config.textClass)}>
          {task.name}
        </p>
        <p className={cn("text-xs mt-0.5 opacity-70", config.textClass)}>
          {task.duration} min
        </p>
      </div>
    </div>
  );
};

export default TaskCard;
