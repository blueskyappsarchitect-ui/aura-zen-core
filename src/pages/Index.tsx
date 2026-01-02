import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { format, isToday, subDays, isSameDay } from "date-fns";
import Header from "@/components/Header";
import Timeline, { TimelineRef } from "@/components/Timeline";
import AddTaskButton from "@/components/AddTaskButton";
import AddTaskDrawer from "@/components/AddTaskDrawer";
import FocusMode from "@/components/FocusMode";
import AuraDashboard from "@/components/AuraDashboard";
import UpNextCard from "@/components/UpNextCard";
import TransitionBridge from "@/components/TransitionBridge";
import DoneEarlyDialog from "@/components/DoneEarlyDialog";
import AuraResetTimer from "@/components/AuraResetTimer";
import StartNowDialog from "@/components/StartNowDialog";
import MorningBriefing from "@/components/MorningBriefing";
import NorthStar from "@/components/NorthStar";
import WeeklyDayPicker from "@/components/WeeklyDayPicker";
import DeepWorkForecast from "@/components/DeepWorkForecast";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { Task, generateMicroSteps } from "@/types/task";

// Helper to get date key for localStorage
const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

// Check if morning briefing was shown today
const getMorningBriefingKey = () => {
  const today = new Date().toDateString();
  return `aura-morning-briefing-${today}`;
};

const getSavedIntention = (): string => {
  const today = new Date().toDateString();
  const saved = localStorage.getItem(`aura-intention-${today}`);
  return saved || "";
};

// Default example tasks for today
const getDefaultTasks = (): Task[] => [
  {
    id: "1",
    name: "Morning Deep Work",
    category: "study",
    startTime: "09:00",
    duration: 90,
  },
  {
    id: "2",
    name: "Coffee Break",
    category: "rest",
    startTime: "11:00",
    duration: 30,
  },
];

// Load tasks for a specific date from localStorage
const loadTasksForDate = (date: Date): Task[] => {
  const key = `aura-tasks-${getDateKey(date)}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved);
  }
  // Only return default tasks for today if nothing saved
  if (isToday(date)) {
    return getDefaultTasks();
  }
  return [];
};

// Save tasks for a specific date to localStorage
const saveTasksForDate = (date: Date, tasks: Task[]) => {
  const key = `aura-tasks-${getDateKey(date)}`;
  localStorage.setItem(key, JSON.stringify(tasks));
};

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksForDate(new Date()));
  const [timelineFading, setTimelineFading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [poppingTaskId, setPoppingTaskId] = useState<string | null>(null);
  const [goldenPulseTaskId, setGoldenPulseTaskId] = useState<string | null>(null);
  const [auraScore, setAuraScore] = useState(100);
  const [streak] = useState(5);
  const [shouldAnimateScore, setShouldAnimateScore] = useState(false);
  const [doneEarlyTask, setDoneEarlyTask] = useState<Task | null>(null);
  const [showAuraReset, setShowAuraReset] = useState(false);
  const [startNowTask, setStartNowTask] = useState<Task | null>(null);
  const [pendingMoveTaskId, setPendingMoveTaskId] = useState<string | null>(null);
  const [pendingMoveTime, setPendingMoveTime] = useState<string | null>(null);
  const [showMorningBriefing, setShowMorningBriefing] = useState(false);
  const [dailyIntention, setDailyIntention] = useState(getSavedIntention);
  
  const timelineRef = useRef<TimelineRef>(null);
  const timeTheme = useTimeOfDay();

  // Check if we should show morning briefing on first load of the day
  useEffect(() => {
    const briefingKey = getMorningBriefingKey();
    const wasShown = localStorage.getItem(briefingKey);
    if (!wasShown) {
      setShowMorningBriefing(true);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasksForDate(selectedDate, tasks);
  }, [tasks, selectedDate]);

  // Load tasks when selected date changes
  const handleSelectDate = useCallback((date: Date) => {
    setTimelineFading(true);
    setTimeout(() => {
      setSelectedDate(date);
      setTasks(loadTasksForDate(date));
      setTimelineFading(false);
    }, 300);
  }, []);

  // Calculate unfinished tasks from yesterday
  const unfinishedTasksFromYesterday = useMemo(() => {
    const yesterday = subDays(new Date(), 1);
    const yesterdayTasks = loadTasksForDate(yesterday);
    
    return yesterdayTasks.filter((task) => {
      // Task is incomplete if it has subtasks and not all are completed
      if (task.subTasks && task.subTasks.length > 0) {
        return task.subTasks.some((st) => !st.completed);
      }
      // If no subtasks, consider it incomplete
      return true;
    });
  }, []);

  // Handle migrating unfinished tasks to today
  const handleMigrateUnfinished = useCallback(() => {
    if (unfinishedTasksFromYesterday.length === 0) return;

    // Find gaps in today's schedule
    const sortedTasks = [...tasks]
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskStartMinutes = hours * 60 + minutes;
        const taskEndMinutes = taskStartMinutes + task.duration;
        return { ...task, taskStartMinutes, taskEndMinutes };
      })
      .sort((a, b) => a.taskStartMinutes - b.taskStartMinutes);

    // Find gaps and migrate tasks
    const migratedTasks: Task[] = [];
    let currentGapStart = 9 * 60; // Start at 9 AM

    for (const task of unfinishedTasksFromYesterday) {
      // Find a gap that fits this task
      for (let i = 0; i <= sortedTasks.length; i++) {
        const gapEnd = i < sortedTasks.length ? sortedTasks[i].taskStartMinutes : 18 * 60;
        const gapDuration = gapEnd - currentGapStart;

        if (gapDuration >= task.duration) {
          // Place task in this gap
          const hours = Math.floor(currentGapStart / 60);
          const mins = currentGapStart % 60;
          const newStartTime = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

          migratedTasks.push({
            ...task,
            id: `migrated-${Date.now()}-${task.id}`,
            startTime: newStartTime,
            subTasks: task.subTasks?.map((st) => ({ ...st, completed: false })),
          });
          currentGapStart = currentGapStart + task.duration + 15; // Add 15 min buffer
          break;
        }

        if (i < sortedTasks.length) {
          currentGapStart = sortedTasks[i].taskEndMinutes;
        }
      }
    }

    if (migratedTasks.length > 0) {
      setTasks((prev) => [...prev, ...migratedTasks]);
    }
  }, [unfinishedTasksFromYesterday, tasks]);

  const handleMorningBriefingComplete = useCallback((energy: "high" | "medium" | "low" | null, intention: string) => {
    const briefingKey = getMorningBriefingKey();
    localStorage.setItem(briefingKey, "true");
    
    // Save intention for today
    const today = new Date().toDateString();
    localStorage.setItem(`aura-intention-${today}`, intention);
    setDailyIntention(intention);
    
    // Could use energy level to adjust task recommendations in the future
    console.log("Energy level:", energy);
    
    setShowMorningBriefing(false);
  }, []);

  // Calculate completed tasks count
  const { completedCount, totalSubTasks } = useMemo(() => {
    let completed = 0;
    let total = 0;
    tasks.forEach((task) => {
      if (task.subTasks) {
        task.subTasks.forEach((st) => {
          total++;
          if (st.completed) completed++;
        });
      }
    });
    return { completedCount: completed, totalSubTasks: total };
  }, [tasks]);
  const handleAddTask = useCallback((taskData: Omit<Task, "id">) => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskIds((prev) => [...prev, newId]);

    // Remove from "new" list after animation completes
    setTimeout(() => {
      setNewTaskIds((prev) => prev.filter((id) => id !== newId));
    }, 500);
  }, []);

  const handleGenerateSubTasks = useCallback((taskId: string) => {
    // Set loading state
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isGeneratingSubTasks: true } : task
      )
    );

    // Simulate AI thinking for 1.5 seconds
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const subTasks = generateMicroSteps(task.name, task.category);
            return { 
              ...task, 
              isGeneratingSubTasks: false, 
              subTasks 
            };
          }
          return task;
        })
      );
    }, 1500);
  }, []);

  // Play a completion chime sound
  const playChime = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a harmonious chime with multiple frequencies
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
    
    frequencies.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      oscillator.start(audioContext.currentTime + i * 0.05);
      oscillator.stop(audioContext.currentTime + 0.8);
    });
  }, []);

  const handleToggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    let wasCompleting = false;
    let isLastSubTask = false;
    
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subTasks) {
          const targetSubTask = task.subTasks.find((st) => st.id === subTaskId);
          if (targetSubTask && !targetSubTask.completed) {
            wasCompleting = true;
            // Check if this is the last uncompleted subtask
            const uncompletedCount = task.subTasks.filter((st) => !st.completed).length;
            isLastSubTask = uncompletedCount === 1;
          }
          const updatedSubTasks = task.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...task, subTasks: updatedSubTasks };
        }
        return task;
      })
    );

    // Trigger haptic-style pop animation and mini-bounce on score
    if (wasCompleting) {
      if (isLastSubTask) {
        // Trigger golden pulse for final subtask
        setGoldenPulseTaskId(taskId);
        playChime();
        setTimeout(() => setGoldenPulseTaskId(null), 1000);
      } else {
        // Regular pop animation
        setPoppingTaskId(taskId);
        setTimeout(() => setPoppingTaskId(null), 300);
      }
      
      // Increment aura score with animation
      setAuraScore((prev) => prev + 10);
      setShouldAnimateScore(true);
      setTimeout(() => setShouldAnimateScore(false), 100);
    }

    // Also update focusTask if it's the one being modified
    if (focusTask && focusTask.id === taskId) {
      setFocusTask((prev) => {
        if (!prev || !prev.subTasks) return prev;
        return {
          ...prev,
          subTasks: prev.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      });
    }
  }, [focusTask, playChime]);

  const handleStartFocus = useCallback((task: Task) => {
    setFocusTask(task);
  }, []);

  const handleCloseFocus = useCallback(() => {
    setFocusTask(null);
  }, []);

  const handleCompleteTask = useCallback((taskId: string) => {
    // Mark all subtasks as completed
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subTasks) {
          return {
            ...task,
            subTasks: task.subTasks.map((st) => ({ ...st, completed: true })),
          };
        }
        return task;
      })
    );

    // Add to completed list for glow effect
    setCompletedTaskIds((prev) => [...prev, taskId]);

    // Remove glow after animation
    setTimeout(() => {
      setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
    }, 2000);
  }, []);

  const handleScrollToTask = useCallback((taskId: string) => {
    timelineRef.current?.scrollToTask(taskId);
  }, []);

  // Find next task for "Done Early" dialog
  const nextTask = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sortedTasks = [...tasks]
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskMinutes = hours * 60 + minutes;
        return { ...task, taskMinutes };
      })
      .sort((a, b) => a.taskMinutes - b.taskMinutes);

    return sortedTasks.find((task) => task.taskMinutes > currentMinutes) || null;
  }, [tasks]);

  const handleFinishedEarly = useCallback((task: Task) => {
    setDoneEarlyTask(task);
  }, []);

  const handleStartNextTask = useCallback(() => {
    if (nextTask) {
      setDoneEarlyTask(null);
      setFocusTask(nextTask);
    }
  }, [nextTask]);

  const handleTakeBreak = useCallback(() => {
    setDoneEarlyTask(null);
    setShowAuraReset(true);
  }, []);

  const handleBreakComplete = useCallback(() => {
    setShowAuraReset(false);
  }, []);

  // Drag and drop handlers
  const handleTaskMove = useCallback((taskId: string, newStartTime: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, startTime: newStartTime } : task
      )
    );
  }, []);

  const handleTaskResize = useCallback((taskId: string, newDuration: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, duration: newDuration } : task
      )
    );
  }, []);

  const handleStartNowPrompt = useCallback((task: Task) => {
    setStartNowTask(task);
    // Get current time for the move
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = (Math.floor(now.getMinutes() / 15) * 15).toString().padStart(2, "0");
    setPendingMoveTaskId(task.id);
    setPendingMoveTime(`${hours}:${minutes}`);
  }, []);

  const handleStartNowConfirm = useCallback(() => {
    if (startNowTask && pendingMoveTaskId && pendingMoveTime) {
      handleTaskMove(pendingMoveTaskId, pendingMoveTime);
      setFocusTask(startNowTask);
    }
    setStartNowTask(null);
    setPendingMoveTaskId(null);
    setPendingMoveTime(null);
  }, [startNowTask, pendingMoveTaskId, pendingMoveTime, handleTaskMove]);

  const handleStartNowCancel = useCallback(() => {
    if (pendingMoveTaskId && pendingMoveTime) {
      handleTaskMove(pendingMoveTaskId, pendingMoveTime);
    }
    setStartNowTask(null);
    setPendingMoveTaskId(null);
    setPendingMoveTime(null);
  }, [pendingMoveTaskId, pendingMoveTime, handleTaskMove]);

  // Keep focusTask in sync with tasks state
  const currentFocusTask = focusTask 
    ? tasks.find((t) => t.id === focusTask.id) || focusTask 
    : null;

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${timeTheme.gradientClass}`}>
      {/* Morning Briefing Modal */}
      {showMorningBriefing && (
        <MorningBriefing onComplete={handleMorningBriefingComplete} />
      )}

      {/* Fixed Header */}
      <Header />

      {/* Main scrollable content */}
      <main className="pt-24 pb-32 hide-scrollbar">
        {/* Subtle top gradient */}
        <div className="fixed top-16 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

        {/* North Star Intention */}
        {dailyIntention && isToday(selectedDate) && <NorthStar intention={dailyIntention} />}

        {/* Aura Dashboard */}
        <AuraDashboard
          auraScore={auraScore}
          streak={streak}
          completedTasks={completedCount}
          totalTasks={totalSubTasks || tasks.length}
          shouldAnimate={shouldAnimateScore}
        />

        {/* Weekly Day Picker */}
        <WeeklyDayPicker
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          unfinishedCount={unfinishedTasksFromYesterday.length}
          onMigrateUnfinished={handleMigrateUnfinished}
        />

        {/* Deep Work Forecast for future days */}
        <DeepWorkForecast tasks={tasks} selectedDate={selectedDate} />

        {/* The Aura Timeline */}
        <div className={`transition-opacity duration-300 ${timelineFading ? "opacity-0" : "opacity-100"}`}>
          <Timeline 
            ref={timelineRef}
            tasks={tasks} 
            newTaskIds={newTaskIds}
            completedTaskIds={completedTaskIds}
            poppingTaskId={poppingTaskId}
            goldenPulseTaskId={goldenPulseTaskId}
            onGenerateSubTasks={handleGenerateSubTasks}
            onToggleSubTask={handleToggleSubTask}
            onStartFocus={handleStartFocus}
            onFinishedEarly={handleFinishedEarly}
            onTaskMove={handleTaskMove}
            onTaskResize={handleTaskResize}
            onStartNowPrompt={handleStartNowPrompt}
          />
        </div>

        {/* Subtle bottom gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      </main>

      {/* Up Next Nudge Card */}
      <UpNextCard tasks={tasks} onScrollToTask={handleScrollToTask} />

      {/* Floating Add Button */}
      <AddTaskButton onClick={() => setDrawerOpen(true)} />

      {/* Add Task Drawer */}
      <AddTaskDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAddTask={handleAddTask}
      />

      {/* Transition Bridge Alert */}
      <TransitionBridge tasks={tasks} />

      {/* Focus Mode Overlay */}
      {currentFocusTask && (
        <FocusMode
          task={currentFocusTask}
          onClose={handleCloseFocus}
          onComplete={handleCompleteTask}
          onToggleSubTask={handleToggleSubTask}
        />
      )}

      {/* Done Early Dialog */}
      <DoneEarlyDialog
        open={!!doneEarlyTask}
        onOpenChange={(open) => !open && setDoneEarlyTask(null)}
        nextTask={nextTask}
        onStartNextTask={handleStartNextTask}
        onTakeBreak={handleTakeBreak}
      />

      {/* Aura Reset Timer */}
      {showAuraReset && (
        <AuraResetTimer
          onComplete={handleBreakComplete}
          onClose={handleBreakComplete}
        />
      )}

      {/* Start Now Dialog */}
      <StartNowDialog
        open={!!startNowTask}
        onOpenChange={(open) => !open && setStartNowTask(null)}
        task={startNowTask}
        onStartNow={handleStartNowConfirm}
        onCancel={handleStartNowCancel}
      />
    </div>
  );
};

export default Index;
