import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { format, isToday, subDays } from "date-fns";
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
import EmptyTimelineState from "@/components/EmptyTimelineState";
import GuidedTour, { shouldShowTour } from "@/components/GuidedTour";
import LoadingScreen from "@/components/LoadingScreen";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { Task, generateMicroSteps } from "@/types/task";

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

const Index = () => {
  // Supabase sync hook
  const {
    tasks,
    setTasks,
    auraScore,
    setAuraScore: incrementAuraScore,
    streak,
    selectedDate,
    setSelectedDate,
    isLoading,
    addTask,
    updateTask,
  } = useSupabaseSync();

  const [timelineFading, setTimelineFading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [poppingTaskId, setPoppingTaskId] = useState<string | null>(null);
  const [goldenPulseTaskId, setGoldenPulseTaskId] = useState<string | null>(null);
  const [shouldAnimateScore, setShouldAnimateScore] = useState(false);
  const [doneEarlyTask, setDoneEarlyTask] = useState<Task | null>(null);
  const [showAuraReset, setShowAuraReset] = useState(false);
  const [startNowTask, setStartNowTask] = useState<Task | null>(null);
  const [pendingMoveTaskId, setPendingMoveTaskId] = useState<string | null>(null);
  const [pendingMoveTime, setPendingMoveTime] = useState<string | null>(null);
  const [showMorningBriefing, setShowMorningBriefing] = useState(false);
  const [dailyIntention, setDailyIntention] = useState(getSavedIntention);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  
  const timelineRef = useRef<TimelineRef>(null);
  const timeTheme = useTimeOfDay();

  // Check if we should show morning briefing on first load of the day
  useEffect(() => {
    const briefingKey = getMorningBriefingKey();
    const wasShown = localStorage.getItem(briefingKey);
    if (!wasShown && !isLoading) {
      setShowMorningBriefing(true);
    }
    // Check if we should show guided tour (after adding first task)
    if (shouldShowTour() && tasks.length > 0) {
      setShowGuidedTour(true);
    }
  }, [tasks.length, isLoading]);

  // Load tasks when selected date changes
  const handleSelectDate = useCallback((date: Date) => {
    setTimelineFading(true);
    setTimeout(() => {
      setSelectedDate(date);
      setTimelineFading(false);
    }, 300);
  }, [setSelectedDate]);

  // Calculate unfinished tasks from yesterday (from local storage for migration)
  const unfinishedTasksFromYesterday = useMemo(() => {
    // For migration logic, we use localStorage as a fallback
    const yesterday = subDays(new Date(), 1);
    const key = `aura-tasks-${format(yesterday, "yyyy-MM-dd")}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    
    const yesterdayTasks: Task[] = JSON.parse(saved);
    return yesterdayTasks.filter((task) => {
      if (task.subTasks && task.subTasks.length > 0) {
        return task.subTasks.some((st) => !st.completed);
      }
      return true;
    });
  }, []);

  // Handle migrating unfinished tasks to today
  const handleMigrateUnfinished = useCallback(() => {
    if (unfinishedTasksFromYesterday.length === 0) return;

    const sortedTasks = [...tasks]
      .map((task) => {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const taskStartMinutes = hours * 60 + minutes;
        const taskEndMinutes = taskStartMinutes + task.duration;
        return { ...task, taskStartMinutes, taskEndMinutes };
      })
      .sort((a, b) => a.taskStartMinutes - b.taskStartMinutes);

    let currentGapStart = 9 * 60;

    for (const task of unfinishedTasksFromYesterday) {
      for (let i = 0; i <= sortedTasks.length; i++) {
        const gapEnd = i < sortedTasks.length ? sortedTasks[i].taskStartMinutes : 18 * 60;
        const gapDuration = gapEnd - currentGapStart;

        if (gapDuration >= task.duration) {
          const hours = Math.floor(currentGapStart / 60);
          const mins = currentGapStart % 60;
          const newStartTime = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

          addTask({
            name: task.name,
            category: task.category,
            duration: task.duration,
            startTime: newStartTime,
            subTasks: task.subTasks?.map((st) => ({ ...st, completed: false })),
          });
          currentGapStart = currentGapStart + task.duration + 15;
          break;
        }

        if (i < sortedTasks.length) {
          currentGapStart = sortedTasks[i].taskEndMinutes;
        }
      }
    }
  }, [unfinishedTasksFromYesterday, tasks, addTask]);

  const handleMorningBriefingComplete = useCallback((energy: "high" | "medium" | "low" | null, intention: string) => {
    const briefingKey = getMorningBriefingKey();
    localStorage.setItem(briefingKey, "true");
    
    const today = new Date().toDateString();
    localStorage.setItem(`aura-intention-${today}`, intention);
    setDailyIntention(intention);
    
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

  const handleAddTask = useCallback(async (taskData: Omit<Task, "id">) => {
    const newId = await addTask(taskData);
    if (newId) {
      setNewTaskIds((prev) => [...prev, newId]);
      setTimeout(() => {
        setNewTaskIds((prev) => prev.filter((id) => id !== newId));
      }, 500);
    }
  }, [addTask]);

  const handleGenerateSubTasks = useCallback((taskId: string) => {
    // Set loading state locally
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isGeneratingSubTasks: true } : task
      )
    );

    // Simulate AI thinking for 1.5 seconds
    setTimeout(() => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const subTasks = generateMicroSteps(task.name, task.category);
        updateTask(taskId, { subTasks, isGeneratingSubTasks: false });
      }
    }, 1500);
  }, [tasks, updateTask, setTasks]);

  // Play a completion chime sound
  const playChime = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const frequencies = [523.25, 659.25, 783.99];
    
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
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subTasks) return;

    const targetSubTask = task.subTasks.find((st) => st.id === subTaskId);
    const wasCompleting = targetSubTask && !targetSubTask.completed;
    const uncompletedCount = task.subTasks.filter((st) => !st.completed).length;
    const isLastSubTask = uncompletedCount === 1 && wasCompleting;

    const updatedSubTasks = task.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );

    updateTask(taskId, { subTasks: updatedSubTasks });

    if (wasCompleting) {
      if (isLastSubTask) {
        setGoldenPulseTaskId(taskId);
        playChime();
        setTimeout(() => setGoldenPulseTaskId(null), 1000);
      } else {
        setPoppingTaskId(taskId);
        setTimeout(() => setPoppingTaskId(null), 300);
      }
      
      incrementAuraScore(10);
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
  }, [tasks, focusTask, playChime, updateTask, incrementAuraScore]);

  const handleStartFocus = useCallback((task: Task) => {
    setFocusTask(task);
  }, []);

  const handleCloseFocus = useCallback(() => {
    setFocusTask(null);
  }, []);

  const handleCompleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.subTasks) {
      const completedSubTasks = task.subTasks.map((st) => ({ ...st, completed: true }));
      updateTask(taskId, { subTasks: completedSubTasks });
    }

    setCompletedTaskIds((prev) => [...prev, taskId]);

    setTimeout(() => {
      setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
    }, 2000);
  }, [tasks, updateTask]);

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
    updateTask(taskId, { startTime: newStartTime });
  }, [updateTask]);

  const handleTaskResize = useCallback((taskId: string, newDuration: number) => {
    updateTask(taskId, { duration: newDuration });
  }, [updateTask]);

  const handleStartNowPrompt = useCallback((task: Task) => {
    setStartNowTask(task);
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

  // Show loading screen while fetching data
  if (isLoading) {
    return <LoadingScreen />;
  }

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

        {/* The Aura Timeline or Empty State */}
        <div className={`transition-opacity duration-300 ${timelineFading ? "opacity-0" : "opacity-100"}`}>
          {tasks.length === 0 ? (
            <EmptyTimelineState onAddTask={() => setDrawerOpen(true)} />
          ) : (
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
          )}
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

      {/* Guided Tour for First-Time Users */}
      <GuidedTour
        isActive={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
      />
    </div>
  );
};

export default Index;
