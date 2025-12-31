import { useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import NowIndicator from "./NowIndicator";
import TaskCard from "./TaskCard";
import RestAuraBlock from "./RestAuraBlock";
import { Task } from "@/types/task";

const HOUR_HEIGHT = 80; // pixels per hour
const START_HOUR = 6; // 6 AM
const END_HOUR = 23; // 11 PM

interface TimelineProps {
  tasks: Task[];
  newTaskIds?: string[];
  completedTaskIds?: string[];
  poppingTaskId?: string | null;
  onGenerateSubTasks?: (taskId: string) => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onStartFocus?: (task: Task) => void;
  onFinishedEarly?: (task: Task) => void;
}

export interface TimelineRef {
  scrollToTask: (taskId: string) => void;
}

const Timeline = forwardRef<TimelineRef, TimelineProps>(({ 
  tasks, 
  newTaskIds = [],
  completedTaskIds = [],
  poppingTaskId,
  onGenerateSubTasks,
  onToggleSubTask,
  onStartFocus,
  onFinishedEarly
}, ref) => {
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Expose scrollToTask method to parent
  useImperativeHandle(ref, () => ({
    scrollToTask: (taskId: string) => {
      const taskElement = taskRefs.current[taskId];
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }));

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      slots.push({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
      });
    }
    return slots;
  }, []);

  // Calculate current time position
  const nowPosition = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // If before start or after end, clamp to bounds
    if (currentHour < START_HOUR) return 0;
    if (currentHour > END_HOUR) return (END_HOUR - START_HOUR) * HOUR_HEIGHT;

    const hoursFromStart = currentHour - START_HOUR + currentMinutes / 60;
    return hoursFromStart * HOUR_HEIGHT;
  }, []);

  // Calculate task position from start time
  const getTaskPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const hoursFromStart = hours - START_HOUR + minutes / 60;
    return Math.max(0, hoursFromStart * HOUR_HEIGHT);
  };

  // Find gaps > 15 minutes between tasks for Rest Aura blocks
  const gaps = useMemo(() => {
    const sortedTasks = [...tasks]
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskStartMinutes = hours * 60 + minutes;
        const taskEndMinutes = taskStartMinutes + task.duration;
        return { ...task, taskStartMinutes, taskEndMinutes };
      })
      .sort((a, b) => a.taskStartMinutes - b.taskStartMinutes);

    const gapBlocks: { startTime: string; duration: number; topPosition: number }[] = [];

    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentEnd = sortedTasks[i].taskEndMinutes;
      const nextStart = sortedTasks[i + 1].taskStartMinutes;
      const gapMinutes = nextStart - currentEnd;

      if (gapMinutes > 15) {
        const gapHours = Math.floor(currentEnd / 60);
        const gapMins = currentEnd % 60;
        const startTime = `${gapHours.toString().padStart(2, "0")}:${gapMins.toString().padStart(2, "0")}`;
        const topPosition = getTaskPosition(startTime);
        
        gapBlocks.push({
          startTime,
          duration: gapMinutes,
          topPosition,
        });
      }
    }

    return gapBlocks;
  }, [tasks]);

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="relative w-full max-w-2xl mx-auto px-6">
      {/* Timeline container */}
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {/* The vertical timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-timeline/0 via-timeline to-timeline/0 transform -translate-x-1/2" />

        {/* Time markers */}
        {timeSlots.map((slot, index) => (
          <div
            key={slot.hour}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${index * HOUR_HEIGHT}px` }}
          >
            {/* Time label - left side */}
            <div className="w-1/2 pr-6 text-right">
              <span className="text-xs font-medium text-timeline-marker tracking-wide">
                {slot.label}
              </span>
            </div>

            {/* Center tick mark */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-[1px] bg-timeline" />

            {/* Task area placeholder - right side */}
            <div className="w-1/2 pl-6" />
          </div>
        ))}

        {/* Task Cards */}
        {tasks.map((task) => (
          <div
            key={task.id}
            ref={(el) => { taskRefs.current[task.id] = el; }}
            className="absolute right-0 pl-6"
            style={{
              top: `${getTaskPosition(task.startTime)}px`,
              left: "50%",
              width: "calc(50% - 1.5rem)",
              marginLeft: "1.5rem",
              zIndex: 5,
            }}
          >
            <TaskCard 
              task={task} 
              isNew={newTaskIds.includes(task.id)}
              isCompleted={completedTaskIds.includes(task.id)}
              shouldPop={poppingTaskId === task.id}
              onGenerateSubTasks={onGenerateSubTasks}
              onToggleSubTask={onToggleSubTask}
              onStartFocus={onStartFocus}
              onFinishedEarly={onFinishedEarly}
            />
          </div>
        ))}

        {/* Rest Aura Blocks for gaps > 15 min */}
        {gaps.map((gap, index) => (
          <RestAuraBlock
            key={`gap-${index}`}
            startTime={gap.startTime}
            duration={gap.duration}
            topPosition={gap.topPosition}
          />
        ))}

        {/* The NOW indicator */}
        <NowIndicator topPosition={nowPosition} />
      </div>
    </div>
  );
});

Timeline.displayName = "Timeline";

export default Timeline;
