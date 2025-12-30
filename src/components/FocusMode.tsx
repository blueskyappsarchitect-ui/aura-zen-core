import { useState, useEffect, useCallback, useRef } from "react";
import { Minimize2, Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import { Task, TaskCategory, CATEGORY_CONFIG, SubTask } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Category gradient backgrounds for lava lamp effect
const CATEGORY_GRADIENTS: Record<TaskCategory, string> = {
  study: "linear-gradient(-45deg, hsl(262 70% 75%), hsl(262 60% 85%), hsl(280 70% 80%), hsl(262 70% 75%))",
  personal: "linear-gradient(-45deg, hsl(25 90% 80%), hsl(35 85% 85%), hsl(15 85% 78%), hsl(25 90% 80%))",
  rest: "linear-gradient(-45deg, hsl(160 50% 75%), hsl(170 45% 82%), hsl(150 50% 78%), hsl(160 50% 75%))",
};

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
}

const FocusMode = ({ task, onClose, onComplete, onToggleSubTask }: FocusModeProps) => {
  const [timeRemaining, setTimeRemaining] = useState(task.duration * 60); // seconds
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const config = CATEGORY_CONFIG[task.category];

  // Get current active subtask (first uncompleted one)
  const currentSubTask = task.subTasks?.find((st) => !st.completed);
  const completedCount = task.subTasks?.filter((st) => st.completed).length ?? 0;
  const totalSubTasks = task.subTasks?.length ?? 0;

  // Check if all subtasks are completed
  const allSubTasksCompleted = totalSubTasks > 0 && completedCount === totalSubTasks;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress = ((task.duration * 60 - timeRemaining) / (task.duration * 60)) * 100;

  // Play zen bell sound
  const playZenBell = useCallback(() => {
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#a78bfa", "#c4b5fd", "#ddd6fe", "#f5d0fe", "#fae8ff"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#a78bfa", "#c4b5fd", "#ddd6fe", "#f5d0fe", "#fae8ff"],
      });
    }, 250);
  }, []);

  // Handle completion
  const handleComplete = useCallback(() => {
    setShowReward(true);
    fireConfetti();
    playZenBell();

    setTimeout(() => {
      onComplete(task.id);
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 2500);
  }, [fireConfetti, playZenBell, onComplete, task.id, onClose]);

  // Timer countdown
  useEffect(() => {
    // Complete when timer hits zero
    if (timeRemaining <= 0) {
      handleComplete();
      return;
    }

    // Complete when all subtasks are done (but don't stop timer countdown)
    if (allSubTasksCompleted) {
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, allSubTasksCompleted, handleComplete]);

  // Handle minimize
  const handleMinimize = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center p-6",
        "animate-lava-lamp",
        isExiting ? "animate-focus-exit" : "animate-focus-enter"
      )}
      style={{
        background: CATEGORY_GRADIENTS[task.category],
      }}
    >
      {/* Hidden audio element for zen bell */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3"
        preload="auto"
      />

      {/* Sound Toggle - Top Right */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-6 right-6 p-3 rounded-full glass transition-all duration-200 hover:scale-105"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-foreground/70" />
        ) : (
          <Volume2 className="w-5 h-5 text-foreground/70" />
        )}
      </button>

      {/* Current Micro-Step - Top */}
      {currentSubTask && !showReward && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 max-w-md w-full px-6">
          <div className="glass rounded-2xl px-6 py-4 text-center">
            <p className="text-xs uppercase tracking-wider text-foreground/60 mb-1">
              Current Step ({completedCount + 1}/{totalSubTasks})
            </p>
            <p className="text-lg font-medium text-foreground">{currentSubTask.text}</p>
          </div>
        </div>
      )}

      {/* Reward Message */}
      {showReward ? (
        <div className="flex flex-col items-center animate-focus-enter">
          <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-timer-pulse">
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Aura Boosted!</h2>
          <p className="text-xl text-primary font-semibold">+10 Points</p>
        </div>
      ) : (
        <>
          {/* Large Circular Timer */}
          <div className="relative flex items-center justify-center">
            {/* Progress Ring */}
            <svg className="w-64 h-64 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="hsl(var(--foreground) / 0.1)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="hsl(var(--foreground) / 0.8)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-light tracking-tight text-foreground">
                {formatTime(timeRemaining)}
              </span>
              <span className="text-sm text-foreground/60 mt-2">{task.name}</span>
            </div>
          </div>

          {/* Sub-tasks Checklist */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mt-10 glass rounded-2xl p-4 max-w-sm w-full">
              <p className="text-xs uppercase tracking-wider text-foreground/60 mb-3 text-center">
                Micro-Steps
              </p>
              <div className="space-y-3">
                {task.subTasks.map((subTask) => (
                  <div
                    key={subTask.id}
                    className="flex items-center gap-3"
                    onClick={() => onToggleSubTask(task.id, subTask.id)}
                  >
                    <Checkbox
                      checked={subTask.completed}
                      className="border-foreground/40 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                    />
                    <span
                      className={cn(
                        "text-sm text-foreground/80 cursor-pointer transition-all",
                        subTask.completed && "line-through opacity-50"
                      )}
                    >
                      {subTask.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Minimize Button - Bottom */}
      {!showReward && (
        <Button
          variant="ghost"
          onClick={handleMinimize}
          className="absolute bottom-8 glass rounded-full px-6 py-3 text-foreground/70 hover:text-foreground hover:bg-foreground/10"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Minimize Shield
        </Button>
      )}
    </div>
  );
};

export default FocusMode;
