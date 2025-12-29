import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import AddTaskButton from "@/components/AddTaskButton";
import AddTaskDrawer from "@/components/AddTaskDrawer";
import FocusMode from "@/components/FocusMode";
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
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subTasks) {
          const updatedSubTasks = task.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...task, subTasks: updatedSubTasks };
        }
        return task;
      })
    );

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

  // Keep focusTask in sync with tasks state
  const currentFocusTask = focusTask 
    ? tasks.find((t) => t.id === focusTask.id) || focusTask 
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Main scrollable content */}
      <main className="pt-24 pb-32 hide-scrollbar">
        {/* Subtle top gradient */}
        <div className="fixed top-16 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

        {/* The Aura Timeline */}
        <Timeline 
          tasks={tasks} 
          newTaskIds={newTaskIds}
          completedTaskIds={completedTaskIds}
          onGenerateSubTasks={handleGenerateSubTasks}
          onToggleSubTask={handleToggleSubTask}
          onStartFocus={handleStartFocus}
        />

        {/* Subtle bottom gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      </main>

      {/* Floating Add Button */}
      <AddTaskButton onClick={() => setDrawerOpen(true)} />

      {/* Add Task Drawer */}
      <AddTaskDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAddTask={handleAddTask}
      />

      {/* Focus Mode Overlay */}
      {currentFocusTask && (
        <FocusMode
          task={currentFocusTask}
          onClose={handleCloseFocus}
          onComplete={handleCompleteTask}
          onToggleSubTask={handleToggleSubTask}
        />
      )}
    </div>
  );
};

export default Index;
