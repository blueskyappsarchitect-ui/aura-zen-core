import { useState, useCallback, useRef } from "react";
import { Task } from "@/types/task";

const HOUR_HEIGHT = 80;
const START_HOUR = 6;
const SNAP_INTERVAL = 15; // minutes

interface DragState {
  taskId: string;
  isDragging: boolean;
  isResizing: boolean;
  startY: number;
  initialTop: number;
  initialDuration: number;
  currentTop: number;
  currentDuration: number;
}

interface UseTaskDragOptions {
  tasks: Task[];
  onTaskMove: (taskId: string, newStartTime: string) => void;
  onTaskResize: (taskId: string, newDuration: number) => void;
  onStartNowPrompt: (task: Task) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

// Subtle click sound using Web Audio API
const playSnapSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Silently fail if audio is not supported
  }
};

const positionToTime = (position: number): string => {
  const hoursFromStart = position / HOUR_HEIGHT;
  const totalMinutes = (START_HOUR * 60) + (hoursFromStart * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const timeToPosition = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  const hoursFromStart = hours - START_HOUR + minutes / 60;
  return Math.max(0, hoursFromStart * HOUR_HEIGHT);
};

const snapToInterval = (position: number): number => {
  const minutesPerPixel = 60 / HOUR_HEIGHT;
  const totalMinutes = (position / HOUR_HEIGHT) * 60;
  const snappedMinutes = Math.round(totalMinutes / SNAP_INTERVAL) * SNAP_INTERVAL;
  return (snappedMinutes / 60) * HOUR_HEIGHT;
};

const snapDuration = (duration: number): number => {
  return Math.max(15, Math.round(duration / SNAP_INTERVAL) * SNAP_INTERVAL);
};

export const useTaskDrag = ({
  tasks,
  onTaskMove,
  onTaskResize,
  onStartNowPrompt,
  containerRef,
}: UseTaskDragOptions) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const lastSnappedPosition = useRef<number | null>(null);
  const lastSnappedDuration = useRef<number | null>(null);

  const startDrag = useCallback((
    taskId: string,
    clientY: number,
    currentTop: number,
    duration: number
  ) => {
    setDragState({
      taskId,
      isDragging: true,
      isResizing: false,
      startY: clientY,
      initialTop: currentTop,
      initialDuration: duration,
      currentTop,
      currentDuration: duration,
    });
    lastSnappedPosition.current = currentTop;
  }, []);

  const startResize = useCallback((
    taskId: string,
    clientY: number,
    currentTop: number,
    duration: number
  ) => {
    setDragState({
      taskId,
      isDragging: false,
      isResizing: true,
      startY: clientY,
      initialTop: currentTop,
      initialDuration: duration,
      currentTop,
      currentDuration: duration,
    });
    lastSnappedDuration.current = duration;
  }, []);

  const updateDrag = useCallback((clientY: number) => {
    if (!dragState) return;

    const deltaY = clientY - dragState.startY;

    if (dragState.isDragging) {
      const newTop = Math.max(0, dragState.initialTop + deltaY);
      const snappedTop = snapToInterval(newTop);
      
      // Play sound when snapping to a new position
      if (lastSnappedPosition.current !== snappedTop) {
        playSnapSound();
        lastSnappedPosition.current = snappedTop;
      }

      setDragState((prev) => prev ? { ...prev, currentTop: snappedTop } : null);
    } else if (dragState.isResizing) {
      const durationDelta = (deltaY / HOUR_HEIGHT) * 60;
      const newDuration = Math.max(15, dragState.initialDuration + durationDelta);
      const snappedDuration = snapDuration(newDuration);
      
      // Play sound when snapping to a new duration
      if (lastSnappedDuration.current !== snappedDuration) {
        playSnapSound();
        lastSnappedDuration.current = snappedDuration;
      }

      setDragState((prev) => prev ? { ...prev, currentDuration: snappedDuration } : null);
    }
  }, [dragState]);

  const endDrag = useCallback(() => {
    if (!dragState) return;

    const task = tasks.find((t) => t.id === dragState.taskId);
    if (!task) {
      setDragState(null);
      return;
    }

    if (dragState.isDragging) {
      const newTime = positionToTime(dragState.currentTop);
      
      // Check if moved past current time
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [newHours, newMins] = newTime.split(":").map(Number);
      const newTimeMinutes = newHours * 60 + newMins;
      
      if (newTimeMinutes <= currentMinutes && dragState.currentTop !== dragState.initialTop) {
        onStartNowPrompt(task);
      } else {
        onTaskMove(dragState.taskId, newTime);
      }
    } else if (dragState.isResizing) {
      onTaskResize(dragState.taskId, dragState.currentDuration);
    }

    setDragState(null);
    lastSnappedPosition.current = null;
    lastSnappedDuration.current = null;
  }, [dragState, tasks, onTaskMove, onTaskResize, onStartNowPrompt]);

  const cancelDrag = useCallback(() => {
    setDragState(null);
    lastSnappedPosition.current = null;
    lastSnappedDuration.current = null;
  }, []);

  return {
    dragState,
    startDrag,
    startResize,
    updateDrag,
    endDrag,
    cancelDrag,
    timeToPosition,
  };
};
