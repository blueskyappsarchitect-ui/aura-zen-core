import { useState, useEffect, useCallback, useRef } from "react";
import { format, differenceInHours, isToday, parseISO, addHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Task, TaskCategory, SubTask } from "@/types/task";
import { useSettings, ThemePreset } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { Badge, getAuraLevel, AuraLevelInfo, getStreakMultiplier } from "@/types/aura";
import { VineSpecies } from "@/types/species";

interface UserProfile {
  aura_score: number;
  daily_streak: number;
  current_theme: string;
  badges: Badge[];
  last_watered_date: string | null;
  streak_frozen: boolean;
  last_active_date: string | null;
  vine_species: VineSpecies;
  glimmer_until: string | null;
  has_completed_onboarding: boolean;
}

// Convert database task to app Task format
const dbToTask = (dbTask: {
  id: string;
  title: string;
  duration: number;
  category: string;
  subtasks: unknown;
  start_time: string;
  is_completed: boolean;
}): Task => ({
  id: dbTask.id,
  name: dbTask.title,
  duration: dbTask.duration,
  category: dbTask.category as TaskCategory,
  subTasks: (dbTask.subtasks as SubTask[]) || [],
  startTime: dbTask.start_time,
});

// Convert app Task to database format
const taskToDb = (task: Task, userId: string, date: Date) => ({
  id: task.id,
  user_id: userId,
  title: task.name,
  duration: task.duration,
  category: task.category,
  subtasks: task.subTasks || [],
  start_time: task.startTime,
  is_completed: task.subTasks?.every((st) => st.completed) ?? false,
  task_date: format(date, "yyyy-MM-dd"),
});

export const useSupabaseSync = () => {
  const { user } = useAuth();
  const { settings, setTheme } = useSettings();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [auraScore, setAuraScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<AuraLevelInfo | null>(null);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<string | null>(null);
  const previousLevelRef = useRef<AuraLevelInfo | null>(null);
  
  // New state for watering and wither
  const [hasWateredToday, setHasWateredToday] = useState(false);
  const [isStreakFrozen, setIsStreakFrozen] = useState(false);
  const [isWithered, setIsWithered] = useState(false);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  
  // Species and glimmer state
  const [vineSpecies, setVineSpecies] = useState<VineSpecies>("ivy");
  const [hasGlimmer, setHasGlimmer] = useState(false);
  const [sunshineNudgesSent, setSunshineNudgesSent] = useState(0);
  
  // Super Bloom celebration for admins
  const [showSuperBloom, setShowSuperBloom] = useState(false);
  
  // Track onboarding status from database
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // Default true to prevent flash
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setAuraScore(data.aura_score);
      setStreak(data.daily_streak);
      setBadges((data.badges as unknown as Badge[]) || []);
      previousLevelRef.current = getAuraLevel(data.aura_score);
      setLastActiveDate(data.last_active_date);
      setIsStreakFrozen(data.streak_frozen || false);
      setVineSpecies((data.vine_species as VineSpecies) || "ivy");
      setSunshineNudgesSent(data.sunshine_nudges_sent || 0);
      setHasCompletedOnboarding(data.has_completed_onboarding ?? false);
      
      // Check if glimmer is active
      if (data.glimmer_until) {
        const glimmerEnd = parseISO(data.glimmer_until);
        setHasGlimmer(new Date() < glimmerEnd);
      }
      
      // Check if watered today
      if (data.last_watered_date) {
        const wateredDate = parseISO(data.last_watered_date);
        setHasWateredToday(isToday(wateredDate));
      }
      
      // Check for wither state (no activity for 24+ hours)
      if (data.last_active_date) {
        const lastActive = parseISO(data.last_active_date);
        const hoursSinceActive = differenceInHours(new Date(), lastActive);
        setIsWithered(hoursSinceActive >= 24 && !isToday(lastActive));
      }
      
      if (data.current_theme) {
        setTheme(data.current_theme as ThemePreset);
      }
      
      setIsProfileLoaded(true);
    } else {
      // Create profile if it doesn't exist - new user needs onboarding
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          aura_score: 0,
          daily_streak: 0,
          current_theme: settings.theme,
          badges: [],
          has_completed_onboarding: false,
        });
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
      }
      previousLevelRef.current = getAuraLevel(0);
      setHasCompletedOnboarding(false);
      setIsProfileLoaded(true);
    }
  }, [user, settings.theme, setTheme]);

  // Load tasks for selected date
  const loadTasks = useCallback(async () => {
    if (!user) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", dateStr)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading tasks:", error);
      return;
    }

    setTasks(data ? data.map(dbToTask) : []);
  }, [user, selectedDate]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      await Promise.all([loadProfile(), loadTasks()]);
      setIsLoading(false);
    };

    initialize();
  }, [user, loadProfile, loadTasks]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Reload tasks on any change
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadTasks]);

  // Sync theme to database when it changes
  useEffect(() => {
    if (!user || isLoading) return;

    const syncTheme = async () => {
      await supabase
        .from("user_profiles")
        .update({ current_theme: settings.theme })
        .eq("user_id", user.id);
    };

    syncTheme();
  }, [user, settings.theme, isLoading]);

  // Add task
  const addTask = useCallback(async (taskData: Omit<Task, "id">) => {
    if (!user) return;

    const newId = `task-${Date.now()}`;
    const newTask: Task = { ...taskData, id: newId };

    // Optimistic update
    setTasks((prev) => [...prev, newTask]);

    const dbData = taskToDb(newTask, user.id, selectedDate);
    const { error } = await supabase
      .from("tasks")
      .insert({
        user_id: dbData.user_id,
        title: dbData.title,
        duration: dbData.duration,
        category: dbData.category,
        subtasks: JSON.parse(JSON.stringify(dbData.subtasks)) as Json,
        start_time: dbData.start_time,
        is_completed: dbData.is_completed,
        task_date: dbData.task_date,
      });

    if (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Sync failed",
        description: "Could not save task. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update
      setTasks((prev) => prev.filter((t) => t.id !== newId));
    }

    return newId;
  }, [user, selectedDate, toast]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, ...updates };
    
    const { error } = await supabase
      .from("tasks")
      .update({
        title: updatedTask.name,
        duration: updatedTask.duration,
        category: updatedTask.category,
        subtasks: JSON.parse(JSON.stringify(updatedTask.subTasks || [])) as Json,
        start_time: updatedTask.startTime,
        is_completed: updatedTask.subTasks?.every((st) => st.completed) ?? false,
      })
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating task:", error);
      // Revert on error
      loadTasks();
    }
  }, [user, tasks, loadTasks]);

  // Unlock a badge
  const unlockBadge = useCallback(async (badgeId: string) => {
    if (!user) return;
    
    // Check if already unlocked
    if (badges.some((b) => b.id === badgeId)) return;

    const newBadge: Badge = {
      id: badgeId,
      name: badgeId,
      description: "",
      icon: "",
      unlockedAt: new Date().toISOString(),
    };

    const updatedBadges = [...badges, newBadge];
    setBadges(updatedBadges);
    
    // Set newly unlocked badge for celebration
    setNewlyUnlockedBadge(badgeId);

    const { error } = await supabase
      .from("user_profiles")
      .update({ badges: JSON.parse(JSON.stringify(updatedBadges)) as Json })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error unlocking badge:", error);
    }
    
    return newBadge;
  }, [user, badges]);

  // Clear newly unlocked badge
  const clearNewlyUnlockedBadge = useCallback(() => {
    setNewlyUnlockedBadge(null);
  }, []);

  // Update aura score with streak multiplier
  const incrementAuraScore = useCallback(async (amount: number) => {
    if (!user) return;

    // Apply streak multiplier
    const multiplier = getStreakMultiplier(streak);
    const adjustedAmount = Math.round(amount * multiplier);
    
    const newScore = auraScore + adjustedAmount;
    const previousLevel = previousLevelRef.current;
    const newLevel = getAuraLevel(newScore);
    
    // Check for level up
    if (previousLevel && previousLevel.level !== newLevel.level) {
      setLevelUpInfo(newLevel);
    }
    
    setAuraScore(newScore);
    previousLevelRef.current = newLevel;

    const { error } = await supabase
      .from("user_profiles")
      .update({ aura_score: newScore })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating aura score:", error);
    }
  }, [user, auraScore, streak]);

  // Check for Consistent Cultivator badge when streak changes
  useEffect(() => {
    if (streak >= 7 && !badges.some((b) => b.id === "consistent_cultivator")) {
      unlockBadge("consistent_cultivator");
    }
  }, [streak, badges, unlockBadge]);

  const clearLevelUp = useCallback(() => {
    setLevelUpInfo(null);
  }, []);

  // Water the vine - grants +25 XP and protects streak, with 5% glimmer chance
  const waterVine = useCallback(async () => {
    if (!user || hasWateredToday) return;

    const today = format(new Date(), "yyyy-MM-dd");
    
    // 5% chance for glimmer effect (24 hours)
    const gotGlimmer = Math.random() < 0.05;
    const glimmerUntil = gotGlimmer ? addHours(new Date(), 24).toISOString() : null;
    
    // Update local state
    setHasWateredToday(true);
    setIsWithered(false);
    setIsStreakFrozen(true); // Streak is now protected
    
    if (gotGlimmer) {
      setHasGlimmer(true);
      toast({
        title: "✨ Rare Glimmer!",
        description: "Your vine sparkles with magical energy for 24 hours!",
      });
    }
    
    // Grant XP bonus
    await incrementAuraScore(25);
    
    // Update database
    const { error } = await supabase
      .from("user_profiles")
      .update({
        last_watered_date: today,
        streak_frozen: true,
        last_active_date: today,
        glimmer_until: glimmerUntil,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error watering vine:", error);
    }

    // Check for Lifeguard badge (save 10+ day streak with freeze)
    if (streak >= 10 && !badges.some((b) => b.id === "lifeguard")) {
      unlockBadge("lifeguard");
    }

    toast({
      title: "🌊 Vine Watered!",
      description: "+25 XP bonus! Your streak is protected for today.",
    });
  }, [user, hasWateredToday, incrementAuraScore, streak, badges, unlockBadge, toast]);

  // Unfreeze streak when tasks are completed
  const unfreezeStreak = useCallback(async () => {
    if (!user || !isStreakFrozen) return;

    setIsStreakFrozen(false);
    
    const { error } = await supabase
      .from("user_profiles")
      .update({ streak_frozen: false })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error unfreezing streak:", error);
    }
  }, [user, isStreakFrozen]);

  // Change vine species
  const changeVineSpecies = useCallback(async (species: VineSpecies) => {
    if (!user) return;
    
    const isFirstAlternative = vineSpecies === "ivy" && species !== "ivy";
    
    setVineSpecies(species);
    
    const { error } = await supabase
      .from("user_profiles")
      .update({ vine_species: species })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error changing species:", error);
    }
    
    // Unlock Botanist badge for first alternative species
    if (isFirstAlternative && !badges.some((b) => b.id === "botanist")) {
      unlockBadge("botanist");
      toast({
        title: "🧑‍🌾 Botanist Badge Unlocked!",
        description: "You've cultivated your first alternative vine species!",
      });
    }
  }, [user, vineSpecies, badges, unlockBadge, toast]);

  // Increment sunshine nudges sent
  const incrementSunshineNudges = useCallback(async () => {
    if (!user) return;
    
    const newCount = sunshineNudgesSent + 1;
    setSunshineNudgesSent(newCount);
    
    const { error } = await supabase
      .from("user_profiles")
      .update({ sunshine_nudges_sent: newCount })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating sunshine nudges:", error);
    }
  }, [user, sunshineNudgesSent]);

  // Mark onboarding as complete in database
  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    
    setHasCompletedOnboarding(true);
    
    const { error } = await supabase
      .from("user_profiles")
      .update({ has_completed_onboarding: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error completing onboarding:", error);
    }
  }, [user]);

  // Handle date change
  const handleSelectDate = useCallback(async (date: Date) => {
    setSelectedDate(date);
  }, []);

  // Reload tasks when date changes - use a ref to track the previous date
  const previousDateRef = useRef<string | null>(null);
  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    if (user && !isLoading && previousDateRef.current !== null && previousDateRef.current !== dateStr) {
      loadTasks();
    }
    previousDateRef.current = dateStr;
  }, [selectedDate, user, isLoading, loadTasks]);

  // Check for Super Bloom on admin first login - runs only once
  const superBloomCheckedRef = useRef(false);
  useEffect(() => {
    const checkSuperBloom = async () => {
      if (!user || superBloomCheckedRef.current) return;
      superBloomCheckedRef.current = true;
      
      const superBloomKey = `aura-super-bloom-shown-${user.id}`;
      const wasShown = localStorage.getItem(superBloomKey);
      
      if (wasShown) return;
      
      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
      
      if (isAdmin) {
        localStorage.setItem(superBloomKey, 'true');
        setShowSuperBloom(true);
      }
    };
    
    if (!isLoading && user) {
      checkSuperBloom();
    }
  }, [user, isLoading]);

  const clearSuperBloom = useCallback(() => {
    setShowSuperBloom(false);
  }, []);

  return {
    tasks,
    setTasks,
    auraScore,
    setAuraScore: incrementAuraScore,
    streak,
    badges,
    selectedDate,
    setSelectedDate: handleSelectDate,
    isLoading,
    isSyncing,
    addTask,
    updateTask,
    loadTasks,
    unlockBadge,
    levelUpInfo,
    clearLevelUp,
    // Badge celebration exports
    newlyUnlockedBadge,
    clearNewlyUnlockedBadge,
    // New watering/freeze exports
    hasWateredToday,
    isStreakFrozen,
    isWithered,
    waterVine,
    unfreezeStreak,
    // Species exports
    vineSpecies,
    changeVineSpecies,
    hasGlimmer,
    // Grove exports
    sunshineNudgesSent,
    incrementSunshineNudges,
    // Super Bloom exports
    showSuperBloom,
    clearSuperBloom,
    // Onboarding exports
    hasCompletedOnboarding,
    isProfileLoaded,
    completeOnboarding,
  };
};
