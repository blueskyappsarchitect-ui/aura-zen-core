import { useMemo } from "react";
import NowIndicator from "./NowIndicator";
import TaskCard from "./TaskCard";
import { Task } from "@/types/task";

const HOUR_HEIGHT = 80; // pixels per hour
const START_HOUR = 6; // 6 AM
const END_HOUR = 23; // 11 PM

interface TimelineProps {
  tasks: Task[];
  newTaskIds?: string[];
  completedTaskIds?: string[];
  onGenerateSubTasks?: (taskId: string) => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onStartFocus?: (task: Task) => void;
}

const Timeline = ({ 
  tasks, 
  newTaskIds = [],
  completedTaskIds = [],
  onGenerateSubTasks,
  onToggleSubTask,
  onStartFocus
}: TimelineProps) => {
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
              onGenerateSubTasks={onGenerateSubTasks}
              onToggleSubTask={onToggleSubTask}
              onStartFocus={onStartFocus}
            />
          </div>
        ))}

        {/* The NOW indicator */}
        <NowIndicator topPosition={nowPosition} />
      </div>
    </div>
  );
};

export default Timeline;
