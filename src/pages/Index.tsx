import { useState, useCallback, useMemo, useRef } from "react";
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
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { Task, generateMicroSteps } from "@/types/task";

// Default example tasks
const defaultTasks: Task[] = [
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

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [poppingTaskId, setPoppingTaskId] = useState<string | null>(null);
  const [auraScore, setAuraScore] = useState(100);
  const [streak] = useState(5);
  const [shouldAnimateScore, setShouldAnimateScore] = useState(false);
  const [doneEarlyTask, setDoneEarlyTask] = useState<Task | null>(null);
  const [showAuraReset, setShowAuraReset] = useState(false);
  
  const timelineRef = useRef<TimelineRef>(null);
  const timeTheme = useTimeOfDay();

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
            const subTasks = generateMicroSteps(task.name);
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

  const handleToggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    let wasCompleting = false;
    
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subTasks) {
          const targetSubTask = task.subTasks.find((st) => st.id === subTaskId);
          if (targetSubTask && !targetSubTask.completed) {
            wasCompleting = true;
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
      // Pop the task card
      setPoppingTaskId(taskId);
      setTimeout(() => setPoppingTaskId(null), 300);
      
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
  }, [focusTask]);

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

  // Keep focusTask in sync with tasks state
  const currentFocusTask = focusTask 
    ? tasks.find((t) => t.id === focusTask.id) || focusTask 
    : null;

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${timeTheme.gradientClass}`}>
      {/* Fixed Header */}
      <Header />

      {/* Main scrollable content */}
      <main className="pt-24 pb-32 hide-scrollbar">
        {/* Subtle top gradient */}
        <div className="fixed top-16 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

        {/* Aura Dashboard */}
        <AuraDashboard
          auraScore={auraScore}
          streak={streak}
          completedTasks={completedCount}
          totalTasks={totalSubTasks || tasks.length}
          shouldAnimate={shouldAnimateScore}
        />

        {/* The Aura Timeline */}
        <Timeline 
          ref={timelineRef}
          tasks={tasks} 
          newTaskIds={newTaskIds}
          completedTaskIds={completedTaskIds}
          poppingTaskId={poppingTaskId}
          onGenerateSubTasks={handleGenerateSubTasks}
          onToggleSubTask={handleToggleSubTask}
          onStartFocus={handleStartFocus}
          onFinishedEarly={handleFinishedEarly}
        />

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
    </div>
  );
};

export default Index;
