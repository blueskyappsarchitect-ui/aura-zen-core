import { useState, useEffect } from "react";
import { BookOpen, User, Coffee, WandSparkles, ChevronDown, Shield } from "lucide-react";
import { Task, CATEGORY_CONFIG } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
  isCompleted?: boolean;
  shouldPop?: boolean;
  onGenerateSubTasks?: (taskId: string) => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onStartFocus?: (task: Task) => void;
  onFinishedEarly?: (task: Task) => void;
}

const TaskCard = ({ 
  task, 
  isNew = false,
  isCompleted = false,
  shouldPop = false,
  onGenerateSubTasks,
  onToggleSubTask,
  onStartFocus,
  onFinishedEarly
}: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const config = CATEGORY_CONFIG[task.category];
  const Icon = iconMap[config.icon as keyof typeof iconMap];
  
  // Trigger pop animation when shouldPop changes
  useEffect(() => {
    if (shouldPop) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldPop]);
  
  // Calculate height based on duration
  const baseHeightPx = (task.duration / 60) * HOUR_HEIGHT;
  const minHeight = 48;
  const baseHeight = Math.max(baseHeightPx, minHeight);

  // Expanded height includes subtasks + focus button
  const subtaskHeight = task.subTasks?.length ? (task.subTasks.length * 36) + 60 : 0;
  const expandedHeight = baseHeight + subtaskHeight;

  const handleWandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.subTasks?.length && !task.isGeneratingSubTasks) {
      onGenerateSubTasks?.(task.id);
    }
  };

  const handleCardClick = () => {
    if (task.subTasks?.length) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSubTaskToggle = (subTaskId: string) => {
    onToggleSubTask?.(task.id, subTaskId);
  };

  const handleStartFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartFocus?.(task);
  };

  const handleFinishedEarly = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFinishedEarly?.(task);
  };

  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2 shadow-soft transition-all duration-300 cursor-pointer overflow-hidden",
        config.bgClass,
        isNew && "animate-task-enter",
        isExpanded && "ring-2 ring-primary/20",
        isCompleted && "task-completed-glow",
        isPopping && "animate-card-pop"
      )}
      style={{ 
        height: isExpanded ? `${expandedHeight}px` : `${baseHeight}px`,
        minHeight: `${minHeight}px`
      }}
      onClick={handleCardClick}
    >
      {/* Header Row */}
      <div className="flex items-start gap-2">
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

        {/* Magic Wand + Expand indicator */}
        <div className="flex items-center gap-1 shrink-0">
          {task.subTasks?.length ? (
            <ChevronDown 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                config.textClass,
                isExpanded && "rotate-180"
              )} 
            />
          ) : null}
          <button
            onClick={handleWandClick}
            disabled={task.isGeneratingSubTasks}
            className={cn(
              "p-1 rounded-md transition-all duration-200 wand-glow",
              config.textClass,
              "hover:bg-primary/10",
              task.isGeneratingSubTasks && "opacity-50 cursor-wait"
            )}
            title="Generate micro-steps with AI"
          >
            <WandSparkles className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Loading Shimmer */}
      {task.isGeneratingSubTasks && (
        <div className="mt-3 space-y-2">
          <div className="h-4 rounded-md animate-shimmer" />
          <div className="h-4 rounded-md animate-shimmer w-4/5" style={{ animationDelay: '0.2s' }} />
          <div className="h-4 rounded-md animate-shimmer w-3/5" style={{ animationDelay: '0.4s' }} />
        </div>
      )}

      {/* Micro-Steps Section */}
      {isExpanded && task.subTasks?.length ? (
        <div className="mt-3 pt-2 border-t border-foreground/10">
          <div className="space-y-2">
            {task.subTasks.map((subTask, index) => (
              <div
                key={subTask.id}
                className="flex items-center gap-2 animate-subtask-enter"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id={subTask.id}
                  checked={subTask.completed}
                  onCheckedChange={() => handleSubTaskToggle(subTask.id)}
                  className={cn(
                    "border-current",
                    config.textClass
                  )}
                />
                <label
                  htmlFor={subTask.id}
                  className={cn(
                    "text-xs cursor-pointer transition-all duration-200",
                    config.textClass,
                    subTask.completed && "subtask-completed"
                  )}
                >
                  {subTask.text}
                </label>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleFinishedEarly}
              size="sm"
              variant="outline"
              className={cn(
                "flex-1 border-muted-foreground/20",
                config.textClass
              )}
            >
              I'm Finished Early
            </Button>
            <Button
              onClick={handleStartFocus}
              size="sm"
              className={cn(
                "flex-1 glass border-0",
                "bg-foreground/10 hover:bg-foreground/20",
                config.textClass
              )}
            >
              <Shield className="w-4 h-4 mr-2" />
              Start Focus
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TaskCard;
