import { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, User, Coffee, WandSparkles, ChevronDown, Shield, GripVertical } from "lucide-react";
import { Task, CATEGORY_CONFIG } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 80;

const iconMap = {
  BookOpen,
  User,
  Coffee,
};

interface DraggableTaskCardProps {
  task: Task;
  isNew?: boolean;
  isCompleted?: boolean;
  shouldPop?: boolean;
  shouldGoldenPulse?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  dragTop?: number;
  dragDuration?: number;
  onGenerateSubTasks?: (taskId: string) => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onStartFocus?: (task: Task) => void;
  onFinishedEarly?: (task: Task) => void;
  onDragStart?: (clientY: number) => void;
  onResizeStart?: (clientY: number) => void;
}

const DraggableTaskCard = ({ 
  task, 
  isNew = false,
  isCompleted = false,
  shouldPop = false,
  shouldGoldenPulse = false,
  isDragging = false,
  isResizing = false,
  dragTop,
  dragDuration,
  onGenerateSubTasks,
  onToggleSubTask,
  onStartFocus,
  onFinishedEarly,
  onDragStart,
  onResizeStart,
}: DraggableTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [isGoldenPulsing, setIsGoldenPulsing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = CATEGORY_CONFIG[task.category];
  const Icon = iconMap[config.icon as keyof typeof iconMap];
  
  const displayDuration = dragDuration ?? task.duration;
  
  useEffect(() => {
    if (shouldPop) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldPop]);

  useEffect(() => {
    if (shouldGoldenPulse) {
      setIsGoldenPulsing(true);
      const timer = setTimeout(() => setIsGoldenPulsing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldGoldenPulse]);
  
  const baseHeightPx = (displayDuration / 60) * HOUR_HEIGHT;
  const minHeight = 48;
  const baseHeight = Math.max(baseHeightPx, minHeight);

  const subtaskHeight = task.subTasks?.length ? (task.subTasks.length * 36) + 60 : 0;
  const expandedHeight = baseHeight + subtaskHeight;

  const handleWandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.subTasks?.length && !task.isGeneratingSubTasks) {
      onGenerateSubTasks?.(task.id);
    }
  };

  const handleCardClick = () => {
    if (task.subTasks?.length && !isDragging) {
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

  // Long press for drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
    
    const clientY = e.clientY;
    longPressTimer.current = setTimeout(() => {
      onDragStart?.(clientY);
    }, 200);
  }, [onDragStart]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Resize handle
  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    onResizeStart?.(e.clientY);
  }, [onResizeStart]);

  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2 shadow-soft transition-all cursor-pointer overflow-hidden select-none",
        config.bgClass,
        isNew && "animate-task-enter",
        isExpanded && "ring-2 ring-primary/20",
        isCompleted && "task-completed-glow",
        isPopping && "animate-card-pop",
        isGoldenPulsing && "animate-golden-pulse",
        isDragging && "opacity-80 shadow-2xl scale-[1.02] z-50",
        isResizing && "ring-2 ring-primary/40"
      )}
      style={{ 
        height: isExpanded ? `${expandedHeight}px` : `${baseHeight}px`,
        minHeight: `${minHeight}px`,
        transition: isDragging || isResizing ? "none" : "all 0.3s ease",
      }}
      onClick={handleCardClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Header Row */}
      <div className="flex items-start gap-2">
        {/* Drag indicator */}
        <div className={cn("mt-0.5 shrink-0 opacity-40", config.textClass)}>
          <GripVertical className="w-3 h-3" />
        </div>
        
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
            {displayDuration} min
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

      {/* Resize Handle */}
      <div 
        className={cn(
          "resize-handle absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize",
          "flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",
          (isDragging || isResizing) && "opacity-100"
        )}
        onPointerDown={handleResizePointerDown}
      >
        <div className={cn("w-8 h-1 rounded-full", config.bgClass, "opacity-60")} />
      </div>
    </div>
  );
};

export default DraggableTaskCard;
