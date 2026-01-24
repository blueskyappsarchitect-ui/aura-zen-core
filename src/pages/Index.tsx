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


import WeeklyDayPicker from "@/components/WeeklyDayPicker";
import DeepWorkForecast from "@/components/DeepWorkForecast";
import EmptyTimelineState from "@/components/EmptyTimelineState";
import GuidedTour, { shouldShowTour } from "@/components/GuidedTour";
import LevelUpCelebration from "@/components/LevelUpCelebration";
import BadgeCelebration from "@/components/BadgeCelebration";
import ProfileDrawer from "@/components/ProfileDrawer";
import TabNavigation from "@/components/Grove/TabNavigation";
import GroveTab from "@/components/Grove/GroveTab";
import SeedlingOnboarding from "@/components/SeedlingOnboarding";
import NatureSoundscape from "@/components/NatureSoundscape";
import AdminPanel from "@/components/AdminPanel";
import SuperBloomCelebration from "@/components/SuperBloomCelebration";
import TaskBloomCelebration from "@/components/TaskBloomCelebration";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { useGroveSync } from "@/hooks/useGroveSync";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { Task, generateMicroSteps } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { getAuraLevel } from "@/types/aura";


const Index = () => {
  const { user } = useAuth();
  
  // Supabase sync hook
  const {
    tasks,
    setTasks,
    auraScore,
    setAuraScore: incrementAuraScore,
    streak,
    badges,
    selectedDate,
    setSelectedDate,
    isLoading,
    addTask,
    updateTask,
    unlockBadge,
    levelUpInfo,
    clearLevelUp,
    newlyUnlockedBadge,
    clearNewlyUnlockedBadge,
    hasWateredToday,
    isStreakFrozen,
    isWithered,
    waterVine,
    vineSpecies,
    changeVineSpecies,
    hasGlimmer,
    sunshineNudgesSent,
    incrementSunshineNudges,
    showSuperBloom,
    clearSuperBloom,
    completeOnboarding,
    hasCompletedOnboarding,
    isProfileLoaded,
  } = useSupabaseSync();

  // Grove sync hook
  const { postActivity, incrementGlobalOxygen } = useGroveSync(user?.id || null);

  // Audio feedback hook
  const { playTaskComplete, playWaterSplash, playLevelUp } = useAudioFeedback();

  const [activeTab, setActiveTab] = useState<'my-vine' | 'grove'>('my-vine');
  const [profileOpen, setProfileOpen] = useState(false);

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
  
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [highlightWell, setHighlightWell] = useState(false);
  const [triggerTaskBloom, setTriggerTaskBloom] = useState(false);
  
  const timelineRef = useRef<TimelineRef>(null);
  const timeTheme = useTimeOfDay();
  const habitatLevel = getAuraLevel(auraScore).level;

  // Handle onboarding complete - update database immediately
  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);


  // Check for guided tour separately (after tasks are loaded)
  const guidedTourCheckedRef = useRef(false);
  useEffect(() => {
    if (isProfileLoaded && tasks.length > 0 && !guidedTourCheckedRef.current && hasCompletedOnboarding) {
      guidedTourCheckedRef.current = true;
      if (shouldShowTour()) {
        setShowGuidedTour(true);
      }
    }
  }, [isProfileLoaded, tasks.length, hasCompletedOnboarding]);

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
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isGeneratingSubTasks: true } : task
      )
    );

    setTimeout(() => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const subTasks = generateMicroSteps(task.name, task.category);
        updateTask(taskId, { subTasks, isGeneratingSubTasks: false });
      }
    }, 1500);
  }, [tasks, updateTask, setTasks]);

  const playChime = playTaskComplete;

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
        setTriggerTaskBloom(true);
        setTimeout(() => playChime(), 400);
        setTimeout(() => setGoldenPulseTaskId(null), 1000);
        
        const now = new Date();
        if (now.getHours() < 9) {
          unlockBadge("early_bird");
        }
        
        unlockBadge("first_bloom");
      } else {
        setPoppingTaskId(taskId);
        setTimeout(() => playTaskComplete(), 150);
        setTimeout(() => setPoppingTaskId(null), 300);
      }
      
      incrementAuraScore(10);
      setShouldAnimateScore(true);
      setTimeout(() => setShouldAnimateScore(false), 100);
    }

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
  }, [tasks, focusTask, playChime, playTaskComplete, updateTask, incrementAuraScore, unlockBadge]);

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

  const currentFocusTask = focusTask 
    ? tasks.find((t) => t.id === focusTask.id) || focusTask 
    : null;

  // Show seedling onboarding for new users
  if (isProfileLoaded && !hasCompletedOnboarding) {
    return (
      <SeedlingOnboarding onComplete={handleOnboardingComplete} />
    );
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-1000 ${timeTheme.gradientClass}`}>


      {/* Nature Soundscape Toggle */}
      <div className="fixed top-20 right-4 z-40">
        <NatureSoundscape habitatLevel={habitatLevel} />
      </div>

      {/* Fixed Header */}
      <Header onProfileOpen={() => setProfileOpen(true)} />

      {/* Main scrollable content */}
      <main className="pt-24 pb-32 overflow-y-auto overflow-x-hidden hide-scrollbar w-full max-w-full">
        {activeTab === 'my-vine' ? (
          <>
            {/* Subtle top gradient */}
            <div className="fixed top-16 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />


            {/* Aura Dashboard */}
            <AuraDashboard
              auraScore={auraScore}
              streak={streak}
              completedTasks={completedCount}
              totalTasks={totalSubTasks || tasks.length}
              shouldAnimate={shouldAnimateScore}
              hasWateredToday={hasWateredToday}
              isStreakFrozen={isStreakFrozen}
              isWithered={isWithered}
              onWater={waterVine}
              vineSpecies={vineSpecies}
              hasGlimmer={hasGlimmer}
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
          </>
        ) : (
          <GroveTab
            userId={user?.id || null}
            onXpGain={incrementAuraScore}
            onUnlockBadge={unlockBadge}
            sunshineNudgesSent={sunshineNudgesSent}
            onSunshineSent={incrementSunshineNudges}
          />
        )}
      </main>

      {/* Up Next Nudge Card - only show on My Vine tab */}
      {activeTab === 'my-vine' && <UpNextCard tasks={tasks} onScrollToTask={handleScrollToTask} />}

      {/* Floating Add Button - only show on My Vine tab */}
      {activeTab === 'my-vine' && <AddTaskButton onClick={() => setDrawerOpen(true)} />}

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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

      {/* Level Up Celebration Modal */}
      {levelUpInfo && (
        <LevelUpCelebration
          open={!!levelUpInfo}
          onClose={clearLevelUp}
          newLevel={levelUpInfo}
        />
      )}

      {/* Badge Unlock Celebration Modal */}
      {newlyUnlockedBadge && (
        <BadgeCelebration
          open={!!newlyUnlockedBadge}
          onClose={clearNewlyUnlockedBadge}
          badgeId={newlyUnlockedBadge}
        />
      )}

      {/* Super Bloom Celebration for Admin First Login */}
      <SuperBloomCelebration
        open={showSuperBloom}
        onClose={clearSuperBloom}
      />

      {/* Task Bloom Celebration - flowers & golden particles on task complete */}
      <TaskBloomCelebration
        trigger={triggerTaskBloom}
        onComplete={() => setTriggerTaskBloom(false)}
      />

      {/* Admin Panel (only visible to admins) */}
      <AdminPanel />

      {/* Profile Drawer with Badges */}
      <ProfileDrawer
        open={profileOpen}
        onOpenChange={setProfileOpen}
        auraScore={auraScore}
        streak={streak}
        badges={badges}
        completedTasks={completedCount}
        totalTasks={totalSubTasks || tasks.length}
        isStreakFrozen={isStreakFrozen}
        hasWateredToday={hasWateredToday}
        unlockBadge={unlockBadge}
      />
    </div>
  );
};

export default Index;